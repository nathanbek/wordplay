import type { Token } from "./Token";
import Expression from "./Expression";
import type Program from "./Program";
import Conflict from "./Conflict";
import type Type from "./Type";
import type Unparsable from "./Unparsable";
import BooleanType from "./BooleanType";
import { SemanticConflict } from "./SemanticConflict";
import TableType from "./TableType";

export default class Delete extends Expression {
    
    readonly table: Expression;
    readonly del: Token;
    readonly query: Expression | Unparsable;

    constructor(table: Expression, del: Token, query: Expression | Unparsable) {
        super();

        this.table = table;
        this.del = del;
        this.query = query;

    }

    getChildren() { return [ this.table, this.del, this.query ]; }

    getConflicts(program: Program): Conflict[] { 

        const conflicts: Conflict[] = [];
        
        const tableType = this.table.getType(program);

        // Table must be table typed.
        if(!(tableType instanceof TableType))
            conflicts.push(new Conflict(this, SemanticConflict.NOT_A_TABLE));

        // The query must be truthy.
        if(this.query instanceof Expression && !(this.query.getType(program) instanceof BooleanType))
            conflicts.push(new Conflict(this, SemanticConflict.TABLE_QUERY_MUST_BE_TRUTHY))

        return conflicts; 
        
    }

    getType(program: Program): Type {
        // The type is identical to the table's type.
        return this.table.getType(program);
    }

}