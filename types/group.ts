import { Faculty } from "./faculty";

export type Group = {
    id: string;
    name: string;
    start: Date;
    finish: Date;
    faculty: Faculty;
}