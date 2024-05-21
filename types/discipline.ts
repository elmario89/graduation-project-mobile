import { Faculty } from "./faculty";
import {Teacher} from "./teacher";

export type Discipline = {
    id: string;
    name: string;
    facultyId: string;
    faculty: Faculty;
    teachers?: Teacher[];
}