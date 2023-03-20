import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

const GET_FILES = gql`
    query GetFiles {
        fileManager {
            listFiles {
                data {
                    name
                }
            }
        }
    }
`;

const VALID_DATA_TYPES = [".csv", ".json", ".parquet"];

const validateFileName = (name: string) => (
    VALID_DATA_TYPES.some((type: string) => name.endsWith(type))
)

export const useFiles = () => {
    const { data, loading, error } = useQuery(GET_FILES);
    const fileEntries = data?.fileManager?.listFiles?.data;
    const files = fileEntries
        ?.map(({ name }: { name: string }) => name)
        .filter(validateFileName);
    return { files, loading, error };
};
