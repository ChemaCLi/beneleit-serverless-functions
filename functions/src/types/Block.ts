import { Entity } from "./Entity";
import { ExerciseItem } from "./Exercise";

export type BlockType =
 | "WARMUP"
 | "WORKOUT"
 | "REST";

export interface Block extends Entity {
  number?: number;
  type?: BlockType
  exercises?: ExerciseItem[];
}
