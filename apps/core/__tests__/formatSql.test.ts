import { formatSql } from "../utils/formatSql";

const JOIN_MOCK = {
    template: {
        from: "8lhrsgvfu-STATE_POP_2020.csv",
        fromS3: true,
        columns: [
            {
                name: "t0.Pop Density",
                type: "Text"
            },
            {
                name: "t0.Total Pop",
                type: "Text"
            },
            {
                name: "t1.Pop NH White",
                type: "Text"
            },
            {
                name: "t1.Pop NH Black",
                type: "Text"
            },
            {
                name: "t1.Pop NH AmIn",
                type: "Text"
            },
            {
                name: "t1.Pop NH Asian",
                type: "Text"
            },
            {
                name: "t1.Pop NH HawaiianPI",
                type: "Text"
            },
            {
                name: "t1.Pop NH Other",
                type: "Text"
            },
            {
                name: "t1.Pop NH Multiple",
                type: "Text"
            },
            {
                name: "t1.Pop Hispanic",
                type: "Text"
            },
            {
                name: "t0.FIPS",
                type: "Text"
            }
        ],
        join: [
            {
                from: "8lhrslj7u-2020_STATE_RACE.csv",
                fromS3: true,
                leftOn: "t0.FIPS",
                rightOn: "t1.GEOID",
                operator: "inner"
            }
        ],
        where: []
    },
    templateParams: {}
};

const SIMPLE_MOCK = {
    template: {
        from: "8lhqoefc7-earthquakes.csv",
        fromS3: true,
        columns: [
            {
                name: "place",
                type: "Text"
            },
            {
                name: "time",
                type: "Date"
            },
            {
                name: "felt",
                type: "Text"
            },
            {
                name: "magType",
                type: "Text"
            },
            {
                name: "mag",
                type: "Number"
            },
            {
                name: "x",
                type: "Text"
            },
            {
                name: "y",
                type: "Text"
            },
            {
                name: "title",
                type: "Text"
            },
            {
                name: "mmi",
                type: "Text"
            },
            {
                name: "index",
                type: "Number"
            }
        ],
        where: [
            {
                column: "mag",
                operator: ">",
                value: ["7"],
                allowCustom: true,
                customAlias: "mag"
            },
            {
                column: "x",
                operator: ">=",
                value: ["0"],
                allowCustom: true,
                customAlias: "xmin"
            },
            {
                column: "x",
                operator: "<=",
                value: ["90"],
                allowCustom: true,
                customAlias: "xmax"
            },
            {
                column: "y",
                operator: ">=",
                value: ["0"],
                allowCustom: true,
                customAlias: "ymin"
            },
            {
                column: "y",
                operator: "<=",
                value: ["90"],
                allowCustom: true,
                customAlias: "ymax"
            }
        ],
        combinedOperator: "and",
        join: []
    },
    templateParams: {}
};

const AGG_MOCK = {
    template: {
        from: "8lhqoefc7-earthquakes.csv",
        fromS3: true,
        columns: [
            {
                name: "index",
                type: "Number",
                aggregate: "avg"
            },
            {
                name: "index",
                type: "Number",
                aggregate: "sum"
            }
        ]
    },
    templateParams: {}
};

const GROUPBY_MOCK = {
    template: {
        from: "8lhtiptwp-2022_vision_providers.csv",
        fromS3: true,
        columns: [
            {
                name: "STATE",
                type: "Text",
                aggregate: "count"
            },
        ],
        where: [],
        groupby: "STATE"
    },
    templateParams: {}
};

const GEO_MOCK = {
    template: {
        from: "test.parquet",
        fromS3: true,
        columns: [
            {
                name: "id",
                type: "Text"
            },
            {
                name: "geometry",
                type: "Geometry (WKT)"
            }
        ]
    },
    templateParams: {}
}

const SIMPLE_RESULT = `select "place", "time", "felt", "magType", "mag", "x", "y", "title", "mmi", "index" from 's3://data-api-dev/8lhqoefc7-earthquakes.csv' where "mag" > '7' and "x" >= '0' and "x" <= '90' and "y" >= '0' and "y" <= '90';`;
const JOIN_RESULT = `select t0."Pop Density", t0."Total Pop", t1."Pop NH White", t1."Pop NH Black", t1."Pop NH AmIn", t1."Pop NH Asian", t1."Pop NH HawaiianPI", t1."Pop NH Other", t1."Pop NH Multiple", t1."Pop Hispanic", t0."FIPS" from 's3://data-api-dev/8lhrsgvfu-STATE_POP_2020.csv' as t0 inner join 's3://data-api-dev/8lhrslj7u-2020_STATE_RACE.csv' as t1 on t0."FIPS" = t1."GEOID";`;
const AGG_RESULT = `select avg("index"), sum("index") from 's3://data-api-dev/8lhqoefc7-earthquakes.csv';`;
const GROUPBY_RESULT = `select count("STATE"), "STATE" from 's3://data-api-dev/8lhtiptwp-2022_vision_providers.csv' group by "STATE";`;
const GEO_RESULTS  = `select "id", ST_GEOGFROMTEXT("geometry") as geometry from 's3://data-api-dev/test.parquet';`;

const tests = [
    {
        name: "Simple",
        input: SIMPLE_MOCK,
        output: SIMPLE_RESULT
    },
    {
        name: "Join",
        input: JOIN_MOCK,
        output: JOIN_RESULT
    },
    {
        name: "Aggregate",
        input: AGG_MOCK,
        output: AGG_RESULT
    },
    {
        name: "Group By",
        input: GROUPBY_MOCK,
        output: GROUPBY_RESULT
    },
    {
        name: "Geo",
        input: GEO_MOCK,
        output: GEO_RESULTS
    }
];
const test = () => {
    console.log("STARTING FORMAT SQL TESTS");
    tests.forEach(test => {
        // @ts-ignore
        const output = formatSql(test.input);
        const passed = output.ok && output.result == test.output;
        if (!passed) {
            console.log(`FAILED ${test.name} FORMAT SQL`, output);
            process.exit(1);
        } else {
            console.log(`PASSED ${test.name} FORMAT SQL`);
        }
    });

    console.log("PASSED FORMAT SQL TESTS");
};

export default test;
