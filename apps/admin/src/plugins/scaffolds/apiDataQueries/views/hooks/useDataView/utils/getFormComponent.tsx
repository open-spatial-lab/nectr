import React from 'react'
import { FullFormProps } from '../../../components/FullForm/FullForm'
import { FullForm } from '../../../components/FullForm/FullForm'

const FullFormComponent = (props: FullFormProps) => (
  <FullForm
    {...props}
    dataViewTemplate={'full'}
    showFull={true}
  />
)
const GroupComponent = (props: FullFormProps) => (
  <FullForm
    {...props}
    showJoins={false}
    showColumns={true}
    showWheres={true}
    showGroupBy={true}
    showSources={true}
    dataViewTemplate="groupBy"
  />
)

const CombineComponent = (props: FullFormProps) => (
  <FullForm
    {...props}
    showJoins={true}
    showColumns={true}
    showWheres={true}
    showOrderBy={true}
    showGroupBy={false}
    showSources={true}
    dataViewTemplate="combine"
  />
)
const SpatialJoinComponent = (props: FullFormProps) => (
  <FullForm
    {...props}
    showJoins={false}
    showSpatialJoin={true}
    showColumns={true}
    showWheres={false}
    showGroupBy={false}
    showSources={true}
    dataViewTemplate="spatialJoin"
  />
)
const PublishComponent = (props: FullFormProps) => (
  <FullForm
    {...props}
    showJoins={false}
    showColumns={true}
    showWheres={true}
    showGroupBy={false}
    showOrderBy={true}
    showSources={true}
    showSimpleColumns={true}
    dataViewTemplate="publish"
  />
)
const SummarizeComponent = (props: FullFormProps) => (
  <FullForm
    {...props}
    showJoins={false}
    showColumns={true}
    showWheres={true}
    showGroupBy={false}
    showSources={true}
    dataViewTemplate="summarize"
  />
)
export const getFormComponent = (dataViewTemplate: string) => {
  switch (dataViewTemplate) {
    case 'groupBy':
      return GroupComponent
    case 'combine':
      return CombineComponent
    case 'publish':
      return PublishComponent
    case 'summarize':
      return SummarizeComponent
    case 'spatialJoin':
      return SpatialJoinComponent
    case 'full':
    case 'verbose':
    default:
      return FullFormComponent
  }
}
