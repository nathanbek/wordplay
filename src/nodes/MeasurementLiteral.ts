import Measurement from "../runtime/Measurement";
import type Value from "../runtime/Value";
import type Conflict from "../conflicts/Conflict";
import Expression from "./Expression";
import MeasurementType from "./MeasurementType";
import Token from "./Token";
import type Type from "./Type";
import type Node from "./Node";
import Unit from "./Unit";
import Unparsable from "./Unparsable";
import type Step from "../runtime/Step";
import Finish from "../runtime/Finish";
import { NotANumber } from "../conflicts/NotANumber";
import type Bind from "./Bind";
import type Context from "./Context";
import type { TypeSet } from "./UnionType";
import type Evaluator from "../runtime/Evaluator";
import SemanticException from "../runtime/SemanticException";
import { getPossibleUnits } from "../transforms/getPossibleUnits";
import type Transform from "../transforms/Transform";
import Replace from "../transforms/Replace";
import { getPossiblePostfix } from "../transforms/getPossibleExpressions";
import PlaceholderToken from "./PlaceholderToken";
import type Translations from "./Translations";
import { TRANSLATE } from "./Translations"
import TokenType from "./TokenType";

export default class MeasurementLiteral extends Expression {
    
    readonly number: Token;
    readonly unit: Unit | Unparsable;

    constructor(number?: Token | number, unit?: Unit | Unparsable) {
        super();
        this.number = number === undefined ? new PlaceholderToken() : number instanceof Token ? number : new Token("" + number, TokenType.DECIMAL);
        this.unit = unit === undefined ? new Unit() : unit.withPrecedingSpace("", true);
    }

    clone(pretty: boolean=false, original?: Node | string, replacement?: Node) { 
        return new MeasurementLiteral(
            this.cloneOrReplaceChild(pretty, [ Token ], "number", this.number, original, replacement), 
            this.cloneOrReplaceChild(pretty, [ Unit, Unparsable ], "unit", this.unit, original, replacement)
        ) as this;
    }

    isInteger() { return !isNaN(parseInt(this.number.text.toString())); }

    computeChildren() { return this.unit === undefined ? [ this.number ] : [ this.number, this.unit ]; }

    computeConflicts(): Conflict[] { 
    
        if(new Measurement(this, this.number).num.isNaN())
            return [ new NotANumber(this) ];
        else
            return []; 
    
    }

    computeType(): Type {
        return new MeasurementType(this.number.withPrecedingSpace("", true), this.unit instanceof Unparsable ? undefined : this.unit);
    }

    compile():Step[] {
        return [ new Finish(this) ];
    }

    evaluate(evaluator: Evaluator): Value {

        if(this.unit instanceof Unparsable) return new SemanticException(evaluator, this.unit);
        // This needs to translate between different number formats.
        else return new Measurement(this, this.number, this.unit);
    }

    evaluateTypeSet(bind: Bind, original: TypeSet, current: TypeSet, context: Context) { bind; original; context; return current; }

    getChildReplacement(child: Node, context: Context): Transform[] | undefined {

        const project = context.source.getProject();
        // Any unit in the project
        if(child === this.unit && project !== undefined)
            return getPossibleUnits(project).map(unit => new Replace(context.source, child, unit));

    }

    getInsertionBefore() { return undefined; }

    getInsertionAfter(context: Context): Transform[] | undefined { return getPossiblePostfix(context, this, this.getType(context)); }

    getChildRemoval(child: Node, context: Context): Transform | undefined {
        if(child === this.unit) return new Replace(context.source, child, new Unit());
    }

    getChildPlaceholderLabel(child: Node): Translations | undefined {
        if(child === this.number) return {
            "😀": TRANSLATE,
            eng: "#"
        }
    }

    getDescriptions(): Translations {
        return {
            "😀": TRANSLATE,
            eng: "A number with an optional unit"
        }
    }

    getStartExplanations(): Translations { return this.getFinishExplanations(); }

    getFinishExplanations(): Translations {
        return {
            "😀": TRANSLATE,
            eng: "Evaluate to a measurement!"
        }
    }

}