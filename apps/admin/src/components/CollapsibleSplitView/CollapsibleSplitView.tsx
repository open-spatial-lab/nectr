import * as React from "react";
import classSet from "classnames";
import { Cell, Grid, CellProps } from "@webiny/ui/Grid";
import { css } from "emotion";
import styled from "@emotion/styled";
import { clone } from "lodash";
import { getClasses } from "@webiny/ui/Helpers";
import { ButtonIcon, ButtonPrimary as Button } from "@webiny/ui/Button";
import { ReactComponent as RightIcon } from "@webiny/app-admin/assets/icons/round-chevron_right-24px.svg";

const grid = css({
    "&.mdc-layout-grid": {
        padding: 0,
        margin: "-3px auto 0 auto",
        backgroundColor: "var(--mdc-theme-background)",
        ">.mdc-layout-grid__inner": {
            gridGap: 0
        }
    }
});

const RightPanelWrapper = styled("div")({
    backgroundColor: "var(--mdc-theme-background)",
    overflow: "auto",
    height: "calc(100vh - 70px)"
});

type CollapsibleCellProps = CellProps & {
    expanded: boolean;
};

type LeftPanelCollabsibleCellProps = CollapsibleCellProps & {
    title: React.ReactNode;
    onToggle: () => void;
};

interface SplitViewProps {
    children: React.ReactElement<any> | React.ReactElement<any>[];
    className?: string;
}

export const leftPanel = css({
    backgroundColor: "var(--mdc-theme-surface)",
    ">.webiny-data-list": {
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 70px)",
        ".mdc-list": {
            overflow: "auto"
        }
    },
    ">.mdc-list": {
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 70px)",
        overflow: "auto"
    }
});
const CollapsibleSplitView: React.FC<SplitViewProps> = props => {
    return (
        <Grid className={classSet(grid, props.className, "webiny-split-view")}>
            {props.children}
        </Grid>
    );
};

const CollapsibleLeftPanel: React.FC<LeftPanelCollabsibleCellProps> = props => {
    const propList = clone(props);
    const { expanded, title, onToggle } = props as LeftPanelCollabsibleCellProps;
    const span = expanded ? 4 : 0;
    // @ts-ignore
    propList.expanded = propList.expanded.toString();

    return (
        <Cell
            {...getClasses(
                propList,
                classSet(leftPanel, props.className, "webiny-split-view__left-panel")
            )}
            style={{
                background: expanded ? "var(--mdc-theme-surface)" : "var(--mdc-theme-background)"
            }}
            span={span}
        >
            {expanded ? (
                <>
                    <Button style={{ margin: ".5rem 0 .5rem .5rem" }} onClick={onToggle}>
                        Hide {title}
                        <ButtonIcon icon={<RightIcon style={{ transform: "rotate(180deg)" }} />} />
                    </Button>
                    {propList.children}
                </>
            ) : (
                <Button style={{ margin: ".5rem 0 .5rem .5rem" }} onClick={onToggle}>
                    Show {title}
                    <ButtonIcon icon={<RightIcon />} />
                </Button>
            )}
        </Cell>
    );
};

const CollapsibleRightPanel: React.FC<CollapsibleCellProps> = props => {
    const propList = clone(props);
    const span = props.expanded ? 12 : 8;
    // @ts-ignore
    propList.expanded = propList.expanded.toString();

    return (
        <Cell {...getClasses(propList, "webiny-split-view__right-panel")} span={span}>
            <RightPanelWrapper
                className={"webiny-split-view__right-panel-wrapper"}
                id={"webiny-split-view-right-panel"}
            >
                {propList.children}
            </RightPanelWrapper>
        </Cell>
    );
};

export { CollapsibleSplitView, CollapsibleLeftPanel, CollapsibleRightPanel };
