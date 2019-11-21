const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const textract = new AWS.Textract();

async function getTextract(JobId) {
    let finished = false;
    let results = [];
    let paginationToken = null;
    while (!finished) {
        const res = await textract
            .getDocumentTextDetection({
                JobId: JobId,
                NextToken: paginationToken
            })
            .promise();

        results = [...results, res.Blocks];

        paginationToken = res.NextToken;
        finished = !paginationToken;
    }
    return results;
}

exports.handler = async function(event, context) {
    console.log("Started OCR storing");
    const records = event.Records;
    await Promise.all(
        records
            .map(record => record.Sns)
            .filter(el => !!el)
            .map(record => record.Message)
            .filter(el => !!el)
            .map(async record => {
                const obj = JSON.parse(record);
                console.log(obj);
                const filename = obj.DocumentLocation.S3ObjectName.replace(
                    "Typescripts",
                    "OCR"
                ).replace("pdf", "json");
                try {
                    const res = await getTextract(obj.JobId);
                    await s3
                        .putObject({
                            Bucket: process.env.BUCKET_NAME,
                            Key: filename,
                            ContentType: "application/json",
                            Body: Buffer.from(JSON.stringify(res), "binary")
                        })
                        .promise();
                } catch (e) {
                    console.error("Error when processing", filename);
                    console.error(e);
                }
            })
    );
};
