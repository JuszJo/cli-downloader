import { createWriteStream, existsSync, readFile, writeFile } from "fs"
import { Readable } from "stream";

class Progress {
    size = null;
    buffer = 0;

    constructor(sizeValue) {
        this.size = sizeValue;
    }

    update(value) {
        this.buffer += value;
    }

    getProgress() {
        return (this.buffer / this.size) * 100;
    }

    #displayProgress() {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(this.getProgress().toFixed(0) + "%");
    }
}

function singleLineDisplay(value) {
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
    process.stdout.write(value);
}

function verifyLink(link) {
    const regex = /^https:\/\//;

    return regex.exec(link);
}

function parseSingleArg(args) {
    const singleArg = args[2];

    return singleArg;
}

function parseMultiArgs(args) {
    if(args.length < 4) throw new Error("MISSING ARGUMENTS");
    else return args.slice(2);
}

function verifyResponse(response) {
    if(response.ok) return true;

    return false;
}

function handleBadResponse(response) {
    console.error("RESPONSE NOT OKAY");

    setTimeout(() => {
        console.log("CLOSING TERMINAL IN SOME SECONDS");

        process.exit(1);
    }, 3000);
}

function getResponseSize(response) {
    return response.headers.get("content-length");
}

function handleDataEvent(chunk, progress) {
    progress.update(Buffer.from(chunk).byteLength);
}

function handleGoodResponse(response, newName) {
    const responseSize = getResponseSize(response);

    const progress = new Progress(responseSize);

    const writeStream = createWriteStream(`${newName}`, {highWaterMark: 16384 * 4});

    const readableStream = Readable.fromWeb(response.body, {highWaterMark: 16384 * 4});

    readableStream.pipe(writeStream);

    readableStream.on('data', chunk => {
        handleDataEvent(chunk, progress);

        const percentValue = progress.getProgress().toFixed(0) + "%";

        singleLineDisplay(percentValue);
    });

    readableStream.on('end', () => {
        console.log(`\nDone, ${newName}`);
    })
}

async function download(link, newName) {
    const response = await fetch(link);

    if(!verifyResponse(response)) handleBadResponse(response);
    else handleGoodResponse(response, newName);
}

// CLI

const args = parseMultiArgs(process.argv);

if(verifyLink(args[0])) download(args[0], args[1]);

// if(verifyLink(argument)) download(argument);
// const argument = parseSingleArg(process.argv);