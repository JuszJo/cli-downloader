import { readdirSync } from "fs"

export default class Files {
    getDir(path) {
        const directory = readdirSync(path, {withFileTypes: true});

        return directory;
    }
}