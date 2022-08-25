import { tokenize } from "./Tokenizer";
import Token, { TokenType } from "../nodes/Token";

import type Expression from "../nodes/Expression";
import type Type from "../nodes/Type";

import Program from "../nodes/Program";
import Borrow from "../nodes/Borrow";
import Unparsable from "../nodes/Unparsable";
import Block from "../nodes/Block";
import ListLiteral from "../nodes/ListLiteral";
import Bind from "../nodes/Bind";
import Evaluate from "../nodes/Evaluate";
import UnaryOperation from "../nodes/UnaryOperation";
import BinaryOperation from "../nodes/BinaryOperation";
import AccessName from "../nodes/AccessName";
import FunctionDefinition from "../nodes/FunctionDefinition";
import Template from "../nodes/Template";
import UnionType from "../nodes/UnionType";
import NoneLiteral from "../nodes/NoneLiteral";
import MeasurementLiteral from "../nodes/MeasurementLiteral";
import MeasurementType from "../nodes/MeasurementType";
import TextLiteral from "../nodes/TextLiteral";
import NameType from "../nodes/NameType";
import NoneType from "../nodes/NoneType";
import TextType from "../nodes/TextType";
import ListType from "../nodes/ListType";
import SetOrMapType from "../nodes/SetOrMapType";
import FunctionType from "../nodes/FunctionType";
import TypeVariable from "../nodes/TypeVariable";
import KeyValue from "../nodes/KeyValue";
import ListAccess from "../nodes/ListAccess";
import Conditional from "../nodes/Conditional";
import Share from "../nodes/Share";
import StructureDefinition from "../nodes/StructureDefinition";
import Alias from "../nodes/Alias";
import Docs from "../nodes/Docs";
import Column from "../nodes/Column";
import Cell from "../nodes/Cell";
import Row from "../nodes/Row";
import TableLiteral from "../nodes/TableLiteral";
import ColumnType from "../nodes/ColumnType";
import TableType from "../nodes/TableType";
import Select from "../nodes/Select";
import Insert from "../nodes/Insert";
import Update from "../nodes/Update";
import Delete from "../nodes/Delete";
import ConversionDefinition from "../nodes/ConversionDefinition";
import Reaction from "../nodes/Reaction";
import StreamType from "../nodes/StreamType";
import BooleanType from "../nodes/BooleanType";
import SetOrMapAccess from "../nodes/SetOrMapAccess";
import Name from "../nodes/Name";
import BooleanLiteral from "../nodes/BooleanLiteral";
import Convert from "../nodes/Convert";
import SetOrMapLiteral from "../nodes/SetOrMapLiteral";
import Unit from "../nodes/Unit";
import Language from "../nodes/Language";
import Is from "../nodes/Is";

export enum SyntacticConflict {
    EXPECTED_BORRW_NAME,
    EXPECTED_BIND_NAME,
    EXPECTED_STRUCTURE_NAME,
    EXPECTED_ACCESS_NAME,
    EXPECTED_TYPE_VAR_NAME,
    EXPECTED_EVAL_OPEN,
    EXPECTED_EVAL_CLOSE,
    EXPECTED_LIST_OPEN,
    EXPECTED_LIST_CLOSE,
    EXPECTED_SET_OPEN,
    EXPECTED_SET_CLOSE,
    EXPECTED_TEXT_OPEN,
    EXPECTED_TEXT_CLOSE,
    EXPECTED_EXPRESSION,
    EXPECTED_UNIT_NAME,
    EXPECTED_TYPE
}

export class Tokens {
    /** The tokens that have been read. */
    readonly #read: Token[] = [];

    /** The tokens that have yet to be read. */
    readonly #unread: Token[];

    constructor(tokens: Token[]) {
        this.#unread = tokens.slice();
    }

    /** Returns the text of the next token */
    peek(): Token | undefined {
        return this.hasNext() ? this.#unread[0] : undefined
    }
    
    /** Returns the text of the next token */
    peekText(): string | undefined {
        return this.hasNext() ? this.#unread[0].text : undefined
    }

    /** Returns true if the token list isn't empty. */
    hasNext(): boolean {
        return this.#unread.length > 0;
    }

    /** Returns true if and only if the next token is the specified type. */
    nextIs(type: TokenType): boolean {
        return this.hasNext() && this.#unread[0].is(type);
    }

    /** Returns true if and only if there is a next token and it's not the specified type. */
    nextIsnt(type: TokenType): boolean {
        return this.hasNext() && this.#unread[0].isnt(type);
    }
    
    /** Returns true if and only if the next series of tokens matches the series of given token types. */
    nextAre(...types: TokenType[]) {
        return types.every((type, index) => index < this.#unread.length && this.#unread[index].is(type));
    }

    /** Returns true if and only there was a previous token and it was of the given type. */
    previousWas(type: TokenType): boolean {
        return this.#read.length > 0 && this.#read[this.#read.length - 1].is(type);
    }
    
    beforeNextLineIs(type: TokenType) {
        // To detect this, we'll just peek ahead and see if there's a bind before the next line.
        let index = 0;
        while(index < this.#unread.length) {
            const token = this.#unread[index];
            if(index > 0 && this.#unread[index].hasPrecedingLineBreak()) break;
            if(token.is(type)) break;
            index++;
        }
        // If we found a bind, it's a bind.
        return index < this.#unread.length && this.#unread[index].is(type);        
    }    

    nextAreDocsThen(type: TokenType) {

        let index = 0;
        while(index < this.#unread.length) {
            const token = this.#unread[index];
            if(token.is(type)) return true;
            if(!token.is(TokenType.DOCS) && !token.is(TokenType.LANGUAGE) && !token.is(TokenType.NAME)) return false;
            index++;
        }
        return false;

    }

    nextIsOneOf(...types: TokenType[]): boolean {
        return types.find(type => this.nextIs(type)) !== undefined;
    }

    /** Returns true if and only if the next token is the specified type. */
    nextLacksPrecedingSpace(): boolean {
        return this.hasNext() && !this.#unread[0].hasPrecedingSpace();
    }

    /** Returns true if and only if the next token has a preceding line break. */
    nextHasPrecedingLineBreak(): boolean {
        return this.hasNext() && this.#unread[0].hasPrecedingLineBreak();
    }

    /** Returns true if and only if the next token has a preceding line break. */
    nextLacksPrecedingLineBreak(): boolean {
        return this.hasNext() && !this.#unread[0].hasPrecedingLineBreak();
    }
    
    /** Returns true if and only if the next token after next has a preceding line break. */
    afterNextHasPrecedingLineBreak(): boolean {
        return this.#unread.length > 1  && this.#unread[1].hasPrecedingLineBreak();
    }
    
    /** Returns a token list without the first token. */
    read(): Token {
        if(this.hasNext()) {
            const token = this.#unread.shift() as Token;
            this.#read.push(token);
            return token;
        }
        else
            return new Token("", [ TokenType.END ], this.#read.length === 0 ? 0 : this.#read[this.#read.length - 1].getIndex() + this.#read[this.#read.length - 1].getLength());
    }

    /** Returns a node annotated with an error message, as well as all surrounding tokens. */
    readUnparsableLine(reason: SyntacticConflict): Unparsable {
        // Find all of the tokens on the previous line for context.
        const indexOfLineBefore = this.#read.length - 1 - this.#read.slice().reverse().findIndex(t => t.hasPrecedingLineBreak());
        const tokensBefore = indexOfLineBefore >= this.#read.length ? [] : this.#read.slice(indexOfLineBefore);
        // Find all of the tokens before the next line break, include them
        const indexOfNextAfter = this.#unread.findIndex(t => t.hasPrecedingLineBreak());
        const tokensAfter = this.#unread.splice(0, indexOfNextAfter < 1 ? this.#unread.length : indexOfNextAfter);
        const unparsable = new Unparsable(reason, tokensBefore, tokensAfter);
        // Put the parsed things in the read list.
        while(tokensAfter.length > 0) {
            const next = tokensAfter.shift();
            if(next)
                this.#read.push(next);
        }
        return unparsable;
    }

    /** Rollback to the given token. */
    unreadTo(token: Token) {
        while(this.#read.length > 0 && this.#unread[0] !== token) {
            const unreadToken = this.#read.pop();
            if(unreadToken !== undefined)
                this.#unread.unshift(unreadToken);
        }
    }

}

export function parse(code: string): Program {
    return parseProgram(tokens(code));
}

export function tokens(code: string): Tokens {
    return new Tokens(tokenize(code));
}

// PROGRAM :: BORROW* BLOCK
export function parseProgram(tokens: Tokens): Program {

    const borrows = [];
    while(tokens.nextIs(TokenType.BORROW))
        borrows.push(parseBorrow(tokens));

    const block = parseBlock(tokens, true, false);

    return new Program(borrows, block);

}

// BORROW :: ↓ name number?
export function parseBorrow(tokens: Tokens): Borrow | Unparsable {
    let borrow = tokens.read();
    let name;
    let version;

    if(tokens.nextIs(TokenType.NAME))
        name = tokens.read();
    else
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_BORRW_NAME);

    if(tokens.nextIs(TokenType.NUMBER) && !tokens.nextHasPrecedingLineBreak())
        version = tokens.read();

    return new Borrow(borrow, name, version);
}

function parseShare(tokens: Tokens): Share {

    const share = tokens.read();
    const bind = parseBind(true, tokens);
    return new Share(share, bind);

}

/** BLOCK :: DOCS ? ( [BIND|EXPRESSION]+ )  */
export function parseBlock(tokens: Tokens, root: boolean=false, creator: boolean=false): Block | Unparsable {

    // Grab any documentation
    let docs = parseDocs(tokens);

    const open = root ? 
        undefined :
        tokens.nextIs(TokenType.EVAL_OPEN) ? 
            tokens.read() :
            tokens.readUnparsableLine(SyntacticConflict.EXPECTED_EVAL_OPEN);

    const statements = [];
    while(tokens.nextIsnt(TokenType.END) && tokens.nextIsnt(TokenType.EVAL_CLOSE))
        statements.push(
            tokens.nextIs(TokenType.SHARE) ? parseShare(tokens) :
            nextIsBind(tokens) ? parseBind(true, tokens) :
            parseExpression(tokens)
        );

    const close = root ?
        undefined :
        tokens.nextIs(TokenType.EVAL_CLOSE) ? 
            tokens.read() :
            tokens.readUnparsableLine(SyntacticConflict.EXPECTED_EVAL_CLOSE);

    return new Block(docs, statements, creator, open, close);

}

function nextIsBind(tokens: Tokens): boolean {

    const rollbackToken = tokens.peek();
    if(rollbackToken === undefined) return false;
    const bind = parseBind(true, tokens);
    tokens.unreadTo(rollbackToken);
    const expression = parseExpression(tokens);
    tokens.unreadTo(rollbackToken);
    const bindUnparsableCount = bind.nodes().reduce((previous, current) => previous + (current instanceof Unparsable ? 1 : 0), 0);
    const expressionUnparsableCount = expression.nodes().reduce((previous, current) => previous + (current instanceof Unparsable ? 1 : 0), 0);
    return bind instanceof Bind && (bind.dot !== undefined || bind.colon !== undefined) && bindUnparsableCount <= expressionUnparsableCount;

}

/** BIND :: ALIAS TYPE? (: EXPRESSION)? */
export function parseBind(expectExpression: boolean, tokens: Tokens): Bind | Unparsable {

    let docs = parseDocs(tokens);
    let etc = tokens.nextIs(TokenType.ETC) ? tokens.read() : undefined;
    let names = [];
    let colon;
    let value;
    let dot;
    let type;

    names = parseAliases(tokens);

    if(names.length === 0)
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_BIND_NAME);

    if(tokens.nextIs(TokenType.TYPE)) {
        dot = tokens.read();
        type = parseType(tokens);
    }

    if(expectExpression && tokens.nextIs(TokenType.BIND)) {
        colon = tokens.read(); 
        value = parseExpression(tokens);
    }

    return new Bind(docs, etc, names, type, value, dot, colon);

}

/** ALIAS :: (name LANGUAGE?)+ */
export function parseAliases(tokens: Tokens): Alias[] {

    const aliases: Alias[] = [];

    while((aliases.length > 0 && tokens.nextIs(TokenType.ALIAS)) || (aliases.length === 0 && tokens.nextIs(TokenType.NAME))) {
        const semicolon = tokens.nextIs(TokenType.ALIAS) ? tokens.read() : undefined;
        if(aliases.length > 0 && semicolon === undefined) break;
        const name = tokens.read();
        let lang = tokens.nextIs(TokenType.LANGUAGE) ? parseLanguage(tokens) : undefined;
        aliases.push(new Alias(name, lang, semicolon));
    }

    return aliases;

}

/** LANGUAGE :: / name */
export function parseLanguage(tokens: Tokens): Language {

    const slash = tokens.read();
    const lang = tokens.read();
    return new Language(lang, slash);

}

/** EXPRESSION :: BINARY_OPERATION [ conditional EXPRESSION EXPRESSION ]? */
export function parseExpression(tokens: Tokens): Expression | Unparsable {

    const left = parseBinaryOperation(tokens);

    // Is it conditional statement?
    if(!(left instanceof Unparsable) && tokens.nextIs(TokenType.CONDITIONAL)) {
        const conditional = tokens.read();
        const yes = parseExpression(tokens);
        const no = parseExpression(tokens);
        return new Conditional(left, conditional, yes, no);    
    }
    else return left;

}

/** BINARY_OPERATION :: ATOMIC_EXPRESSION [ binary_op ATOMIC_EXPRESSION ]* */
export function parseBinaryOperation(tokens: Tokens): Expression | Unparsable {

    let left = parseAtomicExpression(tokens);

    while(tokens.nextIs(TokenType.BINARY_OP)) {
        const operator = tokens.read();
        left = operator.is(TokenType.TYPE) ? 
            new Is(left, parseType(tokens), operator) :
            new BinaryOperation(operator, left, parseAtomicExpression(tokens));
    }
    return left;

}

/**
 * 
 * ATOMIC_EXPRESSION :: 
 *   name |
 *   number |
 *   boolean |
 *   LIST |
 *   SET |
 *   MAP |
 *   TABLE |
 *   ACCESS |
 *   EVAL | 
 *   BLOCK |
 *   TEMPLATE |
 *   FUNCTION | 
 *   CONVERSION |
 *   STREAM |
 *   CUSTOM |
 */
function parseAtomicExpression(tokens: Tokens): Expression | Unparsable {

    // All expressions must start with one of the following
    let left: Expression | Unparsable = (
        // Nones
        tokens.nextIs(TokenType.NONE) ? parseNone(tokens): 
        // Names or booleans are easy
        tokens.nextIs(TokenType.NAME) ? new Name(tokens.read()) :
        // Booleans
        tokens.nextIs(TokenType.BOOLEAN) ? new BooleanLiteral(tokens.read()) :
        // Numbers with units
        tokens.nextIs(TokenType.NUMBER) ? parseMeasurement(tokens) :
        // Text with optional formats
        tokens.nextIs(TokenType.TEXT) ? parseText(tokens) :
        // A string template
        tokens.nextIs(TokenType.TEXT_OPEN) ? parseTemplate(tokens) :
        // A list
        tokens.nextIs(TokenType.LIST_OPEN) ? parseList(tokens) :
        // A set or map
        tokens.nextIs(TokenType.SET_OPEN) ? parseSetOrMap(tokens) :
        // Table literals
        tokens.nextIs(TokenType.TABLE) ? parseTable(tokens) :
        // A block expression
        tokens.nextAreDocsThen(TokenType.EVAL_OPEN) ? parseBlock(tokens) :
        // A structure definition
        tokens.nextAreDocsThen(TokenType.TYPE) ? parseStructure(tokens) :
        // A function function
        tokens.nextAreDocsThen(TokenType.FUNCTION) ? parseFunction(tokens) :
        // A conversion
        tokens.nextAreDocsThen(TokenType.CONVERT) ? parseConversion(tokens) :
        // Unary expressions!
        tokens.nextIs(TokenType.UNARY_OP) ? new UnaryOperation(tokens.read(), parseAtomicExpression(tokens)) :
        // Anything that doesn't is unparsable.
        tokens.readUnparsableLine(SyntacticConflict.EXPECTED_EXPRESSION)
    );

    // But wait! Is it one or more accessors? Slurp them up.
    while(!(left instanceof Unparsable)) {
        if(tokens.nextIs(TokenType.ACCESS))
            left = parseAccess(left, tokens);
        else if(tokens.nextIs(TokenType.LIST_OPEN) && tokens.nextLacksPrecedingSpace())
            left = parseListAccess(left, tokens);
        else if(tokens.nextIs(TokenType.SET_OPEN) && tokens.nextLacksPrecedingSpace())
            left = parseSetOrMapAccess(left, tokens);
        else if(tokens.nextIsOneOf(TokenType.EVAL_OPEN, TokenType.TYPE_VAR) && tokens.nextLacksPrecedingSpace())
            left = parseEvaluate(left, tokens);
        else if(tokens.nextIs(TokenType.CONVERT))
            left = parseConvert(left, tokens);
        else if(tokens.nextIs(TokenType.SELECT))
            left = parseSelect(left, tokens);
        else if(tokens.nextIs(TokenType.INSERT))
            left = parseInsert(left, tokens);
        else if(tokens.nextIs(TokenType.UPDATE))
            left = parseUpdate(left, tokens);
        else if(tokens.nextIs(TokenType.DELETE))
            left = parseDelete(left, tokens);
        else if(tokens.nextIs(TokenType.STREAM))
            left = parseReaction(left, tokens);
        else break;
    }
    return left;
    
}

/** NONE :: ! ALIASES */
function parseNone(tokens: Tokens): NoneLiteral | Unparsable {

    const error = tokens.read();
    const names = parseAliases(tokens);
    return new NoneLiteral(error, names);

}

/** NUMBER :: number name? */
function parseMeasurement(tokens: Tokens): MeasurementLiteral | Unparsable {

    const number = tokens.read();
    const unit = tokens.nextIs(TokenType.NAME) && tokens.nextLacksPrecedingSpace() ? parseUnit(tokens) : undefined;
    return new MeasurementLiteral(number, unit);

}

/** UNIT :: name (· NAME)* (/ name (· NAME)*)? */
function parseUnit(tokens: Tokens): Unit | Unparsable {
    
    const numeratorTokens = [ tokens.read() ];
    // Keep reading · unit pairs until we run out or hit a /
    while(tokens.nextIs(TokenType.BINARY_OP) && tokens.peekText() === "·") {
        numeratorTokens.push(tokens.read());
        if(!tokens.nextIs(TokenType.NAME))
            return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_UNIT_NAME);
        numeratorTokens.push(tokens.read());
    }
    const denominatorTokens = [];
    // Is a ratio next? Read it then
    if(tokens.nextIs(TokenType.LANGUAGE)) {
        denominatorTokens.push(tokens.read());
        if(!tokens.nextIs(TokenType.NAME))
            return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_UNIT_NAME);
        denominatorTokens.push(tokens.read());
        while(tokens.nextIs(TokenType.BINARY_OP) && tokens.peekText() === "·") {
            denominatorTokens.push(tokens.read());
            if(!tokens.nextIs(TokenType.NAME))
                return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_UNIT_NAME);
            denominatorTokens.push(tokens.read());
        }
    }

    return new Unit(numeratorTokens, denominatorTokens);

}

/** TEXT :: text name? */
function parseText(tokens: Tokens): TextLiteral {

    const text = tokens.read();
    const format = tokens.nextIs(TokenType.LANGUAGE) ? parseLanguage(tokens) : undefined;
    return new TextLiteral(text, format);

}

/** TEMPLATE :: text_open ( EXPRESSION text_between )* EXPRESSION text_close name? */
function parseTemplate(tokens: Tokens): Template | Unparsable {

    const parts = [];

    if(!tokens.nextIs(TokenType.TEXT_OPEN))
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_TEXT_OPEN);
    parts.push(tokens.read());

    do {
        const expression = parseExpression(tokens);
        if(expression instanceof Unparsable) return expression;
        parts.push(expression);
        if(tokens.nextIs(TokenType.TEXT_BETWEEN))
            parts.push(tokens.read());
    } while(tokens.nextIsnt(TokenType.TEXT_CLOSE));

    if(!tokens.nextIs(TokenType.TEXT_CLOSE))
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_TEXT_CLOSE);
    parts.push(tokens.read());

    // Read an optional format if there's no preceding space.
    const format = tokens.nextIs(TokenType.LANGUAGE) ? parseLanguage(tokens) : undefined;

    return new Template(parts, format);

}

/** LIST :: [ EXPRESSION* ] */
function parseList(tokens: Tokens): ListLiteral | Unparsable {

    let open = tokens.read();
    let values: (Expression|Unparsable)[] = [];
    let close;

    while(tokens.nextIsnt(TokenType.LIST_CLOSE))
        values.push(parseExpression(tokens));

    if(tokens.nextIs(TokenType.LIST_CLOSE))
        close = tokens.read();
    else
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_LIST_CLOSE);

    return new ListLiteral(open, values, close);

}

/** LIST_ACCESS :: EXPRESSION ([ EXPRESSION ])+ */
function parseListAccess(left: Expression | Unparsable, tokens: Tokens): Expression | Unparsable {
    do {

        const open = tokens.read();
        const index = parseExpression(tokens);
        if(tokens.nextIsnt(TokenType.LIST_CLOSE))
            return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_LIST_CLOSE);
        const close = tokens.read();

        left = new ListAccess(left, open, index, close);

        // But wait, is it a function evaluation?
        if(tokens.nextIs(TokenType.EVAL_OPEN) && tokens.nextLacksPrecedingSpace())
            left = parseEvaluate(left, tokens);

    } while(tokens.nextIs(TokenType.LIST_OPEN));

    // Return the series of accesses and evaluations we created.
    return left;
}

/** SET :: { EXPRESSION* } | { (EXPRESSION:EXPRESSION)* } | {:} */
function parseSetOrMap(tokens: Tokens): SetOrMapLiteral | Unparsable {

    let open = tokens.read();
    let values: (Expression|KeyValue|Unparsable)[] = [];
    let close;

    // Is this an empty map?
    if(tokens.nextAre(TokenType.BIND, TokenType.SET_CLOSE)) {
        const bind = tokens.read();
        close = tokens.read();
        return new SetOrMapLiteral(open, values, close, bind);
    }

    while(tokens.nextIsnt(TokenType.SET_CLOSE)) {
        const key = parseExpression(tokens);
        if(tokens.nextIs(TokenType.BIND)) {
            const bind = tokens.read();            
            const value = parseExpression(tokens);
            values.push(new KeyValue(key, bind, value))
        }
        else values.push(key);
    }

    if(tokens.nextIs(TokenType.SET_CLOSE))
        close = tokens.read();
    else
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_SET_CLOSE);

    return new SetOrMapLiteral(open, values, close);

}

/** SET_ACCESS :: EXPRESSION ([ EXPRESSION ])+ */
function parseSetOrMapAccess(left: Expression | Unparsable, tokens: Tokens): Expression | Unparsable {
    do {

        const open = tokens.read();
        const key = parseExpression(tokens);

        if(tokens.nextIsnt(TokenType.SET_CLOSE))
            return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_SET_CLOSE);
        const close = tokens.read();

        left = new SetOrMapAccess(left, open, key, close);

        // But wait, is it a function evaluation?
        if(tokens.nextIs(TokenType.EVAL_OPEN) && tokens.nextLacksPrecedingSpace())
            left = parseEvaluate(left, tokens);

    } while(tokens.nextIs(TokenType.SET_OPEN));

    // Return the series of accesses and evaluations we created.
    return left;
}

function parseTable(tokens: Tokens): TableLiteral {

    // Read the column definitions. Stop when we see a newline.
    const columns = [];
    while(tokens.nextIs(TokenType.TABLE)) {
        const cell = tokens.read();
        const bind = parseBind(true, tokens);
        columns.push(new Column(cell, bind));
        if(tokens.nextHasPrecedingLineBreak())
            break;
    }

    // Read the rows.
    const rows = [];
    while(tokens.nextIs(TokenType.TABLE))
        rows.push(parseRow(tokens));

    return new TableLiteral(columns, rows);

}

/** ROW :: [| (BIND|EXPRESSION)]+ */
function parseRow(tokens: Tokens): Row {

    const cells = [];
    // Read the cells.
    while(tokens.nextIs(TokenType.TABLE)) {
        const cell = tokens.read();
        const value = nextIsBind(tokens) ? parseBind(true, tokens) : parseExpression(tokens);
        cells.push(new Cell(cell, value));
        if(tokens.nextHasPrecedingLineBreak())
            break;
    }
    return new Row(cells);

}

/** SELECT :: EXPRESSION |? ROW EXPRESSION */
function parseSelect(table: Expression, tokens: Tokens): Select {

    const select = tokens.read();
    const row = parseRow(tokens);
    const query = parseExpression(tokens);

    return new Select(table, select, row, query);

}

/** INSERT :: EXPRESSION |+ ROW */
function parseInsert(table: Expression, tokens: Tokens): Insert {

    const insert = tokens.read();
    const row = parseRow(tokens);

    return new Insert(table, insert, row);
    
}

/** UPDATE :: EXPRESSION |: ROW EXPRESSION */
function parseUpdate(table: Expression, tokens: Tokens): Update {

    const update = tokens.read();
    const row = parseRow(tokens);
    const query = parseExpression(tokens);

    return new Update(table, update, row, query);
    
}

/** DELETE :: EXPRESSION |- EXPRESSION */
function parseDelete(table: Expression, tokens: Tokens): Delete {

    const del = tokens.read();
    const query = parseExpression(tokens);

    return new Delete(table, del, query);
    
}

/** STREAM :: EXPRESSION ∆ EXPRESSION EXPRESSION */
function parseReaction(initial: Expression, tokens: Tokens): Reaction {
    const delta = tokens.read();
    const stream = parseExpression(tokens);
    const next = parseExpression(tokens);
    return new Reaction(initial, delta, stream, next); 
}

/** FUNCTION :: DOCS? (ƒ | ALIASES) TYPE_VARIABLES? ( BIND* ) (•TYPE)? EXPRESSION */
function parseFunction(tokens: Tokens): FunctionDefinition | Unparsable {

    const docs = parseDocs(tokens);

    const fun = tokens.read();

    const aliases = tokens.nextIs(TokenType.NAME) ? parseAliases(tokens) : [];

    const typeVars = parseTypeVariables(tokens);

    if(tokens.nextIsnt(TokenType.EVAL_OPEN))
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_EVAL_OPEN);
    const open = tokens.read();

    const inputs: (Bind|Unparsable)[] = [];
    while(tokens.nextIsnt(TokenType.EVAL_CLOSE))
        inputs.push(parseBind(true, tokens));

    if(tokens.nextIsnt(TokenType.EVAL_CLOSE))
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_EVAL_CLOSE);
    const close = tokens.read();

    let dot;
    let output;
    if(tokens.nextIs(TokenType.TYPE)) {
        dot = tokens.read();
        output = parseType(tokens);
    }

    const expression = tokens.nextIs(TokenType.ETC) ? tokens.read() : parseExpression(tokens);

    return new FunctionDefinition(docs, aliases, typeVars, inputs, expression, output, fun, dot, open, close);

}

/** EVAL :: EXPRESSION TYPE_VARS? (EXPRESSION*) */
function parseEvaluate(left: Expression | Unparsable, tokens: Tokens): Evaluate | Unparsable {

    const typeVars = parseTypeVariables(tokens);
    const open = tokens.read();
    const inputs: (Bind|Expression|Unparsable)[] = [];
    let close;
    
    while(tokens.nextIsnt(TokenType.EVAL_CLOSE))
        inputs.push(nextIsBind(tokens) ? parseBind(true, tokens) : parseExpression(tokens));
    
    if(tokens.nextIs(TokenType.EVAL_CLOSE))
        close = tokens.read();
    else
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_EVAL_CLOSE);
    
    return new Evaluate(typeVars, open, left, inputs, close);

}

/** CONVERSION :: DOCS? → TYPE EXPRESSION */
function parseConversion(tokens: Tokens): ConversionDefinition {

    const docs = parseDocs(tokens);
    const convert = tokens.read();
    const output = parseType(tokens);
    const expression = parseExpression(tokens);

    return new ConversionDefinition(docs, output, expression, convert);

}

/** CONVERT :: EXPRESSION → TYPE */
function parseConvert(expression: Expression, tokens: Tokens): Convert {

    const convert = tokens.read();
    const type = parseType(tokens);
        
    return new Convert(expression, convert, type);

}

/** TYPE_VARS :: (\NAME)* */
function parseTypeVariables(tokens: Tokens): (TypeVariable|Unparsable)[] {

    const vars = [];
    while(tokens.nextIs(TokenType.TYPE_VAR)) {
        const type = tokens.read();
        if(tokens.nextIsnt(TokenType.NAME)) {
            vars.push(tokens.readUnparsableLine(SyntacticConflict.EXPECTED_TYPE_VAR_NAME));
            return vars;
        }
        const name = tokens.read();
        vars.push(new TypeVariable(type, name));
    }
    return vars;

}

/** ACCESS :: EXPRESSION (.NAME)+ */
function parseAccess(left: Expression | Unparsable, tokens: Tokens): Expression | Unparsable {
    if(!tokens.nextIs(TokenType.ACCESS))
        return left;
    do {

        const access = tokens.read();
        let name;
        if(tokens.nextIs(TokenType.NAME))
            name = tokens.read();
        else return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_ACCESS_NAME);

        left = new AccessName(left, access, name);

        // But wait, is it a function evaluation?
        if(tokens.nextIs(TokenType.EVAL_OPEN) && tokens.nextLacksPrecedingSpace())
            left = parseEvaluate(left, tokens);

    } while(tokens.nextIs(TokenType.ACCESS));

    // Return the series of accesses and evaluations we created.
    return left;
}

/** TYPE :: (? | name | MEASUREMENT_TYPE | TEXT_TYPE | NONE_TYPE | LIST_TYPE | SET_TYPE | FUNCTION_TYPE | STREAM_TYPE) (∨ TYPE)* */
export function parseType(tokens: Tokens): Type | Unparsable {
    let left: Type | Unparsable = (
        tokens.nextIs(TokenType.NAME) ? new NameType(tokens.read()) :
        tokens.nextIs(TokenType.BOOLEAN_TYPE) ? new BooleanType(tokens.read()) :
        tokens.nextIs(TokenType.NUMBER_TYPE) ? parseMeasurementType(tokens) :
        tokens.nextIs(TokenType.TEXT_TYPE) ? parseTextType(tokens) :
        tokens.nextIs(TokenType.NONE) ? parseNoneType(tokens) :
        tokens.nextIs(TokenType.LIST_OPEN) ? parseListType(tokens) :
        tokens.nextIs(TokenType.SET_OPEN) ? parseSetOrMapType(tokens) :
        tokens.nextIs(TokenType.TABLE) ? parseTableType(tokens) :
        tokens.nextIs(TokenType.FUNCTION) ? parseFunctionType(tokens) :
        tokens.nextIs(TokenType.STREAM) ? parseStreamType(tokens) :
        tokens.readUnparsableLine(SyntacticConflict.EXPECTED_TYPE)
    );

    while(!(left instanceof Unparsable) && tokens.nextIs(TokenType.UNION)) {
        const or = tokens.read();
        left = new UnionType(left, parseType(tokens), or);
    }
    
    return left;

}

/** TEXT_TYPE :: text_type NAME? */
function parseTextType(tokens: Tokens): TextType {

    const quote = tokens.read();
    const format = tokens.nextIs(TokenType.LANGUAGE) ? parseLanguage(tokens) : undefined;
    return new TextType(quote, format);

}

/** NUMBER_TYPE :: #NAME? */
function parseMeasurementType(tokens: Tokens): MeasurementType {

    const number = tokens.read();
    const unit = tokens.nextIs(TokenType.NAME) && tokens.nextLacksPrecedingSpace() ? parseUnit(tokens) : undefined;
    return new MeasurementType(number, unit);

}

/** NONE_TYPE :: !NAME? */
function parseNoneType(tokens: Tokens): NoneType {

    const oops = tokens.read();
    const names = parseAliases(tokens);
    return new NoneType(names, oops);

}

/** STREAM_TYPE :: ∆ TYPE */
function parseStreamType(tokens: Tokens): StreamType {

    const stream = tokens.read();
    const type = parseType(tokens);
    return new StreamType(type, stream);

}

/** LIST_TYPE :: [ TYPE ] */
function parseListType(tokens: Tokens): ListType | Unparsable {

    const open = tokens.read();
    const type = tokens.nextIsnt(TokenType.LIST_CLOSE) ? parseType(tokens) : undefined;
    if(tokens.nextIsnt(TokenType.LIST_CLOSE))
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_LIST_CLOSE);
    const close = tokens.read();
    return new ListType(type, open, close);    

}

/** SET_TYPE :: { TYPE } | { TYPE:TYPE } */
function parseSetOrMapType(tokens: Tokens): SetOrMapType | Unparsable {

    const open = tokens.read();
    let key = undefined;
    let bind = undefined;
    let value = undefined;
    if(tokens.nextIsnt(TokenType.SET_CLOSE)) {
        key = parseType(tokens);
        bind = tokens.nextIs(TokenType.BIND) ? tokens.read() : undefined;
        value = bind !== undefined ? parseType(tokens) : undefined;
    }
    if(tokens.nextIsnt(TokenType.SET_CLOSE))
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_SET_CLOSE);
    const close = tokens.read();
    return new SetOrMapType(open, close, key, bind, value);

}

/** TABLE_TYPE :: (| BIND)+ */
function parseTableType(tokens: Tokens): TableType | Unparsable {

    const columns = [];
    while(tokens.nextIs(TokenType.TABLE)) {
        const bar = tokens.read();
        const bind = parseBind(false, tokens);
        columns.push(new ColumnType(bind, bar))
    }
    return new TableType(columns);

}

/** FUNCTION_TYPE :: ƒ( …? TYPE*) TYPE */
function parseFunctionType(tokens: Tokens): FunctionType | Unparsable {

    const fun = tokens.read();
    if(tokens.nextIsnt(TokenType.EVAL_OPEN))
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_EVAL_OPEN);
    const open = tokens.read();

    const inputs = [];
    while(tokens.nextIsnt(TokenType.EVAL_CLOSE)) {
        const rest = tokens.nextIs(TokenType.ETC) ? tokens.read() : false;
        inputs.push({ aliases:[], type: parseType(tokens), required: true, rest: rest, default: undefined });
    }

    if(tokens.nextIsnt(TokenType.EVAL_CLOSE))
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_EVAL_CLOSE);
    const close = tokens.read();

    const output = parseType(tokens);

    return new FunctionType(inputs, output, fun, open, close);

}

/** CUSTOM_TYPE :: DOCS? • ALIASES (• name)* TYPE_VARS ( BIND* ) BLOCK? */
function parseStructure(tokens: Tokens): StructureDefinition | Unparsable {

    const docs = parseDocs(tokens);

    const type = tokens.read();

    const aliases = parseAliases(tokens);
    if(aliases.length === 0)
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_STRUCTURE_NAME)

    const interfaces: NameType[] = [];
    while(tokens.nextIs(TokenType.TYPE)) {
        const dot = tokens.read();
        if(tokens.nextIsnt(TokenType.NAME))
            return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_STRUCTURE_NAME);
        const name = tokens.read();
        interfaces.push(new NameType(name, dot));
    }

    const typeVars = parseTypeVariables(tokens);
    if(tokens.nextIsnt(TokenType.EVAL_OPEN))
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_EVAL_OPEN);
    const open = tokens.read();

    const inputs: (Bind|Unparsable)[] = [];
    while(tokens.nextIsnt(TokenType.EVAL_CLOSE))
        inputs.push(parseBind(true, tokens));

    if(tokens.nextIsnt(TokenType.EVAL_CLOSE))
        return tokens.readUnparsableLine(SyntacticConflict.EXPECTED_EVAL_CLOSE);
    const close = tokens.read();

    const block = tokens.nextIsOneOf(TokenType.DOCS, TokenType.EVAL_OPEN) ? parseBlock(tokens, false, true) : undefined;

    return new StructureDefinition(docs, aliases, interfaces, typeVars, inputs, block, type, open, close);

}

function parseDocs(tokens: Tokens): Docs[]  {

    const docs = [];
    while(tokens.nextIs(TokenType.DOCS)) {
        const doc = tokens.read();
        const lang = tokens.nextIs(TokenType.LANGUAGE) ? parseLanguage(tokens) : undefined;
        docs.push(new Docs(doc, lang));
    }
    return docs;

}