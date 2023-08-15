import { DatasetEntity } from '../types'
import { Dataset } from '../entities'
import DatasetsResolver from './DatasetsResolver'

/**
 * Contains base `getDataset` and `listDatasets` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface GetDatasetParams {
  id: string
}

interface ListDatasetsParams {
  sort?: 'createdOn_ASC' | 'createdOn_DESC'
  limit?: number
  after?: string
  before?: string
}

interface ListDatasetsResponse {
  data: DatasetEntity[]
  meta: { limit: number; after: string | null; before: string | null }
}

interface DatasetsQuery {
  getDataset(params: GetDatasetParams): Promise<DatasetEntity>
  listDatasets(params: ListDatasetsParams): Promise<ListDatasetsResponse>
}

interface DatasetsQueryParams {
  limit?: number
  reverse?: boolean
  gt?: string | number
  lt?: string | number
}

interface DatasetsMetaParams {
  limit: number
  after: string | null
  before: string | null
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class DatasetsQueryImplementation extends DatasetsResolver implements DatasetsQuery {
  /**
   * Returns a single Dataset entry from the database.
   * @param id
   */
  async getDataset({ id }: GetDatasetParams) {
    // Query the database and return the entry. If entry was not found, an error is thrown.
    const { Item: dataset } = await Dataset.get({ PK: this.getPK(), SK: id })
    if (!dataset) {
      throw new Error(`Dataset "${id}" not found.`)
    }

    return dataset
  }

  /**
   * List multiple Dataset entries from the database.
   * Supports basic sorting and cursor-based pagination.
   * @param limit
   * @param sort
   * @param after
   * @param before
   */
  async listDatasets({ limit = 10, sort, after, before }: ListDatasetsParams) {
    const PK = this.getPK()
    const query: DatasetsQueryParams = {
      limit,
      reverse: sort !== 'createdOn_ASC',
      gt: undefined,
      lt: undefined
    }
    const meta: DatasetsMetaParams = { limit, after: null, before: null }

    // The query is constructed differently, depending on the "before" or "after" values.
    if (before) {
      query.reverse = !query.reverse
      if (query.reverse) {
        query.lt = before
      } else {
        query.gt = before
      }

      const { Items } = await Dataset.query(PK, { ...query, limit: limit + 1 })

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

    const { Items } = await Dataset.query(PK, { ...query, limit: limit + 1 })

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
