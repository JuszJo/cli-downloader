export default class Progress {
    size = null;
    buffer = 0;

    constructor(sizeValue) {
        this.size = sizeValue;
        if(!this.size) this.size = 1;
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