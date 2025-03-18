require("dotenv").config();
const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";

const generateWorkouts = async (weight, height, description) => {
  const prompt = `
  
    Generate a list of 5 workouts for a person with the following details:
       - Weight: ${weight} kg
    - Height: ${height} cm
    - Description: ${description}
    Each workout should include:
    - name
    - description
    - duration in minutes
    - imageUrl 
    
    Note one thing that imageUrl should be one of below links
    (https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/BURPEE.jpg?alt=media&token=ada9aa37-c84e-4486-a8df-3a4325f61f81, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/BURPEE1.jpg?alt=media&token=071be747-ff0b-4516-ac48-a14673dc8ba9, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/BURPEE2.jpg?alt=media&token=f2cf036b-1b8c-48dc-b319-edfd09fd8725, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/EXPLOSIVE.jpg?alt=media&token=69719f2b-e9aa-4c4b-b2bc-97e700d48e58, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/EXPLOSIVE1.jpg?alt=media&token=9b1b0d7c-8f94-4ad3-b3eb-67459e4b8bbf)

    Return as a JSON array.
  `;

  try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    console.log(response.data.choices[0].message.content);

    const workouts = JSON.parse(response.data.choices[0].message.content);
    console.log(workouts);
    return workouts;
  } catch (error) {
    console.error("Error generating workouts:", error);
    throw new Error("Failed to generate workouts.");
  }
};

const generateWorkoutPlan = async (weight, height, description) => {
  const prompt = `
      Generate a list of 4 workouts plans for a person  with the following details:

    - Weight: ${weight} kg
    - Height: ${height} cm
    - Description: ${description}
    
    each workout plan should include:
    - name(should be valid plan names )
    - description
    - imageUrl
    - List of 2 workouts (each workout should include name, description, duration in minutes,imageUrl, and a placeholder image URL)
    - duration (between 14-30 days)

     Note one thing that imageUrl should be one of below links
    (https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/BURPEE.jpg?alt=media&token=ada9aa37-c84e-4486-a8df-3a4325f61f81, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/BURPEE1.jpg?alt=media&token=071be747-ff0b-4516-ac48-a14673dc8ba9, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/BURPEE2.jpg?alt=media&token=f2cf036b-1b8c-48dc-b319-edfd09fd8725, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/EXPLOSIVE.jpg?alt=media&token=69719f2b-e9aa-4c4b-b2bc-97e700d48e58, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/EXPLOSIVE1.jpg?alt=media&token=9b1b0d7c-8f94-4ad3-b3eb-67459e4b8bbf)

   
    Return the workout plans as a JSON object that could be parsed in javascript.
  `;

  try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 3000,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    console.log(response.data.choices[0].message.content);
    const workoutPlan = JSON.parse(response.data.choices[0].message.content);
    return workoutPlan;
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw new Error("Failed to generate workout plan.");
  }
};

const generatePersonalizedBlogs = async (weight, height, description) => {
  const prompt = `
      Generate a list of 3 health blogs for a person  with the following details:

    - Weight: ${weight} kg
    - Height: ${height} cm
    - Description: ${description}
    
    each workout plan should include:
    id: string;
    title: string;
    writeTime: Date;
    content: string;
    imageUrl: string;

     Note one thing that imageUrl should be one of below links
    (https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/BURPEE.jpg?alt=media&token=ada9aa37-c84e-4486-a8df-3a4325f61f81, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/BURPEE1.jpg?alt=media&token=071be747-ff0b-4516-ac48-a14673dc8ba9, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/BURPEE2.jpg?alt=media&token=f2cf036b-1b8c-48dc-b319-edfd09fd8725, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/EXPLOSIVE.jpg?alt=media&token=69719f2b-e9aa-4c4b-b2bc-97e700d48e58, https://firebasestorage.googleapis.com/v0/b/losetogain-8d719.appspot.com/o/EXPLOSIVE1.jpg?alt=media&token=9b1b0d7c-8f94-4ad3-b3eb-67459e4b8bbf)

   
    Return the blogs as a JSON object that could be parsed in javascript.
  `;

  try {
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 3000,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );
    console.log(response.data.choices[0].message.content);
    const workoutPlan = JSON.parse(response.data.choices[0].message.content);
    return workoutPlan;
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw new Error("Failed to generate workout plan.");
  }
};

module.exports = {
  generateWorkouts,
  generateWorkoutPlan,
  generatePersonalizedBlogs,
};
