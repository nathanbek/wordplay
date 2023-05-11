import type { NativeTypeName } from '../native/NativeConstants';
import type Locale from '@locale/Locale';
import Type from './Type';
import type TypeSet from './TypeSet';
import type TypeVariable from './TypeVariable';
import Glyphs from '../lore/Glyphs';

export default class VariableType extends Type {
    readonly definition: TypeVariable;

    constructor(definition: TypeVariable) {
        super();

        this.definition = definition;
    }

    getGrammar() {
        return [];
    }

    computeConflicts() {}

    clone() {
        return new VariableType(this.definition) as this;
    }

    /** All types are concrete unless noted otherwise. */
    isGeneric() {
        return true;
    }

    acceptsAll(types: TypeSet) {
        return types
            .list()
            .every(
                (type) =>
                    type instanceof VariableType &&
                    type.definition == this.definition
            );
    }

    getNativeTypeName(): NativeTypeName {
        return 'variable';
    }

    getDefinitionOfNameInScope() {
        return undefined;
    }

    toWordplay() {
        return this.definition.toWordplay();
    }

    getNodeLocale(translation: Locale) {
        return translation.node.VariableType;
    }

    getGlyphs() {
        return Glyphs.VariableType;
    }
}
