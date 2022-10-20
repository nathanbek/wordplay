import type { Edit } from "../editor/Commands";
import type Source from "../models/Source";
import type Node from "../nodes/Node";
import type LanguageCode from "../nodes/LanguageCode";

export default abstract class Transform {

    readonly source: Source;

    constructor(source: Source) {

        this.source = source;

    }

    abstract getEdit(lang: LanguageCode): Edit;
    abstract getDescription(lang: LanguageCode): string;
    abstract getSubjectNode(lang: LanguageCode): Node;
    abstract equals(transform: Transform): boolean;

}