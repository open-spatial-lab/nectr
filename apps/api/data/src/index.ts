import { metricScope, Unit } from "aws-embedded-metrics";
import { Context, APIGatewayProxyCallback, APIGatewayEvent } from "aws-lambda";
import Connection from "./connection";
import getLogger from "./logger";
import { QueryResponse } from "./types";
import Papa from "papaparse";

const connection = new Connection();
const logger = getLogger();

export const handler = metricScope(
    metrics =>
        async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) => {
            const requestLogger = logger.child({ requestId: context.awsRequestId });
            requestLogger.debug({ event, context });
            metrics.putDimensions({ Service: "QueryService" });
            metrics.setProperty("RequestId", context.awsRequestId);
            const id = event.pathParameters?.["id"];
            const params = event?.queryStringParameters || {};

            if (!id) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: "Invalid request. Please send a request followed by an ID.",
                        request: {
                            event
                        }
                    })
                };
            }

            const queryStartTimestamp = new Date().getTime();
            await connection.initialize();

            const data = event?.body
                ? await connection.handleRawQuery(event.body)
                : await connection.handleIdQuery(id, params);

            requestLogger.debug({ data });

            metrics.putMetric(
                "QueryDuration",
                new Date().getTime() - queryStartTimestamp,
                Unit.Milliseconds
            );

            if (data.ok) {

                const result = params["format"] === "csv" ? Papa.unparse(data.result) : JSON.stringify(data.result);
                return {
                    statusCode: 200,
                    body: result
                };
            } else {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ ...data, params })
                };
            }
        }
);

process.on("SIGTERM", async () => {
    logger.debug("[runtime] SIGTERM received");
    logger.debug("[runtime] cleaning up");
    logger.debug("[runtime] exiting");
    process.exit(0);
});
