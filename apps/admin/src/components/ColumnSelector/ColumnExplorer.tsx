import React from 'react'
import { ColumnSchema, SourceMeta } from '../QueryBuilder/types'
import { NoPaddingGrid } from '../SplitView'
import { List, ListItem, ListItemText, ListItemTextSecondary, ListItemMeta } from '@webiny/ui/List'
import { Cell } from '@webiny/ui/Grid'
import { IconButton } from '@webiny/ui/Button'

export const ColumnExplorer: React.FC<{
  sources: SourceMeta[]
  onClick: (value: ColumnSchema, source?: SourceMeta) => void
  frontIcon?: React.ReactNode
  backIcon?: React.ReactNode
  currentColumn?: string
  currentSourceId?: string
  showDerived?: boolean
}> = ({ sources, onClick, backIcon, currentColumn, currentSourceId, showDerived=false }) => {
  const [currentSource, setCurrentSource] = React.useState<SourceMeta | null>(sources?.[0] || null)
  const currentSourceColumns = currentSource?.columns || []
  const cleanedSources = showDerived ? sources : sources.filter(s => s.id !== "derived")
  return (
    <NoPaddingGrid>
      <Cell span={6}>
        <List>
          <ListItem style={{ fontWeight: 'bold', pointerEvents: 'none' }}>
            <ListItemText>Data Sources</ListItemText>
          </ListItem>
          {cleanedSources.map((source, idx) => (
            <ListItem
              key={`${source?.id}${idx}`}
              style={{
                borderBottom: '1px solid rgba(0,0,0,0.5)',
                backgroundColor:
                  currentSource?.id === source?.id ? 'var(--highlighted)' : 'transparent'
              }}
              onClick={() => setCurrentSource(source)}
            >
              <ListItemText>{source.title}</ListItemText>
            </ListItem>
          ))}
        </List>
      </Cell>
      <Cell span={6}>
        <List>
          <ListItem style={{ fontWeight: 'bold', pointerEvents: 'none' }}>
            <ListItemText>{currentSource?.title || ''} Columns</ListItemText>
          </ListItem>
          <div style={{ height: '30vh', overflowY: 'auto' }}>
            {currentSourceColumns.map((column, idx) => (
              <ListItem
                key={`${column?.name}${idx}`}
                onClick={() => currentSource && onClick(column, currentSource)}
                style={{
                  paddingTop: '.5rem',
                  paddingBottom: '.5rem',
                  background:
                    currentSourceId === currentSource?.id && column.name == currentColumn
                      ? 'var(--highlighted)'
                      : 'transparent'
                }}
              >
                <ListItemText>
                  {column.name}
                  <ListItemTextSecondary>{column.description}</ListItemTextSecondary>
                </ListItemText>
                <ListItemMeta>
                  {!!backIcon && (
                    <IconButton icon={backIcon} label={`Add ${column.name} to data view`} />
                  )}
                </ListItemMeta>
              </ListItem>
            ))}
          </div>
        </List>
      </Cell>
    </NoPaddingGrid>
  )
}
