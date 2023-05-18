import React from "react";
import { SplitView, LeftPanel, RightPanel } from "@webiny/app-admin/components/SplitView";
import DatasetsDataList from "./DatasetsDataList";
import DatasetsForm from "./DatasetsForm";

/**
 * Main view component - renders data list and form.
 */

const DatasetsView: React.FC = () => {
    return (
        <SplitView>
            <LeftPanel>
                <DatasetsDataList />
            </LeftPanel>
            <RightPanel>
                <DatasetsForm />
            </RightPanel>
        </SplitView>
    );
};

export default DatasetsView;
