import React, { Suspense, lazy } from "react";
import Helmet from "react-helmet";
import { Route } from "@webiny/react-router";
import { CircularProgress } from "@webiny/ui/Progress";
import { AdminLayout } from "@webiny/app-admin/components/AdminLayout";
import { RoutePlugin } from "@webiny/app/plugins/RoutePlugin";

/**
 * Registers new "/data-uploads" route.
 */

const Loader: React.FC = ({ children, ...props }) => (
    <Suspense fallback={<CircularProgress />}>
        {React.cloneElement(children as unknown as React.ReactElement, props)}
    </Suspense>
);

const DataUploads = lazy(() => import("./views"));

export default new RoutePlugin({
    route: (
        <Route
            path={"/data-uploads"}
            exact
            render={() => (
                <AdminLayout>
                    <Helmet>
                        <title>Data Uploads</title>
                    </Helmet>
                    <Loader>
                        <DataUploads />
                    </Loader>
                </AdminLayout>
            )}
        />
    )
});
