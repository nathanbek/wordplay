import type Names from '@nodes/Names';
import Unit from '@nodes/Unit';
import Measurement from '@runtime/Measurement';
import Stream from '@runtime/Stream';
import Structure, { createStructure } from '@runtime/Structure';
import type Value from '@runtime/Value';
import type Evaluator from '@runtime/Evaluator';
import StreamDefinition from '@nodes/StreamDefinition';
import { getDocTranslations } from '@translation/getDocTranslations';
import { getNameTranslations } from '@translation/getNameTranslations';
import StructureDefinitionType from '@nodes/StructureDefinitionType';
import { PlaceType } from '@output/Place';
import StreamType from '@nodes/StreamType';
import createStreamEvaluator from './createStreamEvaluator';

function position(evaluator: Evaluator, x: number, y: number) {
    const bindings = new Map<Names, Value>();
    bindings.set(
        PlaceType.inputs[0].names,
        new Measurement(evaluator.getMain(), x, Unit.make(['px']))
    );
    bindings.set(
        PlaceType.inputs[0].names,
        new Measurement(evaluator.getMain(), y, Unit.make(['px']))
    );
    return createStructure(evaluator, PlaceType, bindings);
}

export default class Pointer extends Stream<Structure> {
    readonly evaluator: Evaluator;
    on: boolean = false;

    constructor(evaluator: Evaluator) {
        super(evaluator, PointerDefinition, position(evaluator, 0, 0));

        this.evaluator = evaluator;
    }

    record(x: number, y: number) {
        if (this.on) this.add(position(this.evaluator, x, y));
    }

    start() {
        this.on = true;
    }
    stop() {
        this.on = false;
    }

    getType() {
        return StreamType.make(new StructureDefinitionType(PlaceType, []));
    }
}

export const PointerDefinition = StreamDefinition.make(
    getDocTranslations((t) => t.input.mouseposition.doc),
    getNameTranslations((t) => t.input.mouseposition.name),
    [],
    createStreamEvaluator(
        new StructureDefinitionType(PlaceType),
        Pointer,
        (evaluation) => new Pointer(evaluation.getEvaluator()),
        () => {}
    ),
    new StructureDefinitionType(PlaceType)
);
