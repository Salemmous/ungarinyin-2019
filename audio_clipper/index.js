// aws s3 cp s3://ungarinyin-us-2019/SoundFiles audio --recursive
// aws s3 cp audio_sliced s3://ungarinyin-us-2019/SoundFilesSliced --recursive

const { spawnSync } = require("child_process");
const { readdirSync, mkdirSync } = require("fs");

const sliceAudio = (filename, from, to, output) =>
    spawnSync(
        "ffmpeg",
        ["-i", filename, "-acodec", "copy", "-ss", from, "-to", to, output],
        { shell: true }
    );

const secToDuration = totalSeconds => {
    const flooredSeconds = Math.floor(totalSeconds);
    const hours = Math.floor(flooredSeconds / 3600);
    const minutes = Math.floor((flooredSeconds - hours * 3600) / 60);
    const seconds = Math.floor(flooredSeconds - hours * 3600 - minutes * 60);
    return `${hours < 10 ? "0" : ""}${hours}:${
        minutes < 10 ? "0" : ""
    }${minutes}:${seconds < 10 ? "0" : ""}${seconds}.0`;
};

const halfDuration = 60;

const sliceAudioFileInMiddle = ({ filename, duration }, input, output) =>
    sliceAudio(
        `"${input}/${filename}"`,
        secToDuration(duration - halfDuration),
        secToDuration(duration + halfDuration),
        `"${output}/${filename}"`
    );

const sliceAudioFile = ({ filename, duration }, input, output) => {
    console.log(
        filename,
        `ffmpeg -i "${input}/${filename}" -acodec copy -ss ${secToDuration(
            duration / 4 - halfDuration
        )} -to ${secToDuration(
            duration / 4 + halfDuration
        )} "${output}/1_${filename}"`,
        secToDuration(duration / 4 - halfDuration),
        secToDuration(halfDuration * 2)
    );
    sliceAudio(
        `"${input}/${filename}"`,
        secToDuration(duration / 4 - halfDuration),
        secToDuration(duration / 4 + halfDuration),
        `"${output}/1_${filename}"`
    );
    sliceAudio(
        `"${input}/${filename}"`,
        secToDuration((duration / 4) * 3 - halfDuration),
        secToDuration((duration / 4) * 3 + halfDuration),
        `"${output}/2_${filename}"`
    );
};

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
    spawnSync("rm", ["-rf", DIR2], { shell: true });
    mkdirSync(DIR2);
    const fileList = getFiles(DIR);
    const audioFiles = fileList.map(filename => ({
        filename,
        duration: getDuration(`${DIR}/${filename}`)
    }));
    /*console.log(
        (audioFiles.reduce((acc, cur) => acc + cur.duration, 0) - 3600) * 0.0004
    );*/
    audioFiles.forEach(file => sliceAudioFile(file, DIR, DIR2));
}

main().catch(console.error);
