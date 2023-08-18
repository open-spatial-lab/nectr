import React from "react";
import { Link } from "@webiny/react-router";
import { AdminWelcomeScreenWidgetPlugin } from "@webiny/app-plugin-admin-welcome-screen/types";
import { ButtonSecondary } from "@webiny/ui/Button";
import { css } from "emotion";

const linkStyle = css({
    textDecoration: "none",
    "&:hover": {
        textDecoration: "none"
    }
});

const buttonStyle = css({
    margin: "1rem auto 1rem auto"
});

const datasetWelcomeWidget: AdminWelcomeScreenWidgetPlugin = {
    type: "admin-welcome-screen-widget",
    name: "admin-welcome-screen-widget-dataset",
    permission: "cms.endpoint.manage",
    widget: {
        cta: (
            <Link to="/datasets" className={linkStyle}>
                <ButtonSecondary className={buttonStyle}>Upload a new dataset</ButtonSecondary>
            </Link>
        ),
        description: "Upload datasets to analyze, publish, and understand.",
        title: "Datasets"
    }
};

const dataViewWelcomeWidget: AdminWelcomeScreenWidgetPlugin = {
    type: "admin-welcome-screen-widget",
    name: "admin-welcome-screen-widget-dataview",
    permission: "cms.endpoint.manage",
    widget: {
        cta: (
            <Link to="/cms/content-models" className={linkStyle}>
                <ButtonSecondary className={buttonStyle}>Build New Data View</ButtonSecondary>
            </Link>
        ),
        description: "Create views of data for public use, combine data, and do geospatial analysis.",
        title: "Data Views"
    }
};

const pageBuilderWelcomeWidget: AdminWelcomeScreenWidgetPlugin = {
    type: "admin-welcome-screen-widget",
    name: "admin-welcome-screen-widget-viz",
    permission: "cms.endpoint.manage",
    widget: {
        cta: (
            <Link to="/page-builder/pages" className={linkStyle}>
                <ButtonSecondary className={buttonStyle}>Create Data Viz or Page</ButtonSecondary>
            </Link>
        ),
        description: "Visualize your data for use anywhere on the web, or host pages here.",
        title: "Visualizations"
    }
};

export default [
    datasetWelcomeWidget,
    dataViewWelcomeWidget,
    pageBuilderWelcomeWidget    
];