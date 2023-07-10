import React from "react";
// import { SplitView, LeftPanel, RightPanel } from "@webiny/app-admin/components/SplitView";
import ApiDataQueriesDataList from "./ApiDataQueriesDataList";
import ApiDataQueriesForm from "./ApiDataQueriesForm";
import { CollapsibleSplitView, CollapsibleLeftPanel, CollapsibleRightPanel } from "../../../../components/CollapsibleSplitView"

/**
 * Main view component - renders data list and form.
 */

const ApiDataQueriesView: React.FC = () => {
    const [showLeftPanel, setShowLeftPanel] = React.useState(false);
    
    return (
        <CollapsibleSplitView>
            <CollapsibleLeftPanel expanded={showLeftPanel} onToggle={() => setShowLeftPanel(p => !p)} title="Data Views">
                <ApiDataQueriesDataList />
            </CollapsibleLeftPanel>
            <CollapsibleRightPanel expanded={!showLeftPanel} >
                <ApiDataQueriesForm />
            </CollapsibleRightPanel>
        </CollapsibleSplitView>
    );
};

export default ApiDataQueriesView;
