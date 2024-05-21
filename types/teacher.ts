import {Discipline} from "./discipline";
import { Faculty } from "./faculty";

export type Teacher = {
    id: string;
    name: string;
    surname: string;
    login: string;
    password: string;
    disciplines?: Discipline[];
    faculties?: Faculty[];
}