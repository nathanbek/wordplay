import type Translations from "../nodes/Translations";
import { STREAM_NATIVE_TYPE_NAME } from "../nodes/StreamType";
import None from "./None";
import Primitive from "./Primitive";
import type Value from "./Value";
import type Evaluator from "./Evaluator";
import type LanguageCode from "../nodes/LanguageCode";

export default abstract class Stream extends Primitive {

    /** The evaluator listening to this stream. */
    evaluator: Evaluator;

    /** The stream of values */
    values: Value[] = [];

    /** Listeners watching this stream */
    reactors: ((stream: Stream)=>void)[] = [];

    constructor(evaluator: Evaluator, initalValue: Value) {
        super();

        this.evaluator = evaluator;
        this.add(initalValue);
    }

    abstract getTranslations(): Translations;
    
    getDescriptions(): Translations { return this.getTranslations(); }

    getNames() { return Array.from(new Set(Object.values(this.getTranslations()))); }
    getTranslation(lang: LanguageCode): string { return this.getTranslations()[lang]; }

    hasName(name: string) { return Object.values(this.getTranslations()).includes(name); }

    isEqualTo(value: Value): boolean {
        return value === this;
    }

    add(value: Value) {

        // If we're stepping, then we don't add anything to the stream; time is frozen, and the outside world is ignored.
        // Notify the evaluator so the front end can communicate the ignored feedback.
        if(!this.evaluator.isPlaying()) {
            this.evaluator.ignoredStream(this);
            return;
        }

        // Update the time.
        this.values.push(value);

        // Limit the array to 1000 ticks to avoid leaking memory.
        this.values.splice(0, Math.max(0, this.values.length - 1000));

        // Notify subscribers of the state change.
        this.notify();

    }

    getNativeTypeName(): string { return STREAM_NATIVE_TYPE_NAME; }

    latest() { return this.values[this.values.length - 1]; }

    at(index: number): Value {

        const position = this.values.length - index - 1;
        return position >= 0 && position < this.values.length ? this.values[position] : new None();

    }

    listen(listener: (stream: Stream)=>void) {
        this.reactors.push(listener);
    }

    ignore(listener: (stream: Stream)=> void) {
        this.reactors = this.reactors.filter(l => l !== listener);
    }

    notify() {
        // Tell each reactor that this stream changed.
        this.reactors.forEach(reactor => reactor(this));
    }

    /** Should produce valid Wordplay code string representing the stream's name */
    toString() { return this.getTranslations()["😀"]; };

    /** Should return named values on the stream. */
    resolve(): Value | undefined { return undefined; }

    /** Should start whatever is necessary to start listening to data stream. */
    abstract start(): void;

    /** Should do whatever cleanup is necessary to stop listening to a data stream */
    abstract stop(): void;

}