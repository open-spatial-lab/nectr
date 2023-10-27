import { ApiDataQueryEntity } from '../../../graphql/src/plugins/scaffolds/apiDataQueries/types'
import {
  OPERATOR_TYPES,
  SourceTypes,
  WhereQuery
} from '../../../../admin/src/components/QueryBuilder/types'
import { SqlBuilder } from '../lambda/sqlBuilder'
import { mockSourceSpecs, API_DATA_QUERY_TEST_PROPERTIES, exampleSourceSpecs } from './utils'
import BaseSchemaService from '../lambda/schemas/baseSchemaService'

type MockSchema = {
  config: {
    schema: ApiDataQueryEntity
    params?: { [key: string]: any }
    isSubQuery?: boolean
  }
  result: string
}

const simpleSchema = {
  config: {
    schema: {
      ...API_DATA_QUERY_TEST_PROPERTIES,
      title: 'Simple From',
      sources: [
        {
          id: 'sdoh',
          type: 'Dataset' as SourceTypes,
          TYPE: 'Dataset',
          title: 'sdoh'
        }
      ]
    }
  },
  result: `select * from 's3://test_bucket/sdoh.csv' "sdoh";`
} as MockSchema

const orderedSchema = {
  config: {
    schema: {
      ...API_DATA_QUERY_TEST_PROPERTIES,
      title: 'Simple From',
      sources: [
        {
          id: 'sdoh',
          type: 'Dataset' as SourceTypes,
          TYPE: 'Dataset',
          title: 'sdoh'
        }
      ],
      orderbys: [
        {
          sourceId: 'sdoh',
          column: 'column1',
          direction: 'asc'
        },
        {
          sourceId: 'sdoh',
          column: 'column2',
          direction: 'desc'
        }
      ]
    }
  },
  result: `select * from 's3://test_bucket/sdoh.csv' "sdoh" order by "sdoh"."column1" asc, "sdoh"."column2" desc;`
} as MockSchema

const customExpressionSchema = {
  config: {
    schema: {
      ...simpleSchema.config.schema,
      title: 'Custom Expression From',
      sources: [
        {
          id: 'sdoh',
          type: 'Dataset' as SourceTypes,
          TYPE: 'Dataset',
          title: 'sdoh'
        }
      ],
      columns: [
        {
          sourceId: '',
          name: '',
          alias: 'col1',
          expression: 'column1 + column2'
        }
      ]
    },
  },
  result: `select column1 + column2 as "col1" from 's3://test_bucket/sdoh.csv' "sdoh";`
} as MockSchema

const columnSchema = {
  config: {
    schema: {
      ...simpleSchema.config.schema,
      title: 'Simple Column',
      columns: [
        {
          sourceId: 'sdoh',
          name: 'column1',
          alias: 'alias1'
        },
        {
          sourceId: 'sdoh',
          name: 'column2'
        },
        {
          sourceId: 'sdoh',
          name: 'column3',
          aggregate: 'count'
        }
      ]
    }
  },
  result: `select "sdoh"."column1" as "alias1", "sdoh"."column2" as "column2", count(*) as "count_column3" from 's3://test_bucket/sdoh.csv' "sdoh";`
} as MockSchema

const joinSchema = {
  config: {
    schema: {
      ...API_DATA_QUERY_TEST_PROPERTIES,
      title: 'Simple Join',
      sources: [
        {
          id: 'sdoh',
          type: 'Dataset' as SourceTypes,
          TYPE: 'Dataset',
          title: 'sdoh'
        },
        {
          id: 'sdoh-join',
          type: 'Dataset' as SourceTypes,
          TYPE: 'Dataset',
          title: 'sdoh-join'
        }
      ],
      joins: [
        {
          leftSourceId: 'sdoh',
          leftOn: ['fips'],
          rightSourceId: 'sdoh-join',
          rightOn: ['geoid'],
          operator: 'inner'
        }
      ]
    },
    params: {},
    isSubQuery: false
  },
  result: `select * from 's3://test_bucket/sdoh.csv' "sdoh" inner join 's3://test_bucket/sdoh-join.csv' "sdoh-join" on ("sdoh"."fips" = "sdoh-join"."geoid");`
} as MockSchema


const compoundJoinQuery = {
  config: {
    schema: {
      ...API_DATA_QUERY_TEST_PROPERTIES,
      title: 'Compound Join',
      sources: [
        {
          id: 'sdoh',
          type: 'Dataset' as SourceTypes,
          TYPE: 'Dataset',
          title: 'sdoh'
        },
        {
          id: 'sdoh-join',
          type: 'Dataset' as SourceTypes,
          TYPE: 'Dataset',
          title: 'sdoh-join'
        }
      ],
      joins: [
        {
          leftSourceId: 'sdoh',
          leftOn: ['fips', 'fips2'],
          rightSourceId: 'sdoh-join',
          rightOn: ['geoid', 'geoid2'],
          operator: 'inner'
        }
      ]
    },
    params: {},
    isSubQuery: false
  },
  result: `select * from 's3://test_bucket/sdoh.csv' "sdoh" inner join 's3://test_bucket/sdoh-join.csv' "sdoh-join" on ("sdoh"."fips" = "sdoh-join"."geoid" and "sdoh"."fips2" = "sdoh-join"."geoid2");`
} as MockSchema

const chainedJoinSchema = {
  config: {
    schema: {
      ...API_DATA_QUERY_TEST_PROPERTIES,
      title: 'Chained Join',
      sources: [
        {
          id: 'sdoh',
          type: 'Dataset' as SourceTypes,
          TYPE: 'Dataset',
          title: 'sdoh'
        },
        {
          id: 'sdoh-join',
          type: 'Dataset' as SourceTypes,
          TYPE: 'Dataset',
          title: 'sdoh-join'
        },
        {
          id: 'other-join',
          type: 'Dataset' as SourceTypes,
          TYPE: 'Dataset',
          title: 'other-join'
        }
      ],
      joins: [
        {
          leftSourceId: 'sdoh',
          leftOn: ['fips'],
          rightSourceId: 'sdoh-join',
          rightOn: ['geoid'],
          operator: 'inner'
        },
        {
          leftSourceId: 'sdoh-join',
          leftOn: ['geoid'],
          rightSourceId: 'other-join',
          rightOn: ['__id__'],
          operator: 'left'
        }
      ]
    },
    params: {},
    isSubQuery: false
  },
  result: `select * from 's3://test_bucket/sdoh.csv' "sdoh" inner join 's3://test_bucket/sdoh-join.csv' "sdoh-join" on ("sdoh"."fips" = "sdoh-join"."geoid") left join 's3://test_bucket/other-join.parquet' "other-join" on ("sdoh-join"."geoid" = "other-join"."__id__");`
} as MockSchema

const whereSchema = {
  config: {
    schema: {
      ...simpleSchema.config.schema,
      title: 'Where and Params',
      wheres: [
        {
          sourceId: 'sdoh',
          column: 'column1',
          operator: '=',
          value: 1,
          customAlias: 'where1'
        } as WhereQuery,
        {
          sourceId: 'sdoh',
          column: 'column2',
          operator: '>',
          value: -1,
          customAlias: 'where2',
          allowCustom: true
        }
      ],
      combinedOperator: 'or'
    },
    params: {
      where2: 2
    }
  },
  result: `select * from 's3://test_bucket/sdoh.csv' "sdoh" where "sdoh"."column1" = 1 or "sdoh"."column2" > 2;`
} as MockSchema
const whereNotLikeSchema = {
  config: {
    schema: {
      ...simpleSchema.config.schema,
      title: 'Where and not like Params',
      wheres: [
        {
          sourceId: 'sdoh',
          column: 'column1',
          operator: '=',
          value: 1,
          customAlias: 'where1'
        } as WhereQuery,
        {
          sourceId: 'sdoh',
          column: 'column2',
          operator: '>',
          value: -1,
          customAlias: 'where2',
          allowCustom: true
        },
        {
          sourceId: 'sdoh',
          column: 'column3',
          operator: 'NotLike',
          value: '%test%',
          customAlias: 'where3',
          allowCustom: true
        }
      ],
      combinedOperator: 'or'
    },
    params: {
      where2: 2
    }
  },
  result: `select * from 's3://test_bucket/sdoh.csv' "sdoh" where "sdoh"."column1" = 1 or "sdoh"."column2" > 2;`
} as MockSchema

const groupSchema = {
  config: {
    schema: {
      ...simpleSchema.config.schema,
      title: 'Group By',
      groupbys: [
        {
          sourceId: 'sdoh',
          column: ['column1']
        }
      ]
    },
    params: {}
  },
  result: `select * from 's3://test_bucket/sdoh.csv' "sdoh" group by "sdoh"."column1";`
} as MockSchema

const compoundSchema = {
  config: {
    schema: {
      sources: [
        {
          id: 'sdoh-join',
          type: 'Dataset'
        },
        {
          id: 'dataview',
          type: 'ApiDataQuery'
        }
      ],
      joins: [
        {
          leftSourceId: 'sdoh-join',
          leftOn: ['geoid'],
          rightSourceId: 'dataview',
          rightOn: ['geoid'],
          operator: 'inner'
        }
      ],
      title: 'Compound Query'
    }
  },
  result: `select * from 's3://test_bucket/sdoh-join.csv' "sdoh-join" inner join (select "sdoh"."column1" as "column1", "sdoh"."column2" as "column2", "other-join"."column3" as "column3" from 's3://test_bucket/sdoh.csv' "sdoh" inner join 's3://test_bucket/other-join.parquet' "other-join" on ("sdoh"."column1" = "other-join"."column3") where "sdoh"."column1" > 0) "dataview" on ("sdoh-join"."geoid" = "dataview"."geoid");`
} as any

const groupHavingSchema = {
  config: {
    schema: {
      ...groupSchema.config.schema,
      title: 'Group By Having',
      wheres: [
        {
          sourceId: 'sdoh',
          column: 'column2',
          operator: '=',
          value: 1,
          customAlias: 'where2'
        }
      ]
    },
    params: {}
  },
  result: `select * from 's3://test_bucket/sdoh.csv' "sdoh" group by "sdoh"."column1", "sdoh"."column2" having "sdoh"."column2" = 1;`
} as MockSchema

const testCases = [
  simpleSchema,
  orderedSchema,
  customExpressionSchema,
  columnSchema,
  joinSchema,
  compoundJoinQuery,
  chainedJoinSchema,
  whereSchema,
  whereNotLikeSchema,
  groupSchema,
  groupHavingSchema,
  compoundSchema
]

const main = async () => {
  let passed = 0
  // set up mock data
  // usually, this would be in dynamodb,
  // but that's a more complex testing harness
  mockSourceSpecs()
  const numTests = testCases.length
  // see if --verbose flag is passed
  const verbose = process.argv.includes('--verbose')

  for (let idx = 0; idx < numTests; idx++) {
    const testCase = testCases[idx]
    const { schema } = testCase.config
    const params = testCase.config.params || {}
    const isSubQuery = testCase.config.isSubQuery || false
    const expectedResult = testCase.result
    // @ts-ignore
    const schemaService = new BaseSchemaService(Object.values(exampleSourceSpecs))
    const sqlBuilder = new SqlBuilder(schema, params, isSubQuery, schemaService)
    await sqlBuilder.buildStatement()
    const result = sqlBuilder.queryString
    if (result !== expectedResult) {
      console.error(
        `❌ Failed Test ${idx + 1}/${numTests} (${
          schema.title
        }) \n Expected: ${expectedResult} \n Got: ${result}`
      )
    } else {
      console.log(`✅ Passed Test ${idx + 1}/${numTests} (${schema.title})`)
      passed++
      verbose && console.log(`\t${result}`)
    }
  }
  console.log(`Passed ${passed}/${numTests} tests`)
}

main()
