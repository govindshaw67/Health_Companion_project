import dotenv from "dotenv";
import { generatePlan } from "./services/aiService.js";

dotenv.config();

async function testAI() {
  try {
    console.log("🔧 Starting AI test...");
    console.log("📋 Checking environment variables...");
    
    // Check if API key is loaded
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY not found in environment variables");
    }
    console.log("✅ API Key loaded successfully");
    console.log("🤖 Model:", process.env.MODEL_NAME || "google/gemini-2.0-flash-exp:free");

    const answers = {
      age: 25,
      weight: 70,
      height: 175,
      activity: "moderate",
      fitnessGoal: "lose weight", 
      food: "balanced",
    };

    console.log("\n🧠 Sending prompt to OpenRouter AI...");
    console.log("📊 User data:", JSON.stringify(answers, null, 2));
    
    const result = await generatePlan(answers);

    console.log("\n" + "=".repeat(50));
    console.log("✅ AI TEST SUCCESSFUL!");
    console.log("=".repeat(50));
    
    console.log("\n🗒️  Diet Plan:");
    console.log(result.dietPlan);
    
    console.log("\n🏋️  Exercise Plan:");
    console.log(result.exercisePlan);
    
    console.log("\n📊 Meta Info:");
    console.log(JSON.stringify(result.meta, null, 2));
    
  } catch (error) {
    console.log("\n" + "=".repeat(50));
    console.log("❌ AI TEST FAILED");
    console.log("=".repeat(50));
    console.error("Error details:", error.message);
    
    // Additional debugging info
    if (error.message.includes("API key")) {
      console.log("\n💡 TROUBLESHOOTING:");
      console.log("1. Check your .env file has OPENROUTER_API_KEY=your_key_here");
      console.log("2. Make sure the API key is valid");
      console.log("3. Visit https://openrouter.ai/keys to manage your keys");
    }
    
    if (error.message.includes("model")) {
      console.log("\n💡 Try these models in your .env file:");
      console.log('MODEL_NAME="google/gemini-2.0-flash-exp:free"');
      console.log('MODEL_NAME="meta-llama/llama-3.3-70b-instruct:free"');
    }
  }
}

// Run the test
testAI();