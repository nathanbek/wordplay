import type { Replacement } from './Node';
import Names from './Names';
import type LanguageCode from '@locale/LanguageCode';
import type Locale from '@locale/Locale';
import NameType from './NameType';
import Glyphs from '../lore/Glyphs';
import Purpose from '../concepts/Purpose';
import Node from './Node';

export default class TypeVariable extends Node {
    readonly names: Names;

    constructor(names: Names) {
        super();

        this.names = names;

        this.computeChildren();
    }

    getGrammar() {
        return [{ name: 'names', types: [Names] }];
    }

    clone(replace?: Replacement) {
        return new TypeVariable(
            this.replaceChild('names', this.names, replace)
        ) as this;
    }

    getPurpose() {
        return Purpose.Bind;
    }

    getReference(): NameType {
        return NameType.make(this.names.getNames()[0], this);
    }

    getNames() {
        return this.names.getNames();
    }

    hasName(name: string) {
        return this.names.hasName(name);
    }

    getLocale(languages: LanguageCode | LanguageCode[]) {
        return this.names.getLocaleText(
            Array.isArray(languages) ? languages : [languages]
        );
    }

    computeConflicts() {}

    getNodeLocale(translation: Locale) {
        return translation.node.TypeVariable;
    }

    getGlyphs() {
        return Glyphs.Name;
    }
}
