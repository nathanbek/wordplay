import Purpose from '../concepts/Purpose';
import NodeRef from '../locale/NodeRef';
import ValueRef from '../locale/ValueRef';
import Characters from '../lore/BasisCharacters';
import Content from './Content';
import { node, type Replacement, type Grammar } from './Node';
import Token from './Token';
import Sym from './Sym';
import type Node from './Node';
import type Locales from '../locale/Locales';
import ConceptRef from '@locale/ConceptRef';
import type { TemplateInput } from '../locale/Locales';
import type { NodeDescriptor } from '@locale/NodeTexts';

/**
 * To refer to an input, use a $, followed by the number of the input desired,
 * starting from 1.
 *
 *      "Hello, my name is $1"
 *
 * To indicate that you want to reuse a common phrase defined in a locale's "terminology" dictionary,
 * use a $ followed by any number of word characters (in regex, /\$\w/). This allows
 * for terminology to be changed globally without search and replace.
 *
 *      "To create a new $program, click here."
 */
export default class Mention extends Content {
    readonly name: Token;

    constructor(name: Token) {
        super();

        this.name = name;
    }

    static getPossibleReplacements() {
        return [new Mention(new Token('_', Sym.Mention))];
    }

    static getPossibleAppends() {
        return [new Mention(new Token('_', Sym.Mention))];
    }

    getDescriptor(): NodeDescriptor {
        return 'Mention';
    }

    getGrammar(): Grammar {
        return [{ name: 'name', kind: node(Sym.Mention) }];
    }
    computeConflicts() {
        return [];
    }

    clone(replace?: Replacement | undefined): this {
        return new Mention(
            this.replaceChild('name', this.name, replace),
        ) as this;
    }

    getPurpose() {
        return Purpose.Document;
    }
    getNodeLocale(locales: Locales) {
        return locales.get((l) => l.node.Mention);
    }

    getCharacter() {
        return Characters.Mention;
    }

    concretize(
        locales: Locales,
        inputs: TemplateInput[],
        replacements: [Node, Node][],
    ): Token | ValueRef | NodeRef | ConceptRef | undefined {
        const name = this.name.getText().slice(1);

        // Terminology reference
        // Is it a number? Resolve to an input.
        const numberMatch = name.match(/^[0-9]+/);
        if (name === '?') {
            const replacement = new Token(
                locales.get((l) => l.ui.template.unwritten),
                Sym.Words,
            );
            replacements.push([this, replacement]);
            return replacement;
        } else if (name === '!') {
            // Just return an empty token.
            const invisible = new Token('', Sym.Words);
            replacements.push([this, invisible]);
            return invisible;
        } else if (numberMatch !== null) {
            // Find the corresponding input
            const number = parseInt(numberMatch[0]);
            const input = inputs[number - 1];

            // Return the matching input, or a placeholder if there wasn't one.
            const replacement =
                input instanceof ValueRef ||
                input instanceof NodeRef ||
                input instanceof ConceptRef
                    ? input
                    : input === undefined
                      ? undefined
                      : new Token(input.toString(), Sym.Words);

            if (replacement instanceof Token)
                replacements.push([this, replacement]);

            return replacement;
        }
        // Try to resolve terminology.
        else {
            const term = locales.getTermByID(name);
            const replacement = term ? new Token(term, Sym.Words) : undefined;

            if (replacement instanceof Token)
                replacements.push([this, replacement]);
            return replacement;
        }
    }

    getDescriptionInputs() {
        return [this.id];
    }

    toText() {
        return this.toWordplay();
    }
}
