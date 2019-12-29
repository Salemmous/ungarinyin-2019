const AWS = require("aws-sdk");
const { key, secret } = require("./credentials.json");
const { readFileSync, writeFileSync } = require("fs");

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
    return array;
}

/*function toIPA(word) {
    return word
        .replace("ng", "ŋ")
        .replace("rn", "ɳ")
        .replace("ny", "ɲ")
        .replace("o", "ɔ")
        .replace("rr", "r")
        .replace("r", "ɻ")
        .replace("ly", "lj")
        .replace("a", "ɑ")
        .replace("rd", "ɖ")
        .replace("e", "ε")
        .replace("j", "ɟ")
        .replace("y", "j")
        .replace("w", "ʋ")
        .replace("l", "ɭ");
}*/
function toIPA(word) {
    return word
        .replace(/./g, letter => ` ${letter} `)
        .replace(/\s+/, " ")
        .trim()
        .replace(/e/g, "ɛ")
        .replace(/a/g, "ɑ")
        .replace(/o/g, "ɔ")
        .replace(/j/g, "ʒ")
        .replace(/ng/g, "ŋ")
        .replace(/ny/g, "ɲ")
        .replace(/y/g, "j")
        .replace(/rr/g, "r")
        .replace(/r/g, "ɾ");
}

async function main() {
    const transcribe = new AWS.TranscribeService({
        accessKeyId: key,
        secretAccessKey: secret,
        region: "us-east-1"
    });

    const phrases = shuffle(
        JSON.parse(readFileSync("vocab.json", "utf-8"))
    ).slice(0, 2700);
    const s3 = new AWS.S3({ accessKeyId: key, secretAccessKey: secret });
    /*
    writeFileSync(
        "Vocab.csv",
        "Phrase\tIPA\tSoundsLike\tDisplayAs" +
            phrases
                .filter(phrase => phrase)
                .reduce((acc, cur) => `${acc}\n${cur}\t\t\t${cur}`, ""),
        "utf-8"
    ); //*/
    /*
    await s3
        .putObject({
            Bucket: "ungarinyin-us-2019",
            Key: "Vocab.csv",
            ContentType: "binary",
            Body: Buffer.from(
                "Phrase\tIPA\tSoundsLike\tDisplayAs" +
                    phrases
                        .filter(phrase => phrase)
                        .reduce((acc, cur) => `${acc}\n${cur}\t\t\t${cur}`, ""),
                "binary"
            )
        })
        .promise(); //*/
    //*
    await transcribe
        .updateVocabulary({
            VocabularyName: "Ungarinyin",
            LanguageCode: "en-AU",
            //Phrases: phrases
            VocabularyFileUri: "s3://ungarinyin-us-2019/Vocab.csv"
        })
        .promise(); //*/
}

main().catch(console.error);
