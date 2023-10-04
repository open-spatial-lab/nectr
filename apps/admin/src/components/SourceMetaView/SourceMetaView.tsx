import React from 'react'
import { SourceMeta } from '../QueryBuilder/types'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import { ReactComponent as InfoIcon } from '../../assets/info.svg'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

type SourceMetaViewProps = {
  source?: SourceMeta
}

export const SourceMetaView = ({ source }: SourceMetaViewProps) => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const toggleDialog = () => setDialogOpen(o => !o)
  if (!source) {
    return null
  }

  return (
    <>
      <Tooltip title={`Data Description: ${source.title}`}>
        <Button onClick={toggleDialog}>
          <InfoIcon />
        </Button>
      </Tooltip>

      <Dialog onClose={toggleDialog} open={dialogOpen} fullWidth>
        <DialogTitle>{source.title}</DialogTitle>

        <IconButton
          aria-label="close"
          onClick={toggleDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
        <div style={{ padding: '1rem' }}>
          <p>{source.type}</p>

          <table style={{ width: '100%' }}>
            <tbody>
              {source?.columns &&
                source.columns.map(column => (
                  <tr
                    key={column.name}
                    style={{ borderBottom: '1px solid gray', paddingBottom: '0.5rem' }}
                  >
                    <td style={{ fontWeight: 'bold', paddingRight: '0.5rem' }}>{column.name}</td>
                    <td>{column.description}</td>
                  </tr>
                ))}
            </tbody>{' '}
          </table>
        </div>
      </Dialog>
    </>
  )
}
