import React from 'react'
import { Input } from '@webiny/ui/Input'
import { CircularProgress } from '@webiny/ui/Progress'
import { LeftPanel, RightPanel, SplitView } from '@webiny/app-admin/components/SplitView'
import { useQueryBuilderPreview } from '../../apiDataQueries/views/hooks/useQueryBuilderPreview'
import { Button } from '@mui/material'
import { PreviewTable } from '../../apiDataQueries/views/components/PreviewTable'
import { useDataView } from '../../apiDataQueries/views/hooks/useDataView'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Accordion from '@mui/material/Accordion'

const SqlTextInner = ({ setRawQuery }: { setRawQuery: (rawQuery: string) => void }) => {
  const [innerText, setInnerText] = React.useState<string>('sql query here...')
  const handleQuery = () => setRawQuery(innerText)
  return (
    <>
      <Input type="text" rows={20} value={innerText} onChange={setInnerText}/>
      <Button onClick={handleQuery} variant="contained" fullWidth sx={{mb:2, mt:1}}>Run</Button>
    </>
  )
}

const DataViewsAccordion = () => {
  const { datasets } = useDataView()
  if (!datasets) {
    return <CircularProgress />
  }

  return (
    <div>
      <h3>Available datasets (files)</h3>
      {/* @ts-ignore */}
      {datasets.map(({ title, filename, columns, id }) => {
        return (
          <Accordion key={id}>
            <AccordionSummary>{title}</AccordionSummary>
            <AccordionDetails>
              <div>
                <h3>{`'s3://%BUCKET%/${filename}'`}</h3>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  {/* @ts-ignore */}
                  {columns.map(({ name, type }) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{type}</td>
                    </tr>
                  ))}
                </table>
              </div>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </div>
  )
}
/**
 * Renders a form which enables creating new or editing existing Rawsql entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useRawsqlsForm` React hook.
 */
const AdminSqlConsole: React.FC = () => {
  const [rawQuery, setRawQuery] = React.useState<string | undefined>(undefined)
  const previewProps = useQueryBuilderPreview({ raw: rawQuery })
  return (
    <SplitView>
      <LeftPanel>
        <SqlTextInner setRawQuery={setRawQuery} />
        <hr/>
        <DataViewsAccordion />
        <hr/>
      </LeftPanel>
      <RightPanel>
        <PreviewTable {...previewProps} raw />
        <pre
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '1em',
            color: 'white',
            background: 'rgba(0,0,0,0.75)'
          }}
        >
          {JSON.stringify(previewProps, null, 2)}
        </pre>
      </RightPanel>
    </SplitView>
  )
}

export default AdminSqlConsole
