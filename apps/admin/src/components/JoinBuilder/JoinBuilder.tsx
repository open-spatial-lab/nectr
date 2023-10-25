import React from "react"
import { Cell } from "@webiny/ui/Grid"
import { ButtonPrimary, ButtonSecondary, IconButton } from "@webiny/ui/Button"
import { JoinQuery, SourceMeta } from "../QueryBuilder/types"
import SourceSelector from "../SourceSelector"
import { ColumnSelect } from "../ColumnSelect"
import { ColumnSchema } from "../../plugins/scaffolds/dataUploads/types"
import { ReactComponent as TrashIcon } from "../../assets/trash.svg"
import { ReactComponent as Equals } from "../../assets/equals.svg"
import { Stack } from "@mui/material"
import JoinTypeSelector from "../ JoinTypeSelector"
import { CompactGrid } from "../SplitView/NoPaddingGrid"

export type JoinBuilderProps = {
  joins: JoinQuery[]
  currentSources: SourceMeta[]
  availableSources: SourceMeta[]
  onChange: (sources: JoinQuery[]) => void
}
export type JoinRowProps = {
  join: JoinQuery
  currentSources: SourceMeta[]
  availableSources: SourceMeta[]
  onChange: <T extends keyof JoinQuery>(
    property: T,
    value: JoinQuery[T]
  ) => void
  onRemove: () => void
}
export type JoinColumnSelectorProps = {
  leftOn: string
  rightOn: string
  leftSource?: SourceMeta
  rightSource?: SourceMeta
  onChange: (property: "leftOn" | "rightOn", value: string) => void
  onRemove: () => void
}

export const JoinBuilder = ({
  joins,
  currentSources,
  availableSources,
  onChange,
}: JoinBuilderProps) => {
  const addJoin = () => {
    onChange([
      ...joins,
      {
        leftSourceId: currentSources[0].id,
        leftOn: [currentSources[0].columns[0].name],
        rightSourceId: availableSources[0].id,
        rightOn: [availableSources[0].columns[0].name],
        operator: "left",
      },
    ])
  }
  const updateJoinAtIndex =
    (index: number) =>
    <T extends keyof JoinQuery>(property: T, value: JoinQuery[T]) => {
      joins[index][property] = value
      onChange([...joins])
    }

  const removeJoinAtIndex = (index: number) => () => {
    onChange([...joins.slice(0, index), ...joins.slice(index + 1)])
  }

  return (
    <CompactGrid>
      {joins.map((join, index) => (
        <JoinRow
          key={`${index}`}
          join={join}
          currentSources={currentSources}
          availableSources={availableSources}
          onChange={updateJoinAtIndex(index)}
          onRemove={removeJoinAtIndex(index)}
        />
      ))}
      <Cell span={12} style={{ padding: "1rem 0" }}>
        <ButtonPrimary style={{ width: "100%" }} onClick={addJoin}>
          Combine More Data
        </ButtonPrimary>
      </Cell>
    </CompactGrid>
  )
}

export const JoinRow: React.FC<JoinRowProps> = ({
  join,
  currentSources,
  availableSources,
  onChange,
  onRemove,
}) => {
  console.log(join)
  const allSources = [...currentSources, ...availableSources]
  const leftSource = currentSources.find(
    (source) => source.id === join.leftSourceId
  )
  const rightSource = allSources.find(
    (source) => source.id === join.rightSourceId
  )

  if (!leftSource || !rightSource) {
    return (
      <div>
        Warning: Sources not found. Changes in other datasets may have broken
        this data view.
      </div>
    )
  }

  const rightSources = rightSource
    ? [...availableSources, rightSource]
    : availableSources
  const leftSources = currentSources.filter(
    (source) => source.id !== join.rightSourceId
  )

  const changeAtRowIndex =
    (index: number) => (property: "leftOn" | "rightOn", value: string) => {
      const oldValue = join[property]
      oldValue[index] = value
      onChange(property, oldValue)
    }

  const repeatAtLandR = (callback: (property: keyof JoinQuery) => void) => {
    ["leftOn", "rightOn"].forEach((_prop) => {
      const prop = _prop as keyof JoinQuery
      callback(prop)
    })
  }
  const removeAtRowIndex = (index: number) => () => {
    repeatAtLandR((prop) => {
      const oldValueL = join[prop]
      const newValueL = [
        ...(oldValueL?.slice(0, index) || []),
        ...(oldValueL?.slice(index + 1) || []),
      ] as JoinQuery[typeof prop]
      onChange(prop, newValueL)
    })
  }

  const addRow = () => {
    repeatAtLandR((prop) => {
      const source = prop === "leftOn" ? leftSource : rightSource
      const oldValue = join[prop] as string[]
      const newValue = [...(oldValue || []), source.columns[0].name]
      onChange(prop, newValue)
    })
  }
  const rows = Math.min(join.leftOn.length, join.rightOn.length)
  const rowsArray = [...Array(rows).keys()]

  return (
    <React.Fragment>
      <Cell span={6}>
        <SourceSelector
          sources={leftSources}
          value={leftSource}
          onChange={(source) => onChange("leftSourceId", source.id)}
        />
      </Cell>
      <Cell span={6}>
        <SourceSelector
          sources={rightSources}
          value={rightSources.find(
            (source) => source.id === join.rightSourceId
          )}
          onChange={(source) => onChange("rightSourceId", source.id)}
        />
      </Cell>
      {/* <Cell span={12}>
        Column matching:
      </Cell> */}
      {rowsArray.map((rowIndex) => (
        <JoinColumnSelector
          key={`${rowIndex}`}
          leftOn={join.leftOn[rowIndex]}
          rightOn={join.rightOn[rowIndex]}
          leftSource={leftSource}
          rightSource={rightSource}
          onChange={changeAtRowIndex(rowIndex)}
          onRemove={removeAtRowIndex(rowIndex)}
        />
      ))}

      <Cell span={6}>
        <JoinTypeSelector
          join={join}
          onChange={(operator) => onChange("operator", operator)}
        />
      </Cell>
      <Cell span={3}>
        <ButtonSecondary onClick={addRow}>
          Match Additional Columns
        </ButtonSecondary>
      </Cell>
      <Cell span={3}>
        <ButtonSecondary onClick={onRemove}>
          Remove this data combination
        </ButtonSecondary>
      </Cell>
      <Cell span={12}>
        <hr style={{ margin: "2rem 0" }} />
      </Cell>
    </React.Fragment>
  )
}

export const JoinColumnSelector: React.FC<JoinColumnSelectorProps> = ({
  leftOn,
  rightOn,
  leftSource,
  rightSource,
  onChange,
  onRemove,
}) => {
  const leftColumn = leftSource?.columns.find(
    (column) => column.name === leftOn
  )
  const rightColumn = rightSource?.columns.find(
    (column) => column.name === rightOn
  )
  return (
    <React.Fragment>
      <Cell span={5} style={{ padding: 0, margin: 0 }}>
        <ColumnSelect
          columns={(leftSource?.columns || []) as ColumnSchema[]}
          value={[leftColumn as ColumnSchema]}
          onChange={(column) => onChange("leftOn", column[0].name)}
          compact
        />
      </Cell>
      <Cell span={1} style={{ padding: 0, margin: 0 }}>
        <Stack
          justifyContent="center"
          alignItems="center"
          direction="row"
          sx={{ height: "100%" }}
        >
          <Equals />
        </Stack>
      </Cell>
      <Cell span={5} style={{ padding: 0, margin: 0 }}>
        <ColumnSelect
          disabled={false}
          columns={(rightSource?.columns || []) as ColumnSchema[]}
          value={[rightColumn as ColumnSchema]}
          onChange={(column) => onChange("rightOn", column[0].name)}
          compact
        />
      </Cell>
      <Cell span={1} style={{ padding: 0, margin: 0 }}>
        <Stack
          justifyContent="center"
          alignItems="center"
          direction="row"
          sx={{ height: "100%" }}
        >
          <IconButton
            icon={<TrashIcon />}
            label="Delete Column Match"
            onClick={onRemove}
          />
        </Stack>
      </Cell>
    </React.Fragment>
  )
}
