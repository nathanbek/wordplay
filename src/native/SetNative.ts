import Bind from '@nodes/Bind';
import Block, { BlockKind } from '@nodes/Block';
import BooleanType from '@nodes/BooleanType';
import FunctionDefinition from '@nodes/FunctionDefinition';
import FunctionType from '@nodes/FunctionType';
import SetType from '@nodes/SetType';
import StructureDefinition from '@nodes/StructureDefinition';
import List from '@runtime/List';
import Text from '@runtime/Text';
import Set from '@runtime/Set';
import { createNativeConversion, createNativeFunction } from './NativeBindings';
import HOFSetFilter from './HOFSetFilter';
import Bool from '@runtime/Bool';
import type Value from '@runtime/Value';
import type Evaluation from '@runtime/Evaluation';
import TypeVariables from '@nodes/TypeVariables';
import { getDocLocales } from '@locale/getDocLocales';
import { getNameLocales } from '@locale/getNameLocales';
import TypeVariable from '@nodes/TypeVariable';
import type Expression from '../nodes/Expression';

export default function bootstrapSet() {
    const SetTypeVariableNames = getNameLocales((t) => t.native.set.kind);
    const SetTypeVariable = new TypeVariable(SetTypeVariableNames);

    const setFilterHOFType = FunctionType.make(
        undefined,
        [
            Bind.make(
                getDocLocales((t) => t.native.set.function.filter.value.doc),
                getNameLocales((t) => t.native.set.function.filter.value.names),
                SetTypeVariable.getReference()
            ),
        ],
        BooleanType.make()
    );

    const equalsFunctionNames = getNameLocales(
        (t) => t.native.set.function.equals.inputs[0].names
    );

    const notEqualFunctionNames = getNameLocales(
        (t) => t.native.set.function.notequals.inputs[0].names
    );

    const addFunctionNames = getNameLocales(
        (t) => t.native.set.function.add.inputs[0].names
    );

    const removeFunctionNames = getNameLocales(
        (t) => t.native.set.function.remove.inputs[0].names
    );

    const unionFunctionNames = getNameLocales(
        (t) => t.native.set.function.union.inputs[0].names
    );

    const intersectionFunctionNames = getNameLocales(
        (t) => t.native.set.function.intersection.inputs[0].names
    );

    const differenceFunctionNames = getNameLocales(
        (t) => t.native.set.function.difference.inputs[0].names
    );

    return StructureDefinition.make(
        getDocLocales((t) => t.native.set.doc),
        getNameLocales((t) => t.native.set.name),
        // No interfaces
        [],
        // One type variable
        TypeVariables.make([SetTypeVariable]),
        // No inputs
        [],
        // Include all of the functions defined above.
        new Block(
            [
                createNativeFunction(
                    getDocLocales((t) => t.native.set.function.equals.doc),
                    getNameLocales((t) => t.native.set.function.equals.name),
                    undefined,
                    [
                        Bind.make(
                            getDocLocales(
                                (t) =>
                                    t.native.set.function.equals.inputs[0].doc
                            ),
                            equalsFunctionNames,
                            SetType.make()
                        ),
                    ],
                    BooleanType.make(),
                    (requestor, evaluation) => {
                        const set = evaluation?.getClosure();
                        const other = evaluation.resolve(equalsFunctionNames);
                        return !(set instanceof Set && other instanceof Set)
                            ? evaluation.getValueOrTypeException(
                                  requestor,
                                  SetType.make(),
                                  other
                              )
                            : new Bool(requestor, set.isEqualTo(other));
                    }
                ),
                createNativeFunction(
                    getDocLocales((t) => t.native.set.function.notequals.doc),
                    getNameLocales((t) => t.native.set.function.notequals.name),
                    undefined,
                    [
                        Bind.make(
                            getDocLocales(
                                (t) =>
                                    t.native.set.function.notequals.inputs[0]
                                        .doc
                            ),
                            notEqualFunctionNames,
                            SetType.make()
                        ),
                    ],
                    BooleanType.make(),
                    (requestor, evaluation) => {
                        const set = evaluation?.getClosure();
                        const other = evaluation.resolve(notEqualFunctionNames);
                        return !(set instanceof Set && other instanceof Set)
                            ? evaluation.getValueOrTypeException(
                                  requestor,
                                  SetType.make(),
                                  other
                              )
                            : new Bool(requestor, !set.isEqualTo(other));
                    }
                ),
                createNativeFunction(
                    getDocLocales((t) => t.native.set.function.add.doc),
                    getNameLocales((t) => t.native.set.function.add.name),
                    undefined,
                    [
                        Bind.make(
                            getDocLocales(
                                (t) => t.native.set.function.add.inputs[0].doc
                            ),
                            addFunctionNames,
                            SetTypeVariable.getReference()
                        ),
                    ],
                    SetType.make(SetTypeVariable.getReference()),
                    (requestor, evaluation) => {
                        const set = evaluation?.getClosure();
                        const element = evaluation.resolve(addFunctionNames);
                        if (set instanceof Set && element !== undefined)
                            return set.add(requestor, element);
                        else
                            return evaluation.getValueOrTypeException(
                                requestor,
                                SetType.make(),
                                set
                            );
                    }
                ),
                createNativeFunction(
                    getDocLocales((t) => t.native.set.function.remove.doc),
                    getNameLocales((t) => t.native.set.function.remove.name),
                    undefined,
                    [
                        Bind.make(
                            getDocLocales(
                                (t) =>
                                    t.native.set.function.remove.inputs[0].doc
                            ),
                            removeFunctionNames,
                            SetTypeVariable.getReference()
                        ),
                    ],
                    SetType.make(SetTypeVariable.getReference()),
                    (requestor, evaluation) => {
                        const set: Evaluation | Value | undefined =
                            evaluation.getClosure();
                        const element = evaluation.resolve(removeFunctionNames);
                        if (set instanceof Set && element !== undefined)
                            return set.remove(requestor, element);
                        else
                            return evaluation.getValueOrTypeException(
                                requestor,
                                SetType.make(),
                                set
                            );
                    }
                ),
                createNativeFunction(
                    getDocLocales((t) => t.native.set.function.union.doc),
                    getNameLocales((t) => t.native.set.function.union.name),
                    undefined,
                    [
                        Bind.make(
                            getDocLocales(
                                (t) => t.native.set.function.union.inputs[0].doc
                            ),
                            unionFunctionNames,
                            SetType.make(SetTypeVariable.getReference())
                        ),
                    ],
                    SetType.make(SetTypeVariable.getReference()),
                    (requestor, evaluation) => {
                        const set: Evaluation | Value | undefined =
                            evaluation.getClosure();
                        const newSet = evaluation.resolve(unionFunctionNames);
                        if (set instanceof Set && newSet instanceof Set)
                            return set.union(requestor, newSet);
                        else
                            return evaluation.getValueOrTypeException(
                                requestor,
                                SetType.make(),
                                set
                            );
                    }
                ),
                createNativeFunction(
                    getDocLocales(
                        (t) => t.native.set.function.intersection.doc
                    ),
                    getNameLocales(
                        (t) => t.native.set.function.intersection.name
                    ),
                    undefined,
                    [
                        Bind.make(
                            getDocLocales(
                                (t) =>
                                    t.native.set.function.intersection.inputs[0]
                                        .doc
                            ),
                            intersectionFunctionNames
                        ),
                    ],
                    SetType.make(SetTypeVariable.getReference()),
                    (requestor, evaluation) => {
                        const set = evaluation.getClosure();
                        const newSet = evaluation.resolve(
                            intersectionFunctionNames
                        );
                        if (set instanceof Set && newSet instanceof Set)
                            return set.intersection(requestor, newSet);
                        else
                            return evaluation.getValueOrTypeException(
                                requestor,
                                SetType.make(),
                                set
                            );
                    }
                ),
                createNativeFunction(
                    getDocLocales((t) => t.native.set.function.difference.doc),
                    getNameLocales(
                        (t) => t.native.set.function.difference.name
                    ),
                    undefined,
                    [
                        Bind.make(
                            getDocLocales(
                                (t) =>
                                    t.native.set.function.difference.inputs[0]
                                        .doc
                            ),
                            differenceFunctionNames
                        ),
                    ],
                    SetType.make(SetTypeVariable.getReference()),
                    (requestor, evaluation) => {
                        const set = evaluation.getClosure();
                        const newSet = evaluation.resolve(
                            differenceFunctionNames
                        );
                        if (set instanceof Set && newSet instanceof Set)
                            return set.difference(requestor, newSet);
                        else
                            return evaluation.getValueOrTypeException(
                                requestor,
                                SetType.make(),
                                set
                            );
                    }
                ),
                FunctionDefinition.make(
                    getDocLocales((t) => t.native.set.function.filter.doc),
                    getNameLocales((t) => t.native.set.function.filter.name),
                    undefined,
                    [
                        Bind.make(
                            getDocLocales(
                                (t) =>
                                    t.native.set.function.filter.inputs[0].doc
                            ),
                            getNameLocales(
                                (t) =>
                                    t.native.set.function.filter.inputs[0].names
                            ),
                            setFilterHOFType
                        ),
                    ],
                    new HOFSetFilter(setFilterHOFType),
                    SetType.make(SetTypeVariable.getReference())
                ),

                createNativeConversion(
                    getDocLocales((t) => t.native.set.conversion.text),
                    '{}',
                    "''",
                    (requestor: Expression, val: Set) =>
                        new Text(requestor, val.toString())
                ),
                createNativeConversion(
                    getDocLocales((t) => t.native.set.conversion.list),
                    '{}',
                    '[]',
                    (requestor: Expression, val: Set) =>
                        new List(requestor, val.values)
                ),
            ],
            BlockKind.Creator
        )
    );
}
