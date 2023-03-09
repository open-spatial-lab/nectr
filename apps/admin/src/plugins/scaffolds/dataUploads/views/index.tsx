import React from "react";
import { SplitView, LeftPanel, RightPanel } from "@webiny/app-admin/components/SplitView";
import DataUploadsDataList from "./DataUploadsDataList";
import DataUploadsForm from "./DataUploadsForm";

/**
 * Main view component - renders data list and form.
 */

const DataUploadsView: React.FC = () => {
    return (
        <SplitView>
            <LeftPanel>
                <DataUploadsDataList />
            </LeftPanel>
            <RightPanel>
                <DataUploadsForm />
            </RightPanel>
        </SplitView>
    );
};

export default DataUploadsView;
