import React from 'react'
import { FullFormProps } from '../../../components/FullForm/FullForm'
import { FullForm } from '../../../components/FullForm/FullForm'

const FullFormComponent = (props: FullFormProps) => <FullForm {...props} 
  showJoins={true}
  showColumns={true}
  showWheres={true}
  showGroupBy={true}
  showSources={true}
  
/>

export const getFormComponent = (dataViewTemplate: string) => {
  switch (dataViewTemplate) {
    case 'groupBy':
      const GroupComponent = (props: FullFormProps) => (
        <FullForm
          {...props}
          showJoins={false}
          showColumns={true}
          showWheres={true}
          showGroupBy={true}
          showSources={true}
        />
      )
      return GroupComponent
    case 'combine':
      const CombineComponent = (props: FullFormProps) => (
        <FullForm
          {...props}
          showJoins={true}
          showColumns={true}
          showWheres={true}
          showGroupBy={false}
          showSources={true}
        />
      )
      return CombineComponent
    case 'publish':
      const PublishComponent = (props: FullFormProps) => (
        <FullForm
          {...props}
          showJoins={false}
          showColumns={true}
          showWheres={true}
          showGroupBy={false}
          showSources={true}
          showSimpleColumns={true}
        />
      )
      return PublishComponent
    case 'full':
    case 'verbose':
    default:
      return FullFormComponent
  }
}
