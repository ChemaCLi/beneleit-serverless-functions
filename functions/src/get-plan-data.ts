import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import { Exercise, ExerciseItem, Plan } from "./types";

/**
 * Retrieves all the data of the plan specified by id. This function implements
 * the Firebase Callable Function mechanism.
 * @param {Object} data Must be an object containing the id field to search.
 */
export const getPlanData = functions.https.onCall(async (data, context) => {
  const planDoc = await admin
    .firestore()
    .doc(`plans/${data.id}`)
    .get();

  const plan = planDoc.data() as Plan | undefined;

  if (!plan) {
    return({ plan }); // will return plan as undefined
  }

  plan.id = planDoc.id;

  return {
    plan: await fillExercisesData(plan),
  };
});

/**
 * Fills the incomplete exercise data of each block in the plan with the lates
 * exercise info from the exercises collection
 * @param {Plan} planWithoutExercisesData Plan data to fill. The data structure
 * must be well formed.
 */
const fillExercisesData = async (planWithoutExercisesData: Plan) => {
  const phases = await Promise.all((planWithoutExercisesData.phases || []).map(async phase => {
    const sessions = await Promise.all((phase.sessions || []).map(async session => {
      const routines = await Promise.all((session.routines || []).map(async routine => { // this returns routines
        const blocks = await Promise.all(
          (routine.blocks || []).map(async block => {
            const exercises = await getExerciseItemsWithExerciseData(block.exercises || []);

            block.exercises = exercises;
            return block;
          })); // end promise blocks

        routine.blocks = blocks;
        return routine;
      })); // end promise routines

      session.routines = routines;
      return session;
    })); // end promise sessions

    phase.sessions = sessions;
    return phase;
  })); // end promise phases

  const formatedPlan: Plan = {
    ...planWithoutExercisesData,
    phases: phases
  };

  return formatedPlan;
};

/**
 * Adds the incomplete exercise data by querying the firestore
 * exercises collection.
 * @param exerciseItems Items to be filled
 * @returns items with the exercise data
 */
const getExerciseItemsWithExerciseData = async (exerciseItems: ExerciseItem[]) => {
  const results = await Promise
    .all((exerciseItems || []).map(async (e) => {
      try {
        let exerciseItem = {
          id: e.id,
          units: e?.units,
          unitsType: e?.unitsType,
          number: e?.number,
          exerciseRef: {}
        };

        // if there's not an exercise ref, shouldn't query it
        if (!e.exerciseRef?.id) {
          return exerciseItem
        }

        const exerciseDocRef = admin
          .firestore()
          .collection("exercises")
          .doc(e.exerciseRef?.id || "");

        const exerciseDoc = await exerciseDocRef.get();
        let exercise = exerciseDoc.data() as Exercise;
        Object.assign(exercise, { id: exerciseDoc?.id });

        exerciseItem.exerciseRef = exercise;

        return exerciseItem;
      } catch (error) {
        functions
          .logger
          .log("Catched ERROR: ", error);
        return null;
      }
    }));

    return results as ExerciseItem[];
};

/**
 * Retrieves all the plan data with nested subcollections well formated.
 * @deprecated Stop using this because is difficult to mantain and it's
 * slower than the actual getPlanData method.
 */
export const getPlanDataComplex = functions.https.onCall(async (data, context) => {
  const planDoc = await admin
    .firestore()
    .doc(`plans/${data.id}`)
    .get();

  const plan = planDoc.data();

  if (!plan) {
    return({ plan });
  }

  plan.id = planDoc.id;

  const phasesSnapshot = await planDoc.ref.collection("phases").get();

  plan.phases = await Promise.all(phasesSnapshot.docs.map(async phaseDoc => {
    const phase = phaseDoc.data();
    phase.id = phaseDoc.id;

    phase.sessions = await getPlanPhaseSessions({
      planId: plan.id,
      phaseId: phase.id,
    });
    
    return phase;
  }));

  return({ plan });
});

const getPlanPhaseSessions = async ({ planId, phaseId }: any) => {
  const sessionsSnapshot = await admin
    .firestore()
    .collection(`plans/${planId}/phases/${phaseId}/sessions`).get();

  const sessions = await Promise.all(sessionsSnapshot.docs.map(async (sessionDoc) => {
    const session = sessionDoc.data();

    if (!session)
      return;
    
    session.id = sessionDoc.id;
    session.routines = await getSessionRoutines({
      planId,
      phaseId,
      sessionId: session.id,
    });

    return session;
  }));

  return sessions;
};

const getSessionRoutines = async ({ planId, phaseId, sessionId }: any) => {
  const routinesSnapshot = await admin
    .firestore()
    .collection(`plans/${planId}/phases/${phaseId}/sessions/${sessionId}/routines`)
    .get();

  const routines = await Promise.all(routinesSnapshot.docs.map(async routineDoc => {
    const routine = routineDoc.data();

    if (!routine)
      return;
    
    routine.id = routine.id;

    const blocksSnapshot = await routineDoc.ref.collection("blocks").get();

    routine.blocks = await Promise.all(blocksSnapshot.docs.map(async blockDoc => {
      const block = blockDoc.data();

      if (!block)
        return;
      
      block.id = blockDoc.id;
      block.exercises = await Promise
        .all(block.exercises?.map(async (e: any) => {
          try {
            const exerciseRefDoc = await e.exerciseRef?.get();
            const exerciseRefData = exerciseRefDoc?.data();
            
  
            return {
              units: e?.units,
              unitsType: e?.unitsType,
              number: e?.number,
              exerciseRef: {
                id: exerciseRefDoc?.id,
                description: exerciseRefData?.description,
                name: exerciseRefData?.name,
                thumbnailUrl: exerciseRefData?.thumbnailUrl,
                videoUrl: exerciseRefData?.videoUrl,
              },
            }
          } catch (error) {
            functions
              .logger
              .log("ERROR: ", error);
            return {};
          }
        }) || []);

      delete block.EXAMPLES; // remove weird metadata

      return block;
    }));

    return routine;
  }));

  return routines;
};


/*
const getBlockExercises = async (exercises: {
    exerciseRef: any,
}[] = []) => {
  if (!exercises)
    return;

  const exerciseItems = await Promise.all(exercises?.map(async exercise => {
    return exercise;
  }));

  return exerciseItems;
};
*/