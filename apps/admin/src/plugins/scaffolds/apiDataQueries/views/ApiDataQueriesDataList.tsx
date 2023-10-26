import React from 'react'
import { DeleteIcon } from '@webiny/ui/List/DataList/icons'
import { ButtonIcon, ButtonPrimary, ButtonSecondary } from '@webiny/ui/Button'
import { ReactComponent as AddIcon } from '@webiny/app-admin/assets/icons/add-18px.svg'
import {
  DataList,
  // ScrollList,
  ListItem,
  ListItemText,
  ListItemMeta,
  ListActions
} from '@webiny/ui/List'
import { useApiDataQueriesDataList } from './hooks/useApiDataQueriesDataList'
import { Stack } from '@mui/material'
import styled from '@emotion/styled'

const HeavyText = styled('span')`
  font-weight: bold;
  font-size:1.5rem;
`
/**
 * Renders a list of all ApiDataQuery entries. Includes basic deletion, pagination, and sorting capabilities.
 * The data querying functionality is located in the `useApiDataQueriesDataList` React hook.
 */

// By default, we are able to sort entries by time of creation (ascending and descending).
// More sorters can be added, but not that further adjustments will be needed on the GraphQL API side.
const sorters = [
  {
    label: 'Title A-Z',
    value: 'title_ASC'
  },
  {
    label: 'Title Z-A',
    value: 'title_DESC'
  },
  {
    label: 'Newest to oldest',
    value: 'createdOn_DESC'
  },
  {
    label: 'Oldest to newest',
    value: 'createdOn_ASC'
  }
]

const sort = (data: any, sortLabel: String) => {
  switch (sortLabel) {
    case 'title_ASC':
      return data.sort((a: any, b: any) => a.title.localeCompare(b.title))
    case 'title_DESC':
      return data.sort((a: any, b: any) => b.title.localeCompare(a.title))
    default:
        return data
  }}

const ApiDataQueriesDataList: React.FC<{ onHide: () => void }> = ({ onHide }) => {
  const {
    apiDataQueries: _apiDataQueries,
    loading,
    refresh,
    pagination,
    setSort,
    newApiDataQuery,
    editApiDataQuery,
    deleteApiDataQuery,
    currentApiDataQueryId,
    variables
  } = useApiDataQueriesDataList()
  const apiDataQueries = sort(_apiDataQueries, variables.sort)
  return (
    <DataList
      title={'Data Views'}
      data={apiDataQueries}
      loading={loading}
      refresh={refresh}
      pagination={pagination}
      sorters={sorters}
      setSorters={setSort}
      actions={
        <Stack direction="row" spacing={1}>
          <ButtonPrimary
            onClick={() => {
              newApiDataQuery()
              onHide()
            }}
          >
            <ButtonIcon icon={<AddIcon />} />
            New Data View
          </ButtonPrimary>
          <ButtonSecondary onClick={onHide} aria-label="Hide List">
            <HeavyText>&times;</HeavyText>
          </ButtonSecondary>
        </Stack>
      }
    >
      {({ data }: { data: any[] }) => (
        <>
          {data.map(item => (
            <ListItem
              onClick={() => editApiDataQuery(item.id)}
              key={item.id}
              selected={item.id === currentApiDataQueryId}
            >
              <ListItemText>{item.title}</ListItemText>

              <ListItemMeta>
                <ListActions>
                  <DeleteIcon onClick={() => deleteApiDataQuery(item)} />
                </ListActions>
              </ListItemMeta>
            </ListItem>
          ))}
        </>
      )}
    </DataList>
  )
}

export default ApiDataQueriesDataList
