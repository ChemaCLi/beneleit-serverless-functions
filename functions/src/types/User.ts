import { Entity } from "./Entity";
import { Phase } from "./Phase";
import { Plan } from "./Plan";

export type SubscriptionType = "BASIC" | "PREMIUM" | "PLUS" | "TEST";

export type GenderType = "MALE" | "FEMALE" | "OTHER";

export type ExerciseHabitsType =
  | "NEVER"
  | "FREQUENT_BUT_STOPED"
  | "1_TO_2_PER_WEEK"
  | "2_TO_3_PER_WEEK"
  | "3_TO_6_PER_WEEK";

export type WorkoutHabitsIntensity = "LOW" | "MEDIUM" | "HIGHT"
export type WorkoutHabitsDuration =
  "LESS_1_HOUR" | "AROUND_1_HOUR" | "AROUND_2_HOURS" | "MORE_THAN_2_HOURS";

export interface Subscription {
  type: SubscriptionType;
  expirationDate: string;
  adquisitionDate: string;
  memberSince: string;
}

export type UserLevel = "BEGINER" | "INTERMEDIATE" | "EXPERT";

export interface User extends Entity {
  // firebase auth propperties
  email?: string;
  displayName?: string
  photoURL?: string
  uid?: string;

  // user app data
  firebaseAuthUid?: string; // the same as uid
  // fullName?: string; removed in favor of displayName
  // photoUrl?: string; removed in favor of photoURL
  activePlanId?: string;
  completedPhasesId?: string[];
  completedSessions?: Phase[];
  subscription?: Subscription;
  level?: UserLevel;
  completedPlans: {
    planRef: Plan | string
  }[];
  
  gender?: GenderType;
  weight?: number;
  height?: number;
  exerciseHabits?: ExerciseHabitsType;
  routineDuration?: WorkoutHabitsDuration;
  intensity?: WorkoutHabitsIntensity;

  planProgress?: number;
  phaseProgress?: number;
}
