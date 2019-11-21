// aws s3 cp s3://ungarinyin-us-2019/SoundFiles audio --recursive
// aws s3 cp audio_sliced s3://ungarinyin-us-2019/SoundFilesSliced --recursive

const { spawnSync } = require("child_process");
const { readdirSync } = require("fs");

const sliceAudio = (filename, from, to, output) =>
    spawnSync(
        "ffmpeg",
        ["-i", filename, "-acodec", "copy", "-ss", from, "-t", to, output],
        { shell: true }
    );

const secToDuration = totalSeconds => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
    const seconds = totalSeconds - hours * 3600 - minutes * 60;
    return `${hours < 10 ? "0" : ""}${hours}:${
        minutes < 10 ? "0" : ""
    }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const halfDuration = 300;

const sliceAudioFileInMiddle = ({ filename, duration }, input, output) =>
    sliceAudio(
        `"${input}/${filename}"`,
        secToDuration(duration - halfDuration),
        secToDuration(duration + halfDuration),
        `"${output}/${filename}"`
    );

const getDuration = filename => {
    const { stderr: ffmpeg } = spawnSync("ffmpeg", ["-i", filename, "2>&1"]);
    const output = ffmpeg.toString("utf-8");
    const pattern = /Duration: (\d{2}:\d{2}:\d{2}\.\d{2})/;
    const duration = output.match(pattern)[1];
    const [hours, minutes, seconds] = duration
        .split(/\.|:/)
        .map(time => parseInt(time));
    return hours * 3600 + minutes * 60 + seconds;
};

const getFiles = dir => readdirSync(dir);

async function main() {
    const DIR = "audio";
    const DIR2 = "audio_sliced";
    const fileList = getFiles(DIR);
    const audioFiles = fileList.map(filename => ({
        filename,
        duration: getDuration(`${DIR}/${filename}`)
    }));
    audioFiles.forEach(file => sliceAudioFileInMiddle(file, DIR, DIR2));
}

main().catch(console.error);
