import React from "react";
// import { SplitView, LeftPanel, RightPanel } from "@webiny/app-admin/components/SplitView";
import DataUploadsDataList from "./DataUploadsDataList";
import DataUploadsForm from "./DataUploadsForm";
import { Cell } from "@webiny/ui/Grid";
import { NoPaddingGrid, SurfaceCell } from "../../../../components/SplitView";
/**
 * Main view component - renders data list and form.
 */

const DataUploadsView: React.FC = () => {
    return (
        <NoPaddingGrid>
            <SurfaceCell span={3}>
                <DataUploadsDataList />
            </SurfaceCell>
            <Cell span={9}>
                <DataUploadsForm />
            </Cell>
        </NoPaddingGrid>
        // <SplitView>
        //     <LeftPanel style={{maxWidth: '25vw'}}>
        //         <DataUploadsDataList />
        //     </LeftPanel>
        //     <RightPanel>
        //         {/* <SplitView> */}
        //             {/* <LeftPanel> */}
        //                 <DataUploadsForm />
        //             {/* </LeftPanel> */}
        //         {/* </SplitView> */}
        //     </RightPanel>
        // </SplitView>
    );
};

export default DataUploadsView;
