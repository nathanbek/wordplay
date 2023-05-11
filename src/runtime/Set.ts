import type Context from '@nodes/Context';
import SetType from '@nodes/SetType';
import UnionType from '@nodes/UnionType';
import Bool from './Bool';
import Measurement from './Measurement';
import Primitive from './Primitive';
import type Value from './Value';
import type LanguageCode from '@locale/LanguageCode';
import { SET_CLOSE_SYMBOL, SET_OPEN_SYMBOL } from '@parser/Symbols';
import type { NativeTypeName } from '../native/NativeConstants';
import type Locale from '@locale/Locale';
import type Expression from '../nodes/Expression';

export default class Set extends Primitive {
    readonly values: Value[];

    constructor(creator: Expression, values: Value[]) {
        super(creator);

        this.values = [];
        values.forEach((v) => {
            if (this.values.find((v2) => v.isEqualTo(v2)) === undefined)
                this.values.push(v);
        });
    }

    size(requestor: Expression) {
        return new Measurement(requestor, this.values.length);
    }

    has(requestor: Expression, key: Value) {
        return new Bool(
            requestor,
            this.values.find((v) => key.isEqualTo(v)) !== undefined
        );
    }

    add(requestor: Expression, element: Value) {
        return new Set(requestor, [...this.values, element]);
    }

    remove(requestor: Expression, element: Value) {
        return new Set(
            requestor,
            this.values.filter((v) => !v.isEqualTo(element))
        );
    }

    union(requestor: Expression, set: Set) {
        const values = this.values.slice();
        set.values.forEach((v) => {
            if (values.find((e) => e.isEqualTo(v)) === undefined)
                values.push(v);
        });
        return new Set(requestor, values);
    }

    intersection(requestor: Expression, set: Set) {
        const values: Value[] = [];
        this.values.forEach((v) => {
            if (set.values.find((e) => e.isEqualTo(v)) !== undefined)
                values.push(v);
        });
        return new Set(requestor, values);
    }

    difference(requestor: Expression, set: Set) {
        // Remove any values from this set that occur in the given set.
        return new Set(
            requestor,
            this.values.filter(
                (v1) => set.values.find((v2) => v1.isEqualTo(v2)) === undefined
            )
        );
    }

    isEqualTo(set: Value): boolean {
        return (
            set instanceof Set &&
            set.values.length === this.values.length &&
            this.values.every(
                (val) =>
                    set.values.find((val2) => val.isEqualTo(val2)) !== undefined
            )
        );
    }

    getType(context: Context) {
        return SetType.make(
            UnionType.getPossibleUnion(
                context,
                this.values.map((v) => v.getType(context))
            )
        );
    }

    getNativeTypeName(): NativeTypeName {
        return 'set';
    }

    toWordplay(languages: LanguageCode[]): string {
        return `${SET_OPEN_SYMBOL}${Array.from(this.values)
            .map((value) => value.toWordplay(languages))
            .join(' ')}${SET_CLOSE_SYMBOL}`;
    }

    getDescription(translation: Locale) {
        return translation.data.set;
    }

    getSize() {
        let sum = 0;
        for (const value of this.values) sum += value.getSize();
        return sum;
    }
}
