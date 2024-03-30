import http from "http";
import { createReadStream, createWriteStream, existsSync, } from "fs"
import { readFile } from "fs/promises";
import { Readable } from "stream";
import Files from "./src/Files.js";
import Progress from "./src/Progress.js";

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
    return args.slice(2);
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

// Add controllers and services
// Maybe Database
// Increase functionality

// CLI

const args = parseMultiArgs(process.argv);

if(args.length > 0) {
    if(verifyLink(args[0])) download(args[0], args[1]);
}
else {
    async function getData(path) {
        const data = await readFile(path, {
            encoding: 'utf-8'
        })
    
        return data;    
    }

    // SERVER
    // For directory downloads to phone

    // TODO: Add interactive UI
    // TODO: Fix when done with project

    const PORT = 5000;

    const files = new Files();

    const directory = files.getDir("content");

    console.log(directory);

    const html = `
        ${directory.map(file => `
            <div>
                <a href="content/${file.name}" download>${file.name}</a>
            </div>
        `)}
    `;

    const routes = {
        // '/': await getData('index.html'),
        '/': html,
    }

    const server = http.createServer(async (req, res) => {
        console.log("URL: ", req.url);
        console.log("METHOD: ", req.method);

        if(req.url.match(/^\/content/)) {
            const pathToFile = req.url.slice(1);

            console.log("Path: ", pathToFile);

            if(!existsSync(pathToFile)) routes[req.url] = "Does Not Exist";
            else routes[req.url] = await getData(pathToFile)
        }

        if(req.method == 'POST') {
            let body = "";

            req.on('data', chunk => {
                body += chunk.toString();
            })

            req.on('end', () => {
                console.log(body);

                const parsedUrl = new URLSearchParams(body)

                const fileName = parsedUrl.get("text");
                
                console.log(fileName);
                
                res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    
                createReadStream(fileName).pipe(res);
            });
        }
        else {
            const route = req.url;

            if(req.url.match(/^\/content/)) {
                const fileName = req.url.slice(9);

                res.setHeader('Content-disposition', 'attachment; filename=' + fileName);

                createReadStream(req.url.slice(1)).pipe(res);
            }
            else {
                res.end(routes[route]);
            }
        }
    })

    server.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`);
    })
    
    process.on('SIGINT', () => process.exit(1))
}