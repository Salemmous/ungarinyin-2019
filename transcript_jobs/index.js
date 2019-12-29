const AWS = require("aws-sdk");
const { key, secret } = require("./credentials.json");

function getJobName(key) {
    const split = key.replace(/\(|\)|\+|\s|,/g, "_").split("/");
    return split[split.length - 1];
}

async function main() {
    const transcribe = new AWS.TranscribeService({
        accessKeyId: key,
        secretAccessKey: secret,
        region: "us-east-1"
    });

    const s3 = new AWS.S3({ accessKeyId: key, secretAccessKey: secret });
    const { Contents: files } = await s3
        .listObjects({
            Bucket: "ungarinyin-us-2019",
            Prefix: "SoundFilesSliced"
        })
        .promise();
    const {
        TranscriptionJobSummaries: jobs
    } = await transcribe.listTranscriptionJobs({ MaxResults: 50 }).promise();
    const jobNames = jobs.map(
        ({ TranscriptionJobName }) => TranscriptionJobName
    );
    await Promise.all(
        files.map(async file => {
            const name = getJobName(file.Key);
            if (jobNames.includes(name)) return;
            await transcribe
                .startTranscriptionJob({
                    LanguageCode: "en-US",
                    OutputBucketName: "ungarinyin-results",
                    Media: {
                        MediaFileUri: `s3://ungarinyin-us-2019/${file.Key}`
                    },
                    Settings: {
                        ShowAlternatives: true,
                        VocabularyName: "Ungarinyin",
                        MaxAlternatives: 10
                    },
                    TranscriptionJobName: name
                })
                .promise();
        })
    );
}

main().catch(console.error);
