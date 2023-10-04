import React from 'react'
import { useDataView } from './hooks/useDataView/useDataView'
import { CircularProgress } from '@mui/material'
import DataViewTemplates from './components/DataViewTemplates'
import { ButtonDefault as Button } from '@webiny/ui/Button'
import { NoPaddingGrid } from '../../../../components/SplitView/NoPaddingGrid'
import { Cell } from '@webiny/ui/Grid'
import { useDataViewSchema } from './hooks/useGlobalFormData'
import { useQueryBuilderPreview } from './hooks/useQueryBuilderPreview'
import { PreviewTable } from './components/PreviewTable'
import styled from '@emotion/styled'

const ScrollableCell = styled(Cell)`
  overflow: auto;
  @media (min-width: 840px)  {
    max-height: calc(100vh - 64px - 67px);
  }
`
/**
 * Renders a form which enables creating new or editing existing Api Data Query entries.
 * Includes two basic fields - title (required) and template.
 * The form submission-related functionality is located in the `useApiDataQueriesForm` React hook.
 */
const ApiDataQueriesForm: React.FC = () => {
  // For new views, saved views receive template from the server
  const [dataViewTemplate, setDataViewTemplate] = React.useState<string | undefined>(undefined)
  // show/hide preview table on right
  const [showPreview, setShowPreview] = React.useState(true)
  const { FormComponent, ...hookProps } = useDataView(dataViewTemplate)
  const { emptyViewIsShown, loading, currentApiDataQuery, apiDataQuery } = hookProps
  const { schema } = useDataViewSchema();
  const previewProps = useQueryBuilderPreview({schema});
  console.log(schema)
  
  if (!apiDataQuery && !dataViewTemplate) {
    return <DataViewTemplates setDataViewTemplate={setDataViewTemplate} />
  }

  emptyViewIsShown && currentApiDataQuery()

  if (loading) {
    return <CircularProgress />
  }
  
  return (
    <>
      {!apiDataQuery && (
        <Button onClick={() => setDataViewTemplate(undefined)}>
          &larr; Back to View Templates
        </Button>
      )}
      <NoPaddingGrid>
        <ScrollableCell span={showPreview ? 8 : 12}>
          <FormComponent {...hookProps} showPreview={showPreview} togglePreview={() => setShowPreview(p => !p)} />
        </ScrollableCell>
        {showPreview && (
          <Cell span={4}>
            <PreviewTable {...previewProps} />
          </Cell>
        )}
      </NoPaddingGrid>
    </>
  )
}

export default ApiDataQueriesForm