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
import { useDatasetsDataList } from './hooks/useDatasetsDataList'

/**
 * Renders a list of all Dataset entries. Includes basic deletion, pagination, and sorting capabilities.
 * The data querying functionality is located in the `useDatasetsDataList` React hook.
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

const DatasetsDataList: React.FC = () => {
  const {
    datasets,
    loading,
    refresh,
    pagination,
    setSort,
    newDataset,
    editDataset,
    deleteDataset,
    currentDatasetId
  } = useDatasetsDataList()

  return (
    <DataList
      title={'Datasets'}
      data={datasets}
      loading={loading}
      refresh={refresh}
      pagination={pagination}
      sorters={sorters}
      setSorters={setSort}
      actions={
        <ButtonSecondary onClick={newDataset}>
          <ButtonIcon icon={<AddIcon />} />
          New Dataset
        </ButtonSecondary>
      }
    >
      {({ data }: { data: any[] }) => (
        <ScrollList>
          {data.map(item => (
            <ListItem key={item.id} selected={item.id === currentDatasetId}>
              <ListItemText onClick={() => editDataset(item.id)}>{item.title}</ListItemText>

              <ListItemMeta>
                <ListActions>
                  <DeleteIcon onClick={() => deleteDataset(item)} />
                </ListActions>
              </ListItemMeta>
            </ListItem>
          ))}
        </ScrollList>
      )}
    </DataList>
  )
}

export default DatasetsDataList
