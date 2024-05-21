import { Auditory } from "./auditory";
import { Discipline } from "./discipline";
import { Group } from "./group";
import { ScheduleType } from "./schedule-type.enum";
import { Teacher } from "./teacher";

export type Schedule = {
    id: string;
    day: number;
    timeStart: string;
    timeFinish: string;
    discipline: Discipline;
    scheduleType: ScheduleType;
    auditory: Auditory;
    teacher: Teacher;
    group: Group;
}