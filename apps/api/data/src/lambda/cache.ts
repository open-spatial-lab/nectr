export default class CacheService {
  //   getCacheKey(params: APIGatewayProxyEventQueryStringParameters) {
  //     const sortedParams = Object.keys(params)
  //         .sort()
  //         .reduce((acc, key) => {
  //             acc[key] = params[key];
  //             return acc;
  //         }, {} as APIGatewayProxyEventQueryStringParameters);
  //     const cacheKey = JSON.stringify(sortedParams);
  //     return cacheKey;
  // }
  // async checkCache(
  //     id: string,
  //     params: APIGatewayProxyEventQueryStringParameters // : Promise<QueryResponse<{CACHED_FILE: string}, string>>
  // ) {
  //     const cacheKey = this.getCacheKey(params);
  //     const options = {
  //         filters: [{ attr: "content", eq: cacheKey }]
  //     };
  //     const cachedEntry = await table.query(`CACHE#${id}`, options);
  // }
  // async cacheResult(
  //     id: string,
  //     params: APIGatewayProxyEventQueryStringParameters,
  //     result: string | Object
  // ) {
  //     const timeStamp = +new Date();
  //     const fileSuffix = params["format"] === "csv" ? ".csv" : ".json";
  //     const fileId = `${id}-${timeStamp}${fileSuffix}`;
  //     const cacheKey = this.getCacheKey(params);
  //     const entry = {
  //         PK: `CACHE#${id}`,
  //         SK: timeStamp,
  //         id: fileId,
  //         content: cacheKey
  //     };
  //     try {
  //         const id = uuid();
  //         const stringifiedResult =
  //             params["format"] === "csv" ? Papa.unparse(result) : JSON.stringify(result);
  //         const putResult = await s3
  //             .putObject({
  //                 Bucket: DATA_S3_BUCKET,
  //                 Key: id,
  //                 Body: stringifiedResult,
  //                 ContentType: params["format"] === "csv" ? "text/csv" : "application/json",
  //                 ACL: "public-read"
  //             })
  //             .promise();
  //     } catch (err) {
  //         console.log("s3 put err", JSON.stringify(err));
  //     }
  //     try {
  //         const entryResult = await ResultCacheEntity.put(entry);
  //     } catch (err) {
  //         console.log("ddb put err", JSON.stringify(err));
  //     }
  //     // const [putResult, entryResult] = await Promise.all([
  //     //     s3
  //     //         .putObject({
  //     //             Bucket: S3_BUCKET,
  //     //             Key: fileId,
  //     //             Body: typeof result === "string" ? result : JSON.stringify(result),
  //     //             ContentType: params["format"] === "csv" ? "text/csv" : "application/json",
  //     //             ACL: "public-read"
  //     //         })
  //     //         .promise(),
  //     //     ResultCacheEntity.put(entry)
  //     // ]);
  //     // console.log(putResult, entryResult);
}
