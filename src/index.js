const express = require("express");
const { db, admin } = require("./config/firebase");
const {
  generateWorkouts,
  generateWorkoutPlan,
  generatePersonalizedBlogs,
} = require("./aiService");
const router = express.Router();

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

router.post("/workoutPlans", async (req, res) => {
  try {
    console.log("start", req.body);
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

router.delete("/workouts/:workoutId", async (req, res) => {
  try {
    const { workoutId } = req.params;

    // Reference to the workout document
    const workoutRef = db.collection("workouts").doc(workoutId);

    // Check if the workout exists
    const workoutDoc = await workoutRef.get();
    if (!workoutDoc.exists) {
      return res.status(404).json({ message: "Workout not found." });
    }

    // Delete the workout
    await workoutRef.delete();
    res.status(200).json({ message: "Workout deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/workouts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const workoutsSnapshot = await db
      .collection("workouts")
      .where("userId", "==", userId)
      .get();

    if (workoutsSnapshot.empty) {
      return res
        .status(404)
        .json({ message: "No workouts found for this user." });
    }

    const workouts = workoutsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all workout plans by userId along with corresponding workouts
router.get("/workoutPlans/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const plansSnapshot = await db
      .collection("workoutPlans")
      .where("userId", "==", userId)
      .get();

    if (plansSnapshot.empty) {
      return res
        .status(404)
        .json({ message: "No workout plans found for this user." });
    }

    const plans = await Promise.all(
      plansSnapshot.docs.map(async (planDoc) => {
        const planData = planDoc.data();
        const workoutIds = planData.workoutIds || [];

        // Fetch workouts corresponding to workoutIds
        const workouts = await Promise.all(
          workoutIds.map(async (id) => {
            const workoutDoc = await db.collection("workouts").doc(id).get();
            return workoutDoc.exists
              ? { id: workoutDoc.id, ...workoutDoc.data() }
              : null;
          })
        );

        return {
          id: planDoc.id,
          ...planData,
          workouts: workouts.filter((workout) => workout !== null), // Remove null workouts
        };
      })
    );

    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/progress", async (req, res) => {
  try {
    const { workoutId, duration } = req.body;
    console.log(req.body);
    if (!workoutId || duration === undefined) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    console.log(req.body);

    const progressRef = db.collection("workoutProgress").doc();
    await progressRef.set({
      workoutId,
      duration,
      date: new Date(),
    });
    console.log("hello");
    res
      .status(201)
      .json({ id: progressRef.id, message: "Progress stored successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workout progress by workoutId
router.get("/progress/:workoutId", async (req, res) => {
  try {
    const { workoutId } = req.params;
    const progressSnapshot = await db
      .collection("workoutProgress")
      .where("workoutId", "==", workoutId)
      .get();

    if (progressSnapshot.empty) {
      return res
        .status(404)
        .json({ message: "No progress found for this workout." });
    }

    const progressRecords = progressSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(progressRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
