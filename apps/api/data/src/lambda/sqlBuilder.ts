import type { DatasetEntity } from "../../../graphql/src/plugins/scaffolds/datasets/types"
import type {
  ApiDataQueryEntity,
  MinimalColumnInfo,
} from "../../../graphql/src/plugins/scaffolds/apiDataQueries/types"
import type {
  Source,
  WhereQuery,
  JoinQuery,
  ColumnOperation,
  OPERATOR_TYPES,
} from "../../../../admin/src/components/QueryBuilder/types"
import knex, { type Knex } from "knex"
import { SchemaService } from "../types/schemaService"

const JOIN_OPERATOR_FUNCTIONS = {
  left: "leftJoin",
  right: "rightJoin",
  inner: "innerJoin",
  outer: "fullOuterJoin",
}
export const OPERATOR_FN_SUFFIXES = {
  Not: "Not",
  In: "In",
  NotIn: "NotIn",
  Null: "Null",
  NotNull: "NotNull",
  Between: "Between",
  NotBetween: "NotBetween",
  Like: "Like",
  ILike: "ILike",
  NotLike: "NotLike",
  NotILike: "NotILike",
  "=": "",
  ">": "",
  ">=": "",
  "<": "",
  "<=": "",
}
// any valid method of knex()
type knexMethod = keyof ReturnType<typeof knex>

export class SqlBuilder {
  schema: ApiDataQueryEntity
  qb = knex({
    client: "postgres",
  })
  query = this.qb({})
  isSubQuery: boolean
  params: { [key: string]: any } = {}
  referencedIds: string[] = []
  schemaService?: SchemaService

  constructor(
    schema: ApiDataQueryEntity,
    params: { [key: string]: any } = {},
    isSubQuery = false,
    schemaService: SchemaService
  ) {
    this.schema = schema
    this.params = params
    this.isSubQuery = isSubQuery
    this.schemaService = schemaService
  }
  async fetchSourceSchemas() {
    const ids = this.schema.sources?.map((source) => source.id)
    if (!ids) return
    if (!this.schemaService) throw new Error("Schema service not defined")
    await this.schemaService.fetchMultipleSchemaEntries(
      ids,
      this.params["__fresh__"]
    )
  }
  // little utils
  get queryString() {
    return this.isSubQuery ? this.query.toString() : this.query.toString() + ";"
  }
  buildS3String(filename: string) {
    return `s3://${process.env.S3_BUCKET}/${filename}`
  }
  async buildSubQuery(schema: ApiDataQueryEntity) {
    if (!this.schemaService) throw new Error("Schema service not defined")
    const subQuery = new SqlBuilder(
      schema,
      this.params,
      true,
      this.schemaService
    )
    await subQuery.buildStatement()
    return subQuery.queryString
  }
  buildColumn(column: MinimalColumnInfo) {
    const columnId = column.expression
      ? column.expression
      : `"${column.sourceId}"."${column.name}"`
    console.log("column", column)
    const colName = column.alias || columnId
    return this.qb.raw(`${columnId} as "${colName}"`)
  }

  buildColumnOperation(columnOperation: ColumnOperation, column: string) {
    const { operation, args } = columnOperation
    const cleanedArgs = args ? `, ${args.join(", ")}` : ""
    return `${operation}(${column} ${cleanedArgs})`
  }

  // statement builder methods
  buildColumnList(
    columns: ApiDataQueryEntity["columns"] = this.schema.columns
  ) {
    const columnsList: any = []
    if (!columns) return columnsList
    columns.forEach((column: (typeof columns)[number]) => {
      columnsList.push(this.buildColumn(column))
    })
    return columnsList
  }
  buildSelectClause(
    columns: ApiDataQueryEntity["columns"] = this.schema.columns
  ) {
    const columnsList: any = []
    if (!columns) {
      this.query.select("*")
      return
    }
    columns.forEach((column: (typeof columns)[number]) => {
      const columnExpression = column.expression
        ? column.expression
        : `"${column.sourceId}"."${column.name}"`
      if (column.aggregate) {
        const colName = column.alias || `${column.aggregate}_${column.name}`
        const columnFn = column.aggregate.toLowerCase()
        const columnText =
          columnFn === "count" ? "count(*)" : `${columnFn}(${columnExpression})`
        columnsList.push(this.qb.raw(`${columnText} as "${colName}"`))
      } else {
        const colName = column.alias || column.name
        columnsList.push(this.qb.raw(`${columnExpression} as "${colName}"`))
      }
    })
    this.query.select(columnsList)
  }
  async buildSourceText(source: Source) {
    const id = source.id
    if (!this.schemaService) return
    const schemaResponse = await this.schemaService.getSchema(id)
    if (!schemaResponse.ok) return
    const sourceSpec = schemaResponse.result
    // double double quotes regex
    const dDQRegex = /""/g
    switch (source.TYPE || source.type) {
      case "dataset":
      case "Dataset":
        const s3String = this.buildS3String(
          (sourceSpec as DatasetEntity).filename
        )
        const fromS3String = `'${s3String}' "${id}"`
        return fromS3String.replace(dDQRegex, "")
      case "source":
      case "Source":
      case "ApiDataQuery":
        const subQuery = await this.buildSubQuery(
          sourceSpec as ApiDataQueryEntity
        )
        const subQueryString = `(${subQuery}) "${id}"`
        return subQueryString.replace(dDQRegex, "")
      default: {
        return null
      }
    }
  }
  async buildFromClause(
    sources: ApiDataQueryEntity["sources"] = this.schema.sources
  ) {
    if (!sources || !sources.length) return
    const fromText = await this.buildSourceText(sources[0])
    fromText && this.query.fromRaw(fromText)
    this.referencedIds.push(sources[0].id)
  }
  generateWhereArgs(
    column: string,
    operator: WhereQuery["operator"],
    value: WhereQuery["value"],
    wherePrefix: string,
    whereVerb: string,
    isFirst: boolean = false
  ) {
    const whereSuffix = OPERATOR_FN_SUFFIXES[operator]
    const whereFn = isFirst
      ? whereVerb.toLowerCase() + whereSuffix
      : wherePrefix + whereVerb + whereSuffix
    const formattedColumn = this.qb.raw(column)
    const whereArgs = !whereSuffix?.length
      ? [formattedColumn, operator, value]
      : [formattedColumn, value]

    return {
      whereFn,
      whereArgs,
    }
  }

  sanitizeParam(operator: OPERATOR_TYPES, param: string, fallbackValue: any) {
    const value = this.params[param] || fallbackValue
    if (value === "*") {
      return value
    }

    switch (operator) {
      case "In":
      case "NotIn":
      case "Between":
      case "NotBetween":
        // split based on comma for strings not in single or double quotes
        const commasNotInQuotes = /,(?=(?:[^"]|"[^"]*")*$)(?=(?:[^']|'[^']*')*$)/g
        const splitValue = value.split(commasNotInQuotes)
        // remove outer quotes from string
        const removeQuotes = /^['"](.*)['"]$/
        const cleanValue = splitValue.map((val) => {
          const match = val.match(removeQuotes)
          return match ? match[1] : val
        })
        return splitValue.length > 1 ? splitValue : value.split(",")
      case "Like":
      case "NotLike":
      case "NotILike":
      case "ILike":
        return value[0] !== "%" && value[value.length - 1] !== "%"
          ? `%${value}%`
          : value
      default: {
        return value
      }
    }
  }

  buildWhereClause(
    where: WhereQuery,
    combinedOperator: ApiDataQueryEntity["combinedOperator"] = this.schema
      .combinedOperator,
    hasGroup: boolean = false,
    isFirst: boolean = false
  ) {
    const wherePrefix = combinedOperator || "and"
    const whereVerb = hasGroup ? "Having" : "Where"
    const whereColumn = `"${where.sourceId}"."${where.column}"`
    const paramName = where.customAlias || where.column
    const whereValue = this.sanitizeParam(where.operator, paramName, where.value)
    if (whereValue === undefined || whereValue === "*") return
    const { whereFn, whereArgs } = this.generateWhereArgs(
      whereColumn,
      where.operator,
      whereValue,
      wherePrefix,
      whereVerb,
      isFirst
    )
    if (whereFn in this.query) {
      // @ts-ignore
      this.query[whereFn](...whereArgs)
    } else {
      switch (where.operator) {
        case "NotLike": {
          const statement = this.qb.raw(
            `${whereColumn} not like '${whereValue}'`
          )
          isFirst
            ? this.query.whereRaw(statement)
            : this.query.andWhereRaw(statement)
        }
      }
    }
  }
  buildWhereClauses() {
    const wheres = this.schema.wheres
    const hasGroup = this.schema.groupbys && this.schema.groupbys.length > 0
    const combineOperator = this.schema.combinedOperator

    if (!wheres) return
    wheres.forEach((where: (typeof wheres)[number], index: number) => {
      this.buildWhereClause(
        where,
        combineOperator || "and",
        hasGroup,
        index === 0
      )
    })
  }
  async resolveSourceIdText(id: string) {
    const hasBeenReferenced = this.referencedIds.includes(id)
    if (hasBeenReferenced) {
      return id
    } else {
      const source = this.schema.sources?.find((source) => source.id === id)
      if (!source) return
      const text = await this.buildSourceText(source)
      this.referencedIds.push(id)
      return text
    }
  }
  async buildGeoJoin(join: JoinQuery, rightSourceFrom: string) {
    const joinFunction = JOIN_OPERATOR_FUNCTIONS[
      join.operator
    ] as keyof typeof this.query
    const { geoPredicate, leftOnGeo, rightOnGeo } = join

    let leftOnCol = `"${join.leftSourceId}"."${join.leftOn}"`
    let rightOnCol = `"${join.rightSourceId}"."${join.rightOn}"`

    for (const operation of leftOnGeo || []) {
      leftOnCol = this.buildColumnOperation(operation, leftOnCol)
    }

    for (const operation of rightOnGeo || []) {
      rightOnCol = this.buildColumnOperation(operation, rightOnCol)
    }
    // logger.info({
    //   leftOnCol,
    //   rightOnCol,
    //   joinFunction
    // })
    // @ts-ignore
    this.query[joinFunction](
      this.qb.raw(rightSourceFrom),
      this.qb.raw(`${geoPredicate}(
        ${leftOnCol},
        ${rightOnCol}
      )`)
    )
  }

  async buildJoinClause(join: JoinQuery) {
    const joinFunction = JOIN_OPERATOR_FUNCTIONS[
      join.operator
    ] as keyof typeof this.query
    const rightSourceFrom = await this.resolveSourceIdText(join.rightSourceId)
    if (!rightSourceFrom) return

    if (join.leftOnGeo && join.rightOnGeo) {
      this.buildGeoJoin(join, rightSourceFrom)
      return
    }
    const raw = (str: any) => this.qb.raw(str)

    // @ts-ignore
    this.query[joinFunction as knexMethod](
      this.qb.raw(rightSourceFrom),
      function () {
        // @ts-ignore
        this.on(function () {
          join.leftOn.forEach((_, index) => {
            const lCol = raw(`"${join.leftSourceId}"."${join.leftOn[index]}"`)
            const rCol = raw(`"${join.rightSourceId}"."${join.rightOn[index]}"`)
            // @ts-ignore
            this.on(lCol, "=", rCol)
          })
        })
      }
    )
  }

  async buildJoinClauses(
    joins: ApiDataQueryEntity["joins"] = this.schema.joins
  ) {
    if (!joins) return
    const joinPromises = joins.map((join: JoinQuery) =>
      this.buildJoinClause(join)
    )
    await Promise.all(joinPromises)
  }
  buildGroupByClauses(
    groupbys: ApiDataQueryEntity["groupbys"] = this.schema.groupbys
  ) {
    if (!groupbys) return
    groupbys.forEach((groupby: (typeof groupbys)[number]) => {
      const groupbyColumn = groupby.column
        .map((col) => `"${groupby.sourceId}"."${col}"`)
        .join(", ")
      const relatedWheres = this.schema.wheres?.filter(
        (where) => where.sourceId === groupby.sourceId
      )
      if (relatedWheres && relatedWheres.length) {
        const mappedGroupbys = relatedWheres.map(
          (where) => `"${where.sourceId}"."${where.column}"`
        )
        this.query.groupByRaw(`${groupbyColumn}, ${mappedGroupbys.join(", ")}`)
      } else {
        this.query.groupByRaw(groupbyColumn)
      }
    })
  }
  buildOrderByClauses(
    orderbys: ApiDataQueryEntity["orderbys"] = this.schema.orderbys
  ) {
    if (!orderbys) return
    orderbys.forEach((orderby: (typeof orderbys)[number]) => {
      const orderbyColumn = `"${orderby.sourceId}"."${orderby.column}"`
      this.query.orderByRaw(`${orderbyColumn} ${orderby.direction}`)
    })
  }
  buildLimitClause(limit: ApiDataQueryEntity["limit"] = this.schema.limit) {
    if (!limit) return
    this.query.limit(limit)
  }
  buildOffsetClause(offset: ApiDataQueryEntity["offset"] = this.schema.offset) {
    if (!offset) return
    this.query.offset(offset)
  }
  buildDistinct(
    distinct: ApiDataQueryEntity["distinct"] = this.schema.distinct
  ) {
    if (!distinct) return
    this.query.distinct()
  }
  async buildStatement() {
    await this.fetchSourceSchemas()
    await this.buildFromClause()
    await this.buildJoinClauses()
    this.buildSelectClause()
    this.buildWhereClauses()
    this.buildGroupByClauses()
    this.buildOrderByClauses()
    this.buildLimitClause()
    this.buildOffsetClause()
    this.buildDistinct()
  }
}
