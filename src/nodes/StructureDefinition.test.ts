import { test } from "vitest";
import { testConflict } from "../conflicts/TestUtilities";
import DuplicateLanguages from "../conflicts/DuplicateLanguages";
import RequiredAfterOptional from "../conflicts/RequiredAfterOptional";
import DuplicateTypeVariables from "../conflicts/DuplicateTypeVariables";
import StructureDefinition from "./StructureDefinition";
import DuplicateNames from "../conflicts/DuplicateNames";
import { Unimplemented } from "../conflicts/Unimplemented";
import { Implemented } from "../conflicts/Implemented";
import { DisallowedInputs } from "../conflicts/DisallowedInputs";
import Names from "./Names";
import Docs from "./Docs";
import DuplicateBinds from "../conflicts/DuplicateBinds";

test("Test custom type conflicts", () => {

    testConflict('a:1\n`hi`/eng`hola`/spa•Hi()', 'a:1\n`hi`/eng`hola`/eng•Hi() ', Docs, DuplicateLanguages, 2);
    testConflict('•Cat,Dog(a b)', '•Cat,Cat(a b)', Names, DuplicateNames);
    testConflict('•Cat(a b)', '•Cat(a a)', StructureDefinition, DuplicateBinds);
    testConflict('•Cat ∘T∘U ()', '•Cat ∘T∘T ()', StructureDefinition, DuplicateTypeVariables);
    testConflict('•Cat(a•# b•#:1)', '•Cat(a•#:1 b•#)', StructureDefinition, RequiredAfterOptional);
    testConflict('•Animal() ( ƒ sound()•"" …)\n•Cat •Animal() ( ƒ sound() "meow" )', '•Animal() ( ƒ sound()•"" …)\n•Cat •Animal() ( ƒ speak() "meow" )', StructureDefinition, Unimplemented, 1);
    testConflict('•Animal() ( ƒ sound()•"" … ƒ smell() …)', '•Animal() ( ƒ sound()•"" … ƒ smell() 1)', StructureDefinition, Implemented, 0);
    testConflict('•Animal() ( ƒ sound()•"" … ƒ smell() …)', '•Animal(name•"") ( ƒ sound()•"" … ƒ smell() …)', StructureDefinition, DisallowedInputs, 0);

});