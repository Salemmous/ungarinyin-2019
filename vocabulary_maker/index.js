const AWS = require("aws-sdk");
const { key, secret } = require("./credentials.json");
const { writeFileSync } = require("fs");

async function getDocumentContent(s3, Key) {
    const res = await s3
        .getObject({
            Bucket: "ungarinyin-us-2019",
            Key
        })
        .promise();
    const objectData = res.Body.toString("utf-8");
    return JSON.parse(objectData).reduce(
        (acc, cur) => [...acc, ...(Array.isArray(cur) ? cur : [cur])],
        []
    );
}

async function main() {
    const s3 = new AWS.S3({ accessKeyId: key, secretAccessKey: secret });
    console.log("Listing files...");
    const { Contents: files } = await s3
        .listObjects({ Bucket: "ungarinyin-us-2019", Prefix: "OCR" })
        .promise();
    console.log("Files listed!");
    console.log("Getting file contents...");
    const filesContent = await Promise.all(
        files.map(file => getDocumentContent(s3, file.Key))
    );
    console.log("File contents retrieved!");
    console.log("Iterating through words...");
    const words = filesContent.reduce(
        (acc, file) =>
            file
                .filter(
                    ({ BlockType, Text }) =>
                        BlockType === "WORD" && !Text.match(/\d/)
                )
                .map(({ Text }) =>
                    Text.toLowerCase()
                        .replace(/\(/, " (")
                        .replace(/\)/, ") ")
                        .replace(/\./, "")
                        .trim()
                        .replace(/^\((.*)\)$/, (_, word) => word)
                        .replace(/^"(.*)"$/, (_, word) => word)
                )
                .reduce((acc, cur) => acc.add(cur), acc),
        new Set()
    );
    console.log("Words iterated!");
    console.log("Writing results to file...");
    const vocabJSON = JSON.stringify(Array.from(words));
    writeFileSync("vocab.json", vocabJSON);
    console.log("Results written to file!");
}

main().catch(console.error);
