import React from "react";
import { DeleteIcon } from "@webiny/ui/List/DataList/icons";
import { ButtonIcon, ButtonSecondary } from "@webiny/ui/Button";
import { ReactComponent as AddIcon } from "@webiny/app-admin/assets/icons/add-18px.svg";
import {
    DataList,
    ScrollList,
    ListItem,
    ListItemText,
    ListItemMeta,
    ListActions
} from "@webiny/ui/List";
import { useDataUploadsDataList } from "./hooks/useDataUploadsDataList";

/**
 * Renders a list of all DataUpload entries. Includes basic deletion, pagination, and sorting capabilities.
 * The data querying functionality is located in the `useDataUploadsDataList` React hook.
 */

// By default, we are able to sort entries by time of creation (ascending and descending).
// More sorters can be added, but not that further adjustments will be needed on the GraphQL API side.
const sorters = [
    {
        label: "Newest to oldest",
        value: "createdOn_DESC"
    },
    {
        label: "Oldest to newest",
        value: "createdOn_ASC"
    }
];

const DataUploadsDataList: React.FC = () => {
    const {
        dataUploads,
        loading,
        refresh,
        pagination,
        setSort,
        newDataUpload,
        editDataUpload,
        deleteDataUpload,
        currentDataUploadId
    } = useDataUploadsDataList();

    return (
        <DataList
            title={"Data Uploads"}
            data={dataUploads}
            loading={loading}
            refresh={refresh}
            pagination={pagination}
            sorters={sorters}
            setSorters={setSort}
            actions={
                <ButtonSecondary onClick={newDataUpload}>
                    <ButtonIcon icon={<AddIcon />} />
                    New Data Upload
                </ButtonSecondary>
            }
        >
            {({ data }: { data: any[] }) => (
                <ScrollList>
                    {data.map(item => (
                        <ListItem key={item.id} selected={item.id === currentDataUploadId}>
                            <ListItemText onClick={() => editDataUpload(item.id)}>
                                {item.title}
                            </ListItemText>

                            <ListItemMeta>
                                <ListActions>
                                    <DeleteIcon onClick={() => deleteDataUpload(item)} />
                                </ListActions>
                            </ListItemMeta>
                        </ListItem>
                    ))}
                </ScrollList>
            )}
        </DataList>
    );
};

export default DataUploadsDataList;
