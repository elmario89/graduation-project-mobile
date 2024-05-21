import { Building } from "./building";

export type Auditory = {
    id: string;
    number: number;
    floor: number;
    building: Building;
    buildingId: string;
}