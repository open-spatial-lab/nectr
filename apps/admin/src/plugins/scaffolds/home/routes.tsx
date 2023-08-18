import React, { Suspense } from 'react'
import Helmet from 'react-helmet'
import { Route } from '@webiny/react-router'
import { CircularProgress } from '@webiny/ui/Progress'
import { AdminLayout } from '@webiny/app-admin/components/AdminLayout'
import { RoutePlugin } from '@webiny/app/plugins/RoutePlugin'
import Welcome from './components/Home'

/**
 * Registers new "data-views" route.
 */

const Loader: React.FC = ({ children, ...props }) => (
  <Suspense fallback={<CircularProgress />}>
    {React.cloneElement(children as unknown as React.ReactElement, props)}
  </Suspense>
)

export default new RoutePlugin({
  route: (
    <Route
      path={'/'}
      exact
      render={() => (
        <AdminLayout>
          <Helmet>
            <title>Api Data Queries</title>
          </Helmet>
          <Loader>
            <Welcome/>
          </Loader>
        </AdminLayout>
      )}
    />
  )
})
