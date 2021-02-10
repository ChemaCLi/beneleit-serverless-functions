import { Entity } from "./Entity";
import { Routine } from "./Routine";
export interface Session extends Entity {
  name?: string;
  number?: number;
  routines?: Routine[];
  completed?: boolean; // for user local info only
}
