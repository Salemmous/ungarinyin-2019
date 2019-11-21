import { writable } from "svelte/store";
import { subscribeToChanges, getCredentials } from "./aws.config";
import * as AWS from "aws-sdk";

export const documents = writable([]);
export const currentDocument = writable("");

function getS3() {
    const { key: accessKeyId, secret: secretAccessKey } = getCredentials();
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey });
    return s3;
}

subscribeToChanges(async () => {
    const s3 = getS3();

    const res = await s3
        .listObjects({ Bucket: "ungarinyin-us-2019", Prefix: "Typescripts" })
        .promise();

    documents.set(
        res.Contents.map(file => ({
            ...file,
            Name: file.Key.replace("Typescripts/", "").replace(".pdf", "")
        }))
    );
});

export async function getPDFDocumentURL(Key) {
    const s3 = getS3();

    const url = await s3.getSignedUrlPromise("getObject", {
        Bucket: "ungarinyin-us-2019",
        Key
    });
    return url;
}

export async function getDocumentContent(Key) {
    const s3 = getS3();

    const res = await s3
        .getObject({
            Bucket: "ungarinyin-us-2019",
            Key
        })
        .promise();
    const objectData = res.Body.toString("utf-8");
    return JSON.parse(objectData);
}

export async function setDocumentContent(Key, content) {
    const s3 = getS3();

    await s3
        .putObject({
            Bucket: "ungarinyin-us-2019",
            Key,
            ContentType: "binary",
            Body: Buffer.from(JSON.stringify(content), "binary")
        })
        .promise();
}
