import React from 'react'
import { DeleteIcon } from '@webiny/ui/List/DataList/icons'
import { ButtonIcon, ButtonSecondary } from '@webiny/ui/Button'
import { ReactComponent as AddIcon } from '@webiny/app-admin/assets/icons/add-18px.svg'
import {
  DataList,
  ScrollList,
  ListItem,
  ListItemText,
  ListItemMeta,
  ListActions
} from '@webiny/ui/List'
import { useApiDataQueriesDataList } from './hooks/useApiDataQueriesDataList'

/**
 * Renders a list of all ApiDataQuery entries. Includes basic deletion, pagination, and sorting capabilities.
 * The data querying functionality is located in the `useApiDataQueriesDataList` React hook.
 */

// By default, we are able to sort entries by time of creation (ascending and descending).
// More sorters can be added, but not that further adjustments will be needed on the GraphQL API side.
const sorters = [
  {
    label: 'Newest to oldest',
    value: 'createdOn_DESC'
  },
  {
    label: 'Oldest to newest',
    value: 'createdOn_ASC'
  }
]

const ApiDataQueriesDataList: React.FC = () => {
  const {
    apiDataQueries,
    loading,
    refresh,
    pagination,
    setSort,
    newApiDataQuery,
    editApiDataQuery,
    deleteApiDataQuery,
    currentApiDataQueryId
  } = useApiDataQueriesDataList()

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
        <ButtonSecondary onClick={newApiDataQuery}>
          <ButtonIcon icon={<AddIcon />} />
          New Data View
        </ButtonSecondary>
      }
    >
      {({ data }: { data: any[] }) => (
        <ScrollList>
          {data.map(item => (
            <ListItem key={item.id} selected={item.id === currentApiDataQueryId}>
              <ListItemText onClick={() => editApiDataQuery(item.id)}>{item.title}</ListItemText>

              <ListItemMeta>
                <ListActions>
                  <DeleteIcon onClick={() => deleteApiDataQuery(item)} />
                </ListActions>
              </ListItemMeta>
            </ListItem>
          ))}
        </ScrollList>
      )}
    </DataList>
  )
}

export default ApiDataQueriesDataList
