// If our GraphQL API uses Webiny Security Framework, we can retrieve the
// currently logged in identity and assign it to the `createdBy` property.
// https://www.webiny.com/docs/key-topics/security-framework/introduction
import { SecurityIdentity } from '@webiny/api-security/types'
import { SecurityPermission } from '@webiny/app-security/types'
import {
  COMBINE_OPERATORS,
  GroupByQuery,
  JoinQuery,
  MetaColumnSchema,
  OrderByQuery,
  Source,
  WhereQuery
} from 'admin/src/components/QueryBuilder/types'

export type MinimalColumnInfo = Pick<MetaColumnSchema, 'name' | 'sourceId' | 'sourceTitle' | 'alias' | 'aggregate' | "expression">
export interface ApiDataQueryEntity {
  PK: string
  SK: string
  id: string
  title: string
  template?: string
  createdOn: string
  savedOn: string
  canView?: Array<{ name: string; id: string }>
  canEdit?: Array<{ name: string; id: string }>
  canDelete?: Array<{ name: string; id: string }>
  defaultParameters?: string
  isPublic?: boolean
  createdBy: Pick<SecurityIdentity, 'id' | 'displayName' | 'type'>
  webinyVersion: string

  sources?: Array<Source>
  wheres?: Array<WhereQuery>
  combinedOperator?: (typeof COMBINE_OPERATORS)[number]
  joins?: Array<JoinQuery>
  columns?: Array<MinimalColumnInfo>
  groupbys?: Array<GroupByQuery>
  orderbys?: Array<OrderByQuery>
  limit?: number
  offset?: number
  dataViewTemplate?: String
}

export interface ApiDataQueryPermissions extends SecurityPermission {
  name: 'data-uploads'
  rwd?: 'r' | 'rw' | 'rwd'
  specialFeature?: boolean
}
