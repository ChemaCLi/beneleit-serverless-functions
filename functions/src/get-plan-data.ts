import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

export const getPlanData = functions.https.onRequest(async (req, res) => {
  const planDoc = await admin
    .firestore()
    .doc(`plans/${req.query.id}`)
    .get();

  const plan = planDoc.data();

  if (!plan) {
    res.json({ plan });
    return;
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

  res.json({ plan });
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