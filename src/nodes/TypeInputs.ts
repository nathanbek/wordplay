import type Locale from '@locale/Locale';
import Purpose from '../concepts/Purpose';
import Glyphs from '../lore/Glyphs';
import { TYPE_CLOSE_SYMBOL, TYPE_OPEN_SYMBOL } from '../parser/Symbols';
import type { Replacement } from './Node';
import Token from './Token';
import TokenType from './TokenType';
import Type from './Type';
import Node from './Node';

export default class TypeInputs extends Node {
    readonly open: Token;
    readonly types: Type[];
    readonly close: Token | undefined;

    constructor(open: Token, types: Type[], close: Token | undefined) {
        super();

        this.open = open;
        this.types = types;
        this.close = close;

        this.computeChildren();
    }

    static make(types: Type[]) {
        return new TypeInputs(
            new Token(TYPE_OPEN_SYMBOL, TokenType.TypeOpen),
            types,
            new Token(TYPE_CLOSE_SYMBOL, TokenType.TypeClose)
        );
    }

    getPurpose() {
        return Purpose.Evaluate;
    }

    getGrammar() {
        return [
            { name: 'open', types: [Token] },
            { name: 'types', types: [[Type]] },
            { name: 'close', types: [Token, undefined] },
        ];
    }

    clone(replace?: Replacement) {
        return new TypeInputs(
            this.replaceChild('open', this.open, replace),
            this.replaceChild('types', this.types, replace),
            this.replaceChild('close', this.close, replace)
        ) as this;
    }

    computeConflicts() {}

    getNodeLocale(translation: Locale) {
        return translation.node.TypeInputs;
    }

    getGlyphs() {
        return Glyphs.Type;
    }
}
