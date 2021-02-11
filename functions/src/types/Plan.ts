import { Entity } from "./Entity";
import { Phase } from "./Phase";

export interface Plan extends Entity {
  name?: string;
  description?: string;
  tinyDescription?: string;
  coverUrl?: string;
  phases?: Phase[];
}