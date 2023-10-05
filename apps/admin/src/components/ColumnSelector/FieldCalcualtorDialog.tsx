import React from 'react'
import { MetaColumnSchema, SourceMeta } from '../QueryBuilder/types'
import { Dialog, DialogContent, DialogTitle, TextField } from '@mui/material'
import { Grid, Cell} from '@webiny/ui/Grid'
import { NoPaddingGrid } from '../SplitView'
import TextareaAutosize from '@mui/material/TextareaAutosize';
import styled from '@emotion/styled'
const blue = {
  100: '#DAECFF',
  200: '#b6daff',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75',
};

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
  900: '#24292f',
};

const StyledTextarea = styled(TextareaAutosize)`
width: 100%;
font-family: IBM Plex Mono, Courier New, monospace;
font-size: 0.875rem;
font-weight: 700;
line-height: 1.5;
padding: 12px;
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
}> = ({ onAdd, onClose, sources }) => {
  const [fieldText, setFieldText] = React.useState('')
  return <Dialog open={true} fullWidth onClose={onClose}>
    <DialogTitle>Field Calculator</DialogTitle>
    <DialogContent>
      <NoPaddingGrid>
        <Cell span={8}>
        <StyledTextarea aria-label="empty textarea" value={fieldText} onChange={((e) => setFieldText(e.target.value))} />
        </Cell>
      </NoPaddingGrid>
    </DialogContent>
  </Dialog>
}

