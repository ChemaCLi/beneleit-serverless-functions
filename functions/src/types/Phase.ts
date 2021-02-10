import { Entity } from "./Entity";
import { Session } from "./Session";

export interface Phase extends Entity {
  number?: number;
  name?: string;
  sessions?: Session[];
  description?: string;
  completed?: boolean;
}
