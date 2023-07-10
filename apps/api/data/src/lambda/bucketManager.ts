import * as s3 from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as fs from "fs";
import * as zlib from "zlib";
import path from "path";
import { fileURLToPath } from "url";

export class BucketManager {
    s3: s3.S3;
    bucket: string = "data-api-dev";
    region: string = "us-east-2";

    constructor(bucket: string, region: string) {
        this.bucket = bucket;
        this.region = region;
        this.s3 = new s3.S3({ region: region });
    }

    async getFileBody(Key: string): Promise<s3.GetObjectCommandOutput["Body"]> {
        const { Body } = await this.s3.getObject({
            Bucket: this.bucket,
            Key
        });
        return Body;
    }

    writeFile(body, fileName) {
        return new Promise(async (resolve, reject) => {
            const destination = fs.createWriteStream(fileName);
            const pipe = body.pipe(destination);
            pipe.on("finish", () => {
                resolve(true);
            });
            pipe.on("error", e => {
                console.error(e);
                reject();
            });
        });
    }
    decompressAndWriteFile(inputFile, outputFile): Promise<string> {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(inputFile);
            const writeStream = fs.createWriteStream(outputFile);
            const gunzip = zlib.createGunzip();

            console.log("MADE READ/WRITE AND GUNZIP");
            readStream.pipe(gunzip).pipe(writeStream);

            writeStream.on("finish", () => {
                resolve("File decompressed and written successfully.");
            });

            writeStream.on("error", err => {
                console.log(`Error writing to the output file: ${err}`);
                reject(`Error writing to the output file: ${err}`);
            });
        });
    }

    async downloadFile(Key: string, fileName: string): Promise<boolean | unknown> {
        const body = await this.getFileBody(Key);
        console.log("BODY TYPE", typeof body);
        const writeResponse = await this.writeFile(body, fileName);
        return writeResponse;
    }

    // getS3Url(key: string): string {
    //     return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    // }

    // async getPresignedUrl(key: string, expires?: number): Promise<string> {
    //     const params = {
    //         Bucket: this.bucket,
    //         Key: key
    //     };
    //     const command = new s3.GetObjectCommand(params);
    //     return await getSignedUrl(this.s3, command, { expiresIn: expires });
    // }

    // async fetchFile(key: string): Promise<s3.GetObjectCommandOutput | undefined> {
    //     const params = {
    //         Bucket: this.bucket,
    //         Key: key
    //     };
    //     s3.getObjec
    //     const data = await this.s3.send(new s3.GetObjectCommand(params));
    //     const body = data.Body
    //     body.pipe
    //     return data;
    // }
    // async fetchAndWriteFile(key: string, path: string): Promise<void> {
    //     const data = await this.fetchFile(key);
    //     if (!data?.Body) return;
    //     console.log("writing file", path);

    // }
    // async fetchAndUnzipFile(key: string, path: string): Promise<void> {
    //     const data = await this.fetchFile(key);
    //     if (!data?.Body) return;
    //     console.log("unzipping file", path);
    //     const dataBuffer = await data?.Body.transformToWebStream();
    //     console.log("dataBuffered")
    //     fs.writeFileSync(`${path}.gz`, dataBuffer);
    //     console.log("wrote file")
    //     const readStream = fs.createReadStream(`${path}.gz`);
    //     console.log("created read stream")
    //     const gunzip = zlib.createGunzip();
    //     console.log("created gunzip")
    //     const writeStream = fs.createWriteStream(path);
    //     console.log("created write stream")
    //     // @ts-ignore
    //     readStream.pipe(gunzip).pipe(writeStream);
    //     console.log("piped streams")
    //     await new Promise((resolve, reject) => {
    //         writeStream.on("finish", resolve);
    //         writeStream.on("error", reject);
    //     });
    // }

    // async putFile(key: string, body: s3.PutObjectCommandInput["Body"]): Promise<void> {
    //     const params = {
    //         Bucket: this.bucket,
    //         Key: key,
    //         Body: body
    //     };
    //     await this.s3.send(new s3.PutObjectCommand(params));
    // }

    formatKey(id: string, params: Record<string, string>): string {
        const query = Object.entries(params)
            .filter(([key, value]) => key !== "__dangerous_raw__" && key !== "__metadata__")
            .map(([key, value]) => `${key}=${value}`)
            .join("&");
        return `${id}?${query}`;
    }

    async checkUseCache(key: string, invalidationDate: Date): Promise<boolean> {
        const params = {
            Bucket: this.bucket,
            Key: key
        };
        const data = await this.s3.send(new s3.HeadObjectCommand(params));
        if (!data?.LastModified) {
            return false;
        }
        return data?.LastModified > invalidationDate;
    }

    // async fetchExtensions() {}
}
