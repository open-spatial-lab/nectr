import { ApiDataQueryEntity } from '../types'
/**
 * Package mdbid is missing types.
 */
// @ts-ignore
import mdbid from 'mdbid'
import { ApiDataQuery } from '../entities'
import ApiDataQueriesResolver from './ApiDataQueriesResolver'

/**
 * Contains base `createApiDataQuery`, `updateApiDataQuery`, and `deleteApiDataQuery` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement custom data validation and security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface CreateApiDataQueryParams {
  data: {
    title: string
    template?: string
  }
}

interface UpdateApiDataQueryParams {
  id: string
  data: {
    title: string
    template?: string
  }
}

interface DeleteApiDataQueryParams {
  id: string
}

interface ApiDataQueriesMutation {
  createApiDataQuery(params: CreateApiDataQueryParams): Promise<ApiDataQueryEntity>
  updateApiDataQuery(params: UpdateApiDataQueryParams): Promise<ApiDataQueryEntity>
  deleteApiDataQuery(params: DeleteApiDataQueryParams): Promise<ApiDataQueryEntity>
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class ApiDataQueriesMutationImplementation
  extends ApiDataQueriesResolver
  implements ApiDataQueriesMutation
{
  /**
   * Creates and returns a new ApiDataQuery entry.
   * @param data
   */
  async createApiDataQuery({ data }: CreateApiDataQueryParams) {
    // If our GraphQL API uses Webiny Security Framework, we can retrieve the
    // currently logged in identity and assign it to the `createdBy` property.
    // https://www.webiny.com/docs/key-topics/security-framework/introduction
    const { security } = this.context

    // We use `mdbid` (https://www.npmjs.com/package/mdbid) library to generate
    // a random, unique, and sequential (sortable) ID for our new entry.
    const id = mdbid()

    const identity = await security.getIdentity()
    const apiDataQuery = {
      ...data,
      PK: this.getPK(),
      SK: id,
      id,
      createdOn: new Date().toISOString(),
      savedOn: new Date().toISOString(),
      createdBy: identity && {
        id: identity.id,
        type: identity.type,
        displayName: identity.displayName
      },
      webinyVersion: process.env.WEBINY_VERSION
    }

    // Will throw an error if something goes wrong.
    await ApiDataQuery.put(apiDataQuery)

    return apiDataQuery
  }

  /**
   * Updates and returns an existing ApiDataQuery entry.
   * @param id
   * @param data
   */
  async updateApiDataQuery({ id, data }: UpdateApiDataQueryParams) {
    // If entry is not found, we throw an error.
    const { Item: apiDataQuery } = await ApiDataQuery.get({ PK: this.getPK(), SK: id })
    if (!apiDataQuery) {
      throw new Error(`ApiDataQuery "${id}" not found.`)
    }

    const updatedApiDataQuery = { ...apiDataQuery, ...data }

    // Will throw an error if something goes wrong.
    await ApiDataQuery.update(updatedApiDataQuery)

    return updatedApiDataQuery
  }

  /**
   * Deletes and returns an existing ApiDataQuery entry.
   * @param id
   */
  async deleteApiDataQuery({ id }: DeleteApiDataQueryParams) {
    // If entry is not found, we throw an error.
    const { Item: apiDataQuery } = await ApiDataQuery.get({ PK: this.getPK(), SK: id })
    if (!apiDataQuery) {
      throw new Error(`ApiDataQuery "${id}" not found.`)
    }

    // Will throw an error if something goes wrong.
    await ApiDataQuery.delete(apiDataQuery)

    return apiDataQuery
  }
}
