import React from "react";
import { SplitView, LeftPanel, RightPanel } from "@webiny/app-admin/components/SplitView";
import ApiDataQueriesDataList from "./ApiDataQueriesDataList";
import ApiDataQueriesForm from "./ApiDataQueriesForm";

/**
 * Main view component - renders data list and form.
 */

const ApiDataQueriesView: React.FC = () => {
    return (
        <SplitView>
            <LeftPanel>
                <ApiDataQueriesDataList />
            </LeftPanel>
            <RightPanel>
                <ApiDataQueriesForm />
            </RightPanel>
        </SplitView>
    );
};

export default ApiDataQueriesView;
