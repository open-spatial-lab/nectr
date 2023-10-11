import React from 'react'
import { MetaColumnSchema, SourceMeta } from '../QueryBuilder/types'
import {
  Accordion,
  AccordionSummary,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Tooltip
} from '@mui/material'
import { Cell } from '@webiny/ui/Grid'
import { NoPaddingGrid } from '../SplitView'
import TextareaAutosize from '@mui/material/TextareaAutosize'
import styled from '@emotion/styled'
import { fieldCalculatorFunctions } from './FieldCalculatorFunctions'
import { ColumnSelector } from './ColumnSelector'
const blue = {
  100: '#DAECFF',
  200: '#b6daff',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75'
}

const grey = {
  50: '#f6f8fa',
  100: '#eaeef2',
  200: '#d0d7de',
  300: '#afb8c1',
  400: '#8c959f',
  500: '#6e7781',
  600: '#57606a',
  700: '#424a53',
  800: '#32383f',
  900: '#24292f'
}

const StyledTextarea = styled(TextareaAutosize)`
  width: 100%;
  font-family: IBM Plex Mono, Courier New, monospace;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.5;
  padding: 12px;
  margin-right: 20px;
  color: ${grey[900]};
  background: ${'#fff'};
  border: 1px solid ${grey[200]};
  box-shadow: 0px 2px 2px ${grey[50]};

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${blue[200]};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`

export const FieldCalculatorDialog: React.FC<{
  sources: SourceMeta[]
  onAdd: (column: MetaColumnSchema) => void
  onClose: () => void
  initialExpression?: string
  initialColumnName?: string
}> = ({ onAdd, onClose, sources, initialExpression, initialColumnName }) => {
  const [fieldText, setFieldText] = React.useState(initialExpression || '')
  const [columnName, setColumnName] = React.useState(initialColumnName ||  '')
  const [cursorPosition, setCursorPosition] = React.useState(0)

  const handleFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFieldText(e.target.value)
    setCursorPosition(e.target.selectionEnd)
  }
  const handleInsert = (value: string) => {
    const newText = fieldText.slice(0, cursorPosition) + value + fieldText.slice(cursorPosition)
    setFieldText(newText)
    setCursorPosition(cursorPosition + value.length)
  }

  const handleAdd = () => {
    const column: MetaColumnSchema = {
      name: columnName,
      alias: columnName,
      sourceId: sources[0].id,
      expression: fieldText,
      description: "Custom column field calculator",
      type: "Custom",
      sourceTitle: ""
    }
    onAdd(column)
    onClose()
  }

  return (
    <Dialog open={true} fullScreen onClose={onClose} sx={{ maxWidth: 'initial'}}>
      <Button variant="text" onClick={onClose} sx={{ position: "absolute", right: ".25rem", top: ".25rem" }}>&times;</Button>
      <Button variant="text" onClick={handleAdd} sx={{ position: "absolute", right: ".25rem", bottom: ".25rem" }}>{initialColumnName ? "Update " : "Add "} Column</Button>
      <DialogTitle>Field Calculator</DialogTitle>
      <DialogContent>
        <NoPaddingGrid>
          <Cell span={4} style={{ padding: '4px' }}>
            <Stack spacing={1} direction="column">
              <div>
                <p>Column Name</p>
                <TextField value={columnName} onChange={e => setColumnName(e.target.value)} />
              </div>
              <div>
                <p>Column Expression</p>
                <StyledTextarea
                  aria-label="empty textarea"
                  value={fieldText}
                  onChange={handleFieldChange}
                  // @ts-ignore
                  onClick={e => setCursorPosition(e.target.selectionEnd)}
                />
              </div>
            </Stack>
          </Cell>
          <Cell span={4} style={{padding: "4px"}}>
            <Paper elevation={2}>
              <ColumnSelector
                simple={false}
                isNested={true}
                sources={sources}
                currentColumns={[]}
                onChange={columns => columns?.[0]?.sourceId && handleInsert(`"${columns[0].sourceId}"."${columns[0].name}"`)}
                hideCurrent={true}
                hideAdvanced={true}
                />
            </Paper>
          </Cell>
          <Cell span={4} style={{ maxHeight: '80vh', overflowY: 'auto', padding: '4px' }}>
            <Paper elevation={2}>
              <h3></h3>
              {Object.entries(fieldCalculatorFunctions).map(([header, functions]) => (
                <Accordion key={header}>
                  <AccordionSummary>{header}</AccordionSummary>
                  {functions.map(func => (
                    <Chip
                      sx={{ m: 0.5 }}
                      key={`${header}-${func.value}`}
                      label={
                        <Tooltip title={func.tooltip}>
                          <p>{func.label}</p>
                        </Tooltip>
                      }
                      onClick={() => handleInsert(func.value)}
                    />
                  ))}
                </Accordion>
              ))}
            </Paper>
          </Cell>
        </NoPaddingGrid>
      </DialogContent>
    </Dialog>
  )
}
