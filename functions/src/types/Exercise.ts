import { Entity } from "./Entity";
import { RoutineType } from "./Routine";
import { GenderType } from "./User";

export type UnitType =
  | "REPETITIONS"
  | "SECONDS";
export interface Exercise extends Entity {
  description?: string
  name?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  type?: RoutineType;
  gender?: GenderType;
}
export interface ExerciseItem extends Entity {
  exerciseRef?: Exercise;
  number?: number;
  units?: number;
  unitsType?: UnitType;
}
