import React from 'react'
import AdminSqlConsole from './AdminSqlConsole'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient()
/**
 * Main view component - renders data list and form.
 */

const DatasetsView: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminSqlConsole />
    </QueryClientProvider>
  )
}

export default DatasetsView
