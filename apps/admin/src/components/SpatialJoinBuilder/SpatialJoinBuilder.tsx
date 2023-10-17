import React, { useEffect } from 'react'
import { NoPaddingGrid } from '../SplitView'
import { Cell } from '@webiny/ui/Grid'
import { SpatialJoinBuilderProps } from './types'
import { JoinQuery } from '../QueryBuilder'
import { ColumnSchema } from '../../plugins/scaffolds/dataUploads/types'
import { ColumnSelect } from '../ColumnSelect'
import { Stack, Button } from '@mui/material'
import SourceSelector from '../SourceSelector'
import JoinTypeSelector from '../ JoinTypeSelector'
import GeometricPredicateSelector from '../GeometricPredicateSelector'

const findGeoColumn = (columns: ColumnSchema[]) => {
  const geoTyped = columns.find(
    c => c?.type?.includes('WKB') || c?.type?.includes('WKT') || c?.type?.includes('GeoJSON')
  )
  if (geoTyped) {
    return geoTyped
  }
  const geoNamed = columns.find(c => c.name.toLowerCase().includes('geo'))
  if (geoNamed) {
    return geoNamed
  }
  return columns[0]
}

const conversionFunctionDict = {
  WKB: 'ST_GeomFromWKB',
  WKT: 'ST_GeomFromText',
  GeoJSON: 'ST_GeomFromGeoJSON'
}

const guessGeoType = (column: ColumnSchema) => {
  if (column?.type?.includes('WKB') || column?.name?.toLowerCase().includes('wkb')) {
    return 'WKB'
  }
  if (column?.type?.includes('WKT') || column?.name?.toLowerCase().includes('wkt')) {
    return 'WKT'
  }
  if (column?.type?.includes('GeoJSON') || column?.name?.toLowerCase().includes('geojson')) {
    return 'GeoJSON'
  }
  return null
}

export const GeometryInterpreter: React.FC<{ onChange: any; currentValue?: string }> = ({
  onChange,
  currentValue
}) => {
  return (
    <Stack direction="row" spacing={2}>
      {Object.entries(conversionFunctionDict).map(([key, value]) => (
        <Button
          key={key}
          variant={currentValue === value ? 'contained' : 'outlined'}
          onClick={() => onChange(value)}
        >
          {key}
        </Button>
      ))}
    </Stack>
  )
}

export const SpatialJoinBuilder: React.FC<SpatialJoinBuilderProps> = ({
  leftSource,
  rightSource,
  availableSources,
  join,
  onChange
}) => {
  const handleChange = <T extends keyof JoinQuery>(
    key: T | T[],
    value: JoinQuery[T] | JoinQuery[T][]
  ) => {
    if (Array.isArray(key) && Array.isArray(value)) {
      let newJoin = { ...join }
      key.forEach((k, i) => {
        newJoin = {
          ...newJoin,
          [k]: value[i]
        }
      })
      onChange([newJoin])
    }
    if (!Array.isArray(key)) {
      onChange([
        {
          ...join,
          [key]: value
        }
      ])
    }
  }

  useEffect(() => {
    if (Boolean(!join.leftOn) && Boolean(leftSource)) {
      // @ts-ignore
      const leftColumn = findGeoColumn(leftSource.columns)
      const geoType = guessGeoType(leftColumn)

      const keyArgs: any[] = ['leftOn', 'leftSourceId']
      const valueArgs: any[] = [leftColumn.name, leftSource.id]

      if (geoType) {
        keyArgs.push('leftOnGeo')
        valueArgs.push([{ operation: conversionFunctionDict[geoType] }])
      }

      handleChange(keyArgs, valueArgs)
    }
  }, [leftSource?.id])

  const handleOperationChange = (key: 'leftOnGeo' | 'rightOnGeo', idx: number, operation: string, args?: any[]) => {
    const currentOperation = join?.[key]?.[idx]
    if (join?.[key] === undefined || currentOperation === undefined) {
      handleChange(key, [{ operation, args }])
    } else {
      const newOperation = { ...currentOperation }
      newOperation['operation'] = operation
      args && (newOperation['args'] = args)
      // splice in the new operation
      // @ts-ignore
      const newOperations = [...join?.[key]]
      newOperations.splice(idx, 1, newOperation)
      handleChange(key, newOperations)
    }
  }
  
  if (!leftSource) {
    return null
  }
  
  return (
    <NoPaddingGrid>
      <Cell span={6}>
        <SourceSelector
          sources={[leftSource]}
          value={leftSource}
          disabled={true}
          onChange={source => handleChange('leftSourceId', source.id)}
          label="Selected Data"
        />
        <ColumnSelect
          columns={leftSource.columns}
          label={'Geometry column'}
          value={[(leftSource.columns.find(c => c.name === join.leftOn[0]) || {}) as ColumnSchema]}
          onChange={column => handleChange('leftOn', [column[0]?.name])}
        />
        <GeometryInterpreter
          onChange={(value:string) => handleOperationChange('leftOnGeo', 0, value)}
          currentValue={join?.leftOnGeo?.[0].operation}
          />
      </Cell>
      <Cell span={6}>

      <SourceSelector
          sources={rightSource ? [rightSource, ...availableSources] : availableSources}
          value={rightSource||{}}
          onChange={source => source && handleChange('rightSourceId', source.id)}
          label="Select a dataset to combine"
        />
        {rightSource !== undefined && (
          <ColumnSelect
            label={'Geometry column'}
            columns={rightSource.columns}
            value={[(rightSource.columns.find(c => c.name === join.rightOn[0]) || {}) as ColumnSchema]}
            onChange={column => handleChange('rightOn', [column[0]?.name])}
          />
        )}
        <GeometryInterpreter
          onChange={(value:string) => handleOperationChange('rightOnGeo', 0, value)}
          currentValue={join?.rightOnGeo?.[0].operation}
          />
      </Cell>
      <Cell span={8}>
          <GeometricPredicateSelector
            onChange={(value:string) => handleChange('geoPredicate', value)}
            value={join.geoPredicate}
          />
      </Cell>
      <Cell span={4}>
        <JoinTypeSelector
          join={join}
          onChange={operator => handleChange('operator', operator)}
        />
      </Cell>
    </NoPaddingGrid>
  )
}
