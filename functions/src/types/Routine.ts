import { Entity } from "./Entity";
import { Block } from "./Block";
import { GenderType } from "./User";

export type RoutineType =
 | "GYM"
 | "FUNCTIONAL"
 | "HOME";

export interface Routine extends Entity {
  type?: RoutineType;
  name?: string;
  gender?: GenderType;
  blocks?: Block[];
}
