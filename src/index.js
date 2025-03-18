const express = require("express");
const { db } = require("./config/firebase");
const {
  generateWorkouts,
  generateWorkoutPlan,
  generatePersonalizedBlogs,
} = require("./aiService");
const router = express.Router();

router.post("/workouts", async (req, res) => {
  try {
    const { name, imageUrl, description, duration } = req.body;
    const workoutRef = db.collection("workouts").doc();
    await workoutRef.set({
      name,
      imageUrl,
      description,
      duration,
      created_at: admin.firestore.Timestamp.now(),
    });
    res
      .status(201)
      .json({ id: workoutRef.id, message: "Workout created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/workoutPlans", async (req, res) => {
  try {
    const { name, imageUrl, description, duration, workouts } = req.body; // workouts = array of workout objects

    // Create workout documents and store their IDs
    const workoutIds = await Promise.all(
      workouts.map(async ({ name, imageUrl, description, duration }) => {
        const workoutRef = db.collection("workouts").doc();
        await workoutRef.set({
          name,
          imageUrl,
          description,
          duration,
          created_at: admin.firestore.Timestamp.now(),
        });
        return workoutRef.id;
      })
    );

    // Create workout plan document
    const planRef = db.collection("workoutPlans").doc();
    await planRef.set({
      name,
      imageUrl,
      description,
      duration,
      workoutIds, // Store resolved workout IDs
      created_at: admin.firestore.Timestamp.now(),
    });

    res
      .status(201)
      .json({ id: planRef.id, message: "Workout Plan created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/generateWorkouts", async (req, res) => {
  const { weight, height, description } = req.body;
  try {
    const workouts = await generateWorkouts(weight, height, description);
    res.json({ success: true, workouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/generateWorkoutPlans", async (req, res) => {
  const { weight, height, description } = req.body;
  try {
    const workoutPlan = await generateWorkoutPlan(weight, height, description);
    res.json(workoutPlan);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/generateBlogs", async (req, res) => {
  const { weight, height, description } = req.body;
  try {
    const workoutPlan = await generatePersonalizedBlogs(
      weight,
      height,
      description
    );
    res.json(workoutPlan);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/users/:userId/workoutsWithProgress", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all workouts created by the user (or relevant workouts)
    const workoutsSnapshot = await db
      .collection("workouts")
      .where("userId", "==", userId)
      .get();
    const workouts = workoutsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get all progress records for the user
    const progressSnapshot = await db
      .collection("userProgress")
      .where("userId", "==", userId)
      .get();
    // Map progress records by workoutId for easy lookup
    const progressMap = {};
    progressSnapshot.docs.forEach((doc) => {
      const progressData = doc.data();
      const workoutId = progressData.workoutId;
      if (!progressMap[workoutId]) {
        progressMap[workoutId] = [];
      }
      progressMap[workoutId].push({ id: doc.id, ...progressData });
    });

    // Attach progress records to each workout
    const workoutsWithProgress = workouts.map((workout) => ({
      ...workout,
      progress: progressMap[workout.id] || [],
    }));

    res.json({ success: true, workouts: workoutsWithProgress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/workoutPlans", async (req, res) => {
  try {
    // Include userId here as well
    const { name, imageUrl, description, duration, workouts, userId } =
      req.body;

    // Create workout documents and store their IDs, linking each workout to the user
    const workoutIds = await Promise.all(
      workouts.map(async ({ name, imageUrl, description, duration }) => {
        const workoutRef = db.collection("workouts").doc();
        await workoutRef.set({
          name,
          imageUrl,
          description,
          duration,
          userId, // Associate workout with user
          created_at: admin.firestore.Timestamp.now(),
        });
        return workoutRef.id;
      })
    );

    // Create workout plan document, including the userId for linkage
    const planRef = db.collection("workoutPlans").doc();
    await planRef.set({
      name,
      imageUrl,
      description,
      duration,
      workoutIds, // Array of workout IDs
      userId, // Associate workout plan with user
      created_at: admin.firestore.Timestamp.now(),
    });

    res
      .status(201)
      .json({ id: planRef.id, message: "Workout Plan created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/workouts", async (req, res) => {
  try {
    // Assuming userId is passed in the request body or set by auth middleware
    const { name, imageUrl, description, duration, userId } = req.body;
    const workoutRef = db.collection("workouts").doc();
    await workoutRef.set({
      name,
      imageUrl,
      description,
      duration,
      userId, // Link workout to the user
      created_at: admin.firestore.Timestamp.now(),
    });
    res
      .status(201)
      .json({ id: workoutRef.id, message: "Workout created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users/:userId/workoutPlansWithProgress", async (req, res) => {
  try {
    const { userId } = req.params;

    // Retrieve all workout plans for the user
    const plansSnapshot = await db
      .collection("workoutPlans")
      .where("userId", "==", userId)
      .get();
    const workoutPlans = plansSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // For each plan, fetch the associated progress records
    const plansWithProgress = await Promise.all(
      workoutPlans.map(async (plan) => {
        const workoutIds = plan.workoutIds || [];
        let progressRecords = [];

        if (workoutIds.length > 0) {
          // Firestore 'in' queries support up to 10 elements.
          // If workoutIds.length > 10, consider batching your queries.
          const progressSnapshot = await db
            .collection("userProgress")
            .where("userId", "==", userId)
            .where("workoutId", "in", workoutIds.slice(0, 10))
            .get();
          progressRecords = progressSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        }
        return {
          ...plan,
          progress: progressRecords,
        };
      })
    );

    res.json({ success: true, workoutPlans: plansWithProgress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
