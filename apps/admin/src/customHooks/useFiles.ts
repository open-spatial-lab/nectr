import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

const GET_FILES = gql`
  query GetFiles {
    fileManager {
      listFiles {
        data {
          name
          key
          id
        }
      }
    }
  }
`

export const useFiles = (validation: (entry: any) => boolean) => {
  const { data, loading, error } = useQuery(GET_FILES)
  const fileEntries = data?.fileManager?.listFiles?.data
  const files = fileEntries?.filter(validation)
  return { files, loading, error }
}
