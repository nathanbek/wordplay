import { expect } from "vitest";
import Block from "../nodes/Block";
import Expression from "../nodes/Expression";
import Context from "../nodes/Context";
import Source from "../models/Source";
import Shares from "../runtime/Shares";

export function testConflict(goodCode: string, badCode: string, nodeType: Function, conflictType: Function, nodeIndex: number = 0) {

    const goodSource = new Source("test", goodCode);
    const goodProgram = goodSource.program;
    const goodOp = goodProgram.nodes().filter(n => n instanceof nodeType)[nodeIndex];
    expect(goodOp).toBeInstanceOf(nodeType);
    expect(goodOp?.getConflicts(new Context(goodSource, new Shares())).filter(n => n instanceof conflictType)).toHaveLength(0);

    const badSource = new Source("test", badCode);
    const badProgram = badSource.program;
    const badOp = badProgram.nodes().filter(n => n instanceof nodeType)[nodeIndex];
    expect(badOp).toBeInstanceOf(nodeType);
    const conflicts = badOp?.getConflicts(new Context(badSource, new Shares()));
    expect(conflicts?.find(c => c instanceof conflictType)).toBeInstanceOf(conflictType);

}

/** Given some code, verify that the type of the last expression in the program's block is of the expected type. */
export function testTypes(code: string, typeExpected: Function) {

    const source = new Source("test", code);
    const last = source.program.block instanceof Block ? source.program.block.getLast() : undefined;
    const lastIsExpression = last instanceof Expression;
    if(last instanceof Expression) {
        const type = last.getType(new Context(source, new Shares()));
        const match = type instanceof typeExpected;
        if(!match)
            console.log(`Expression's type is ${type.constructor.name}`);
        expect(match).toBe(true);
    }
    else {
        console.log(`Last expression of this code is undefined.`);
    }
    expect(lastIsExpression).toBe(true);

}