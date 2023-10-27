import { ApiDataQueryEntity } from '../types'
import { ApiDataQuery } from '../entities'
import ApiDataQueriesResolver from './ApiDataQueriesResolver'

/**
 * Contains base `getApiDataQuery` and `listApiDataQueries` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface GetApiDataQueryParams {
  id: string
}

interface ListApiDataQueriesParams {
  sort?: 'createdOn_ASC' | 'createdOn_DESC'
  limit?: number
  after?: string
  before?: string
}

interface ListApiDataQueriesResponse {
  data: ApiDataQueryEntity[]
  meta: { limit: number; after: string | null; before: string | null }
}

interface ApiDataQueriesQuery {
  getApiDataQuery(params: GetApiDataQueryParams): Promise<ApiDataQueryEntity>
  listApiDataQueries(params: ListApiDataQueriesParams): Promise<ListApiDataQueriesResponse>
}

interface ApiDataQueriesQueryParams {
  limit?: number
  reverse?: boolean
  gt?: string | number
  lt?: string | number
}

interface ApiDataQueriesMetaParams {
  limit: number
  after: string | null
  before: string | null
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class ApiDataQueriesQueryImplementation
  extends ApiDataQueriesResolver
  implements ApiDataQueriesQuery
{
  /**
   * Returns a single ApiDataQuery entry from the database.
   * @param id
   */
  async getApiDataQuery({ id }: GetApiDataQueryParams) {
    // Query the database and return the entry. If entry was not found, an error is thrown.
    const { Item: apiDataQuery } = await ApiDataQuery.get({ PK: this.getPK(), SK: id })
    if (!apiDataQuery) {
      throw new Error(`ApiDataQuery "${id}" not found.`)
    }

    return apiDataQuery
  }

  /**
   * List multiple ApiDataQuery entries from the database.
   * Supports basic sorting and cursor-based pagination.
   * @param limit
   * @param sort
   * @param after
   * @param before
   */
  async listApiDataQueries({ limit = 999, sort, after, before }: ListApiDataQueriesParams) {
    const PK = this.getPK()
    const query: ApiDataQueriesQueryParams = {
      limit,
      reverse: sort !== 'createdOn_ASC',
      gt: undefined,
      lt: undefined
    }
    const meta: ApiDataQueriesMetaParams = { limit, after: null, before: null }

    // The query is constructed differently, depending on the "before" or "after" values.
    if (before) {
      query.reverse = !query.reverse
      if (query.reverse) {
        query.lt = before
      } else {
        query.gt = before
      }

      const { Items } = await ApiDataQuery.query(PK, { ...query, limit: limit + 1 })

      const data = Items.slice(0, limit).reverse()

      const hasBefore = Items.length > limit
      if (hasBefore) {
        meta.before = Items[Items.length - 1].id
      }

      meta.after = Items[0].id

      return { data, meta }
    }

    if (after) {
      if (query.reverse) {
        query.lt = after
      } else {
        query.gt = after
      }
    }

    const { Items } = await ApiDataQuery.query(PK, { ...query, limit: limit + 1 })

    const data = Items.slice(0, limit)

    const hasAfter = Items.length > limit
    if (hasAfter) {
      meta.after = Items[limit - 1].id
    }

    if (after) {
      meta.before = Items[0].id
    }

    return { data, meta }
  }
}
