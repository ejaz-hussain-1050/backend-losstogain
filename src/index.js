const express = require("express");
const { db } = require("./config/firebase");
const router = express.Router();
router.post("/users", async (req, res) => {
  try {
    const { name, email, weight, height, description } = req.body;
    const userRef = db.collection("users").doc();
    await userRef.set({
      name,
      email,
      weight,
      height,
      description,
      created_at: admin.firestore.Timestamp.now(),
    });
    res
      .status(201)
      .json({ id: userRef.id, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
    const { name, imageUrl, description, duration, workouts } = req.body; // workouts = array of workout IDs
    const planRef = db.collection("workoutPlans").doc();
    await planRef.set({
      name,
      imageUrl,
      description,
      duration,
      workouts, // Store as an array of workout IDs
      created_at: admin.firestore.Timestamp.now(),
    });
    res
      .status(201)
      .json({ id: planRef.id, message: "Workout Plan created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/userWorkouts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { workoutId } = req.body;

    const userWorkoutRef = db
      .collection("userWorkouts")
      .doc(userId)
      .collection("workouts")
      .doc(workoutId);
    await userWorkoutRef.set({
      start_date: admin.firestore.Timestamp.now(),
      active: true,
    });

    res.status(201).json({ message: "Workout added to user successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/userPlans/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { planId } = req.body;

    const userPlanRef = db
      .collection("userPlans")
      .doc(userId)
      .collection("plans")
      .doc(planId);
    await userPlanRef.set({
      start_date: admin.firestore.Timestamp.now(),
      active: true,
    });

    res
      .status(201)
      .json({ message: "Workout Plan added to user successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/userProgress/:userId/workout/:workoutId", async (req, res) => {
  try {
    const { userId, workoutId } = req.params;
    const { total_time } = req.body;

    const progressRef = db
      .collection("userProgress")
      .doc(userId)
      .collection("workoutProgress")
      .doc(workoutId);
    await progressRef.set(
      {
        date: admin.firestore.Timestamp.now(),
        total_time,
      },
      { merge: true }
    );

    res.status(201).json({ message: "Workout progress updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, reference_id } = req.body; // Type: "workout" or "plan"

    const historyRef = db
      .collection("history")
      .doc(userId)
      .collection("records")
      .doc();
    await historyRef.set({
      type,
      reference_id,
      completion_date: admin.firestore.Timestamp.now(),
    });

    res
      .status(201)
      .json({ message: "Workout/Plan moved to history successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
