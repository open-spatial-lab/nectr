import { S3_BUCKET } from '../../../../core/aws/s3'
// types
import type { DatasetEntity } from '../../../graphql/src/plugins/scaffolds/datasets/types'
import type { ApiDataQueryEntity } from '../../../graphql/src/plugins/scaffolds/apiDataQueries/types'
import type {
  Source,
  WhereQuery,
  JoinQuery
} from '../../../../admin/src/components/QueryBuilder/types'
import knex from 'knex'
import { schemaService } from './schemas'

const JOIN_OPERATOR_FUNCTIONS = {
  left: 'leftJoin',
  right: 'rightJoin',
  inner: 'innerJoin',
  outer: 'fullOuterJoin'
}
export const OPERATOR_FN_SUFFIXES = {
  Not: 'Not',
  In: 'In',
  NotIn: 'NotIn',
  Null: 'Null',
  NotNull: 'NotNull',
  Between: 'Between',
  NotBetween: 'NotBetween',
  Like: 'Like',
  ILike: 'ILike',
  '=': '',
  '>': '',
  '>=': '',
  '<': '',
  '<=': ''
}

export class SqlBuilder {
  schema: ApiDataQueryEntity
  qb = knex({
    client: 'postgres'
  })
  query = this.qb({})
  isSubQuery: boolean
  params: { [key: string]: any } = {}
  referencedIds: string[] = []

  constructor(schema: ApiDataQueryEntity, params: { [key: string]: any } = {}, isSubQuery = false) {
    this.schema = schema
    this.params = params
    this.isSubQuery = isSubQuery
  }
  async fetchSourceSchemas() {
    const ids = this.schema.sources?.map(source => source.id)
    if (!ids) return
    await schemaService.fetchMultipleSchemaEntries(ids, this.params['__fresh__'])
  }
  // little utils
  get queryString() {
    return this.isSubQuery ? this.query.toString() : this.query.toString() + ';'
  }
  buildS3String(filename: string) {
    return `s3://${S3_BUCKET}/${filename}`
  }
  async buildSubQuery(schema: ApiDataQueryEntity) {
    const subQuery = new SqlBuilder(schema, this.params, true)
    await subQuery.buildStatement()
    return subQuery.queryString
  }

  // statement builder methods
  buildColumnList(columns: ApiDataQueryEntity['columns'] = this.schema.columns) {
    const columnsList: any = []
    if (!columns) return columnsList
    columns.forEach((column: (typeof columns)[number]) => {
      const columnId = this.isSubQuery ? column.name : `"${column.sourceId}"."${column.name}"`
      const colName = column.alias || columnId
      columnsList.push(this.qb.raw(`${columnId} as "${colName}"`))
    })
    return columnsList
  }
  buildSelectClause(columns: ApiDataQueryEntity['columns'] = this.schema.columns) {
    const columnsList: any = []
    if (!columns) {
      this.query.select('*')
      return
    }
    columns.forEach((column: (typeof columns)[number]) => {
      const columnId = this.isSubQuery ? column.name : `"${column.sourceId}"."${column.name}"`
      if (column.aggregate) {
        const colName = column.alias || `${column.aggregate}_${column.name}`
        const columnFn = column.aggregate.toLowerCase()
        const columnText = columnFn === 'count' ? 'count(*)' : `${columnFn}(${columnId})`
        columnsList.push(this.qb.raw(`${columnText} as "${colName}"`))
      } else {
        const colName = column.alias || column.name
        columnsList.push(this.qb.raw(`${columnId} as "${colName}"`))
      }
    })
    this.query.select(columnsList)
  }
  async buildSourceText(source: Source) {
    const id = source.id
    const schemaResponse = await schemaService.getSchema(id)
    if (!schemaResponse.ok) return
    const sourceSpec = schemaResponse.result
    // double double quotes regex
    const dDQRegex = /""/g
    switch (source.TYPE || source.type) {
      case 'source':
      case 'Source':
      case 'dataset':
      case 'Dataset':
        const s3String = this.buildS3String((sourceSpec as DatasetEntity).filename)
        const fromS3String = `'${s3String}' "${id}"`
        return fromS3String.replace(dDQRegex, '')
      case 'ApiDataQuery':
        const subQuery = await this.buildSubQuery(sourceSpec as ApiDataQueryEntity)
        const subQueryString = `(${subQuery}) "${id}"`
        return subQueryString.replace(dDQRegex, '')
      default: {
        return null
      }
    }
  }
  async buildFromClause(sources: ApiDataQueryEntity['sources'] = this.schema.sources) {
    if (!sources || !sources.length) return
    const fromText = await this.buildSourceText(sources[0])
    fromText && this.query.fromRaw(fromText)
    this.referencedIds.push(sources[0].id)
  }
  generateWhereArgs(
    column: string,
    operator: WhereQuery['operator'],
    value: WhereQuery['value'],
    wherePrefix: string,
    whereVerb: string,
    isFirst: boolean = false
  ) {
    const whereSuffix = OPERATOR_FN_SUFFIXES[operator]
    const whereFn = isFirst
      ? whereVerb.toLowerCase() + whereSuffix
      : wherePrefix + whereVerb + whereSuffix
    const formattedColumn = this.qb.raw(column)
    const whereArgs = !whereSuffix.length
      ? [formattedColumn, operator, value]
      : [formattedColumn, value]

    return {
      whereFn,
      whereArgs
    }
  }
  buildWhereClause(
    where: WhereQuery,
    combinedOperator: ApiDataQueryEntity['combinedOperator'] = this.schema.combinedOperator,
    hasGroup: boolean = false,
    isFirst: boolean = false
  ) {
    const wherePrefix = combinedOperator || 'and'
    const whereVerb = hasGroup ? 'Having' : 'Where'
    const whereColumn = `"${where.sourceId}"."${where.column}"`
    const paramName = where.customAlias || where.column
    const whereValue = this.params.hasOwnProperty(paramName) ? this.params[paramName] : where.value
    const { whereFn, whereArgs } = this.generateWhereArgs(
      whereColumn,
      where.operator,
      whereValue,
      wherePrefix,
      whereVerb,
      isFirst
    )
    // @ts-ignore
    this.query[whereFn](...whereArgs)
  }
  buildWhereClauses() {
    const wheres = this.schema.wheres
    const hasGroup = this.schema.groupbys && this.schema.groupbys.length > 0
    const combineOperator = this.schema.combinedOperator

    if (!wheres) return
    wheres.forEach((where: (typeof wheres)[number], index: number) => {
      this.buildWhereClause(where, combineOperator || 'and', hasGroup, index === 0)
    })
  }
  async resolveSourceIdText(id: string) {
    const hasBeenReferenced = this.referencedIds.includes(id)
    if (hasBeenReferenced) {
      return id
    } else {
      const source = this.schema.sources?.find(source => source.id === id)
      if (!source) return
      const text = await this.buildSourceText(source)
      this.referencedIds.push(id)
      return text
    }
  }
  async buildJoinClause(join: JoinQuery) {
    const joinFunction = JOIN_OPERATOR_FUNCTIONS[join.operator]
    const rightSourceFrom = await this.resolveSourceIdText(join.rightSourceId)
    if (!rightSourceFrom) return
    // @ts-ignore
    this.query[joinFunction](
      this.qb.raw(rightSourceFrom),
      `${join.leftSourceId}.${join.leftOn}`,
      '=',
      `${join.rightSourceId}.${join.rightOn}`
    )
  }
  async buildJoinClauses(joins: ApiDataQueryEntity['joins'] = this.schema.joins) {
    if (!joins) return
    const joinPromises = joins.map((join: JoinQuery) => this.buildJoinClause(join))
    await Promise.all(joinPromises)
  }
  buildGroupByClauses(groupbys: ApiDataQueryEntity['groupbys'] = this.schema.groupbys) {
    if (!groupbys) return
    groupbys.forEach((groupby: (typeof groupbys)[number]) => {
      const groupbyColumn = `"${groupby.sourceId}"."${groupby.column}"`
      const relatedWheres = this.schema.wheres?.filter(where => where.sourceId === groupby.sourceId)
      if (relatedWheres && relatedWheres.length) {
        const mappedGroupbys = relatedWheres.map(where => `"${where.sourceId}"."${where.column}"`)
        this.query.groupByRaw(`${groupbyColumn}, ${mappedGroupbys.join(', ')}`)
      } else {
        this.query.groupByRaw(groupbyColumn)
      }
    })
  }
  buildLimitClause(limit: ApiDataQueryEntity['limit'] = this.schema.limit) {
    if (!limit) return
    this.query.limit(limit)
  }
  buildOffsetClause(offset: ApiDataQueryEntity['offset'] = this.schema.offset) {
    if (!offset) return
    this.query.offset(offset)
  }
  async buildStatement() {
    await this.fetchSourceSchemas()
    await this.buildFromClause()
    await this.buildJoinClauses()
    this.buildSelectClause()
    this.buildWhereClauses()
    this.buildGroupByClauses()
    this.buildLimitClause()
    this.buildOffsetClause()
  }
}
