import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "microsoft/wizardlm-2-8x22b:free", 
  "qwen/qwen-2.5-72b-instruct:free",
  "google/gemini-2.0-flash-exp:free"
];

export async function askAI(prompt, modelIndex = 0) {
  if (modelIndex >= FREE_MODELS.length) {
    throw new Error("All models are rate limited. Please try again later.");
  }

  const MODEL_NAME = FREE_MODELS[modelIndex];
  
  try {
    console.log(`🔧 Trying model: ${MODEL_NAME} (${modelIndex + 1}/${FREE_MODELS.length})`);

    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2500,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Health Companion"
        },
        timeout: 30000
      }
    );

    console.log("✅ AI Response received successfully");
    return {
      content: response.data?.choices?.[0]?.message?.content || "No response content",
      model: MODEL_NAME
    };
    
  } catch (error) {
    if (error.response?.status === 429) {
      console.log(`❌ ${MODEL_NAME} is rate limited, trying next model...`);
      return await askAI(prompt, modelIndex + 1);
    }
    
    console.error("❌ OpenRouter API Error:");
    console.error("Status:", error.response?.status);
    console.error("Error:", error.response?.data?.error?.message || error.message);
    
    throw new Error(`OpenRouter API failed: ${error.response?.data?.error?.message || error.message}`);
  }
}

// ✅ NEW: Get BPM-specific guidance
function getBPMGuidance(bpm) {
  if (bpm < 60) {
    return {
      goal: "INCREASE heart rate to normal range (60-100 BPM)",
      dietFocus: "Foods that naturally stimulate circulation and heart function",
      exerciseFocus: "Activities that safely elevate heart rate",
      timeline: "4-8 weeks for improvement",
      warning: "Consult doctor if BPM consistently below 50"
    };
  } else if (bpm > 100) {
    return {
      goal: "LOWER heart rate to normal range (60-100 BPM)", 
      dietFocus: "Foods that calm nervous system and reduce stress",
      exerciseFocus: "Gentle activities that don't overstimulate",
      timeline: "2-6 weeks for improvement",
      warning: "Consult doctor if BPM consistently above 110"
    };
  } else {
    return {
      goal: "MAINTAIN healthy heart rate (60-100 BPM)",
      dietFocus: "Foods that support cardiovascular health",
      exerciseFocus: "Balanced activities for heart maintenance",
      timeline: "Ongoing maintenance",
      warning: "Regular monitoring recommended"
    };
  }
}

export async function generateHealthPlan(answers) {
  try {
    const isMinor = answers.age < 18;
    const userBPM = answers.bpm;
    const bpmGuidance = userBPM ? getBPMGuidance(userBPM) : null;
    
    const prompt = `
Create a personalized health plan with POINT-WISE format in bullet points.

USER PROFILE:
- Name: ${answers.name}
- Age: ${answers.age} ${isMinor ? '(Minor)' : ''}
- Height: ${answers.height} cm
- Weight: ${answers.weight} kg
- Activity Level: ${answers.activity}
- Food Preference: ${answers.food}
- Resting Heart Rate: ${userBPM ? userBPM + ' BPM' : 'Not provided'}
- Allergies: ${answers.allergies || 'None'}
- Health Conditions: ${answers.conditions?.join(', ') || 'None'}

${userBPM ? `
HEART RATE FOCUS:
- Current BPM: ${userBPM} (${bpmGuidance.goal})
- Target: Normal range 60-100 BPM
- Timeline: ${bpmGuidance.timeline}
- ${bpmGuidance.warning}
` : ''}

${isMinor ? 'IMPORTANT: Provide age-appropriate, safe guidance for teenagers.' : ''}

CRITICAL: Format your response EXACTLY like this with BULLET POINTS:

DIET PLAN:
${userBPM ? `🎯 PRIMARY GOAL: ${bpmGuidance.dietFocus}` : ''}
• [First specific dietary recommendation - make it actionable]
• [Second specific dietary recommendation - include portion/serving details]  
• [Third specific dietary recommendation - mention timing if relevant]
• [Fourth specific dietary recommendation - include food examples]
• [Fifth specific dietary recommendation - practical and measurable]
${userBPM ? `• [Include BPM-specific food recommendations]` : ''}

EXERCISE PLAN:
${userBPM ? `🎯 PRIMARY GOAL: ${bpmGuidance.exerciseFocus}` : ''}
• [First specific exercise recommendation - include duration/frequency]
• [Second specific exercise recommendation - be specific about type]
• [Third specific exercise recommendation - mention intensity level]
• [Fourth specific exercise recommendation - include progression]
• [Fifth specific exercise recommendation - safety considerations]
${userBPM ? `• [Include BPM-specific exercise modifications]` : ''}

${userBPM ? `
HEART RATE MONITORING:
• [Instruction for tracking BPM progress]
• [Signs of improvement to watch for]
• [When to seek medical advice]
` : ''}

RULES:
- Use bullet points (•) for EVERY point
- Keep diet and exercise sections completely separate  
- Each point should be clear, specific and actionable
- Focus on practical advice tailored to the user's profile
- Make 5-7 points for each section
- ${userBPM ? 'SPECIALLY FOCUS ON HEART RATE NORMALIZATION STRATEGIES' : 'Focus on general health maintenance'}
`;

    console.log("🧠 Generating health plan...");
    console.log(`🔍 [AI SERVICE] User BPM: ${userBPM || 'Not provided'}`);
    const aiResult = await askAI(prompt);
    const content = aiResult.content;
    
    console.log('🔍 [AI SERVICE] Raw AI response:', content);
    
    // Parse the response to separate diet and exercise plans
    let dietPlan, exercisePlan;
    
    if (content.includes('DIET PLAN:') && content.includes('EXERCISE PLAN:')) {
      const dietIndex = content.indexOf('DIET PLAN:') + 'DIET PLAN:'.length;
      const exerciseIndex = content.indexOf('EXERCISE PLAN:');
      
      dietPlan = content.substring(dietIndex, exerciseIndex).trim();
      exercisePlan = content.substring(exerciseIndex + 'EXERCISE PLAN:'.length).trim();
    } else {
      // Fallback parsing
      const midPoint = Math.floor(content.length / 2);
      dietPlan = content.substring(0, midPoint).trim();
      exercisePlan = content.substring(midPoint).trim();
    }
    
    // Ensure bullet point format
    if (!dietPlan.includes('•') && !dietPlan.includes('-')) {
      dietPlan = dietPlan.split('\n')
        .filter(line => line.trim())
        .map(line => `• ${line.trim()}`)
        .join('\n');
    }
    
    if (!exercisePlan.includes('•') && !exercisePlan.includes('-')) {
      exercisePlan = exercisePlan.split('\n')
        .filter(line => line.trim())
        .map(line => `• ${line.trim()}`)
        .join('\n');
    }
    
    return {
      dietPlan: dietPlan || "• No diet plan generated",
      exercisePlan: exercisePlan || "• No exercise plan generated",
      meta: { 
        provider: "openrouter", 
        model: aiResult.model,
        timestamp: new Date().toISOString(),
        isMinor: isMinor,
        bpm: userBPM,
        bpmStatus: userBPM ? getBPMGuidance(userBPM).goal : null
      },
    };
    
  } catch (err) {
    console.error("💥 AI service error:", err.message);
    
    // ✅ IMPROVED FALLBACK with BPM-specific plans
    const userBPM = answers.bpm;
    
    let fallbackDiet, fallbackExercise;
    
    if (userBPM && userBPM < 60) {
      // Low BPM fallback
      fallbackDiet = 
`• 🎯 GOAL: Increase heart rate naturally to 60-100 BPM
• Eat potassium-rich foods: 2 bananas daily + spinach in meals
• Include moderate caffeine: 1-2 cups green tea before noon  
• Consume iron-rich foods: lean red meat 3x weekly or lentils
• Add omega-3s: salmon/walnuts 4x weekly for heart health
• Stay hydrated: 8-10 glasses electrolyte water daily
• Small frequent meals: 5-6 meals to maintain energy`;
      
      fallbackExercise =
`• 🎯 GOAL: Safely stimulate cardiovascular system
• Brisk walking: 30 minutes daily to elevate heart rate
• Light strength training: 2-3 times weekly with weights
• Circuit training: gentle circuits with 30-sec rest periods  
• Breathing exercises: deep breathing 10 minutes daily
• Avoid prolonged sitting: stand/move every 30 minutes
• Monitor: Check BPM weekly, aim for 5-10 BPM increase in 4 weeks`;
      
    } else if (userBPM && userBPM > 100) {
      // High BPM fallback
      fallbackDiet =
`• 🎯 GOAL: Lower heart rate naturally to 60-100 BPM
• Magnesium-rich foods: dark leafy greens + avocado daily
• Potassium sources: sweet potatoes, bananas, coconut water
• Anti-inflammatory: turmeric, ginger, berries in meals
• Calming herbs: chamomile tea 2x daily, passionflower
• Reduce stimulants: limit coffee to 1 cup, no energy drinks
• Small light meals: avoid large heavy meals that stress body`;
      
      fallbackExercise =
`• 🎯 GOAL: Calm nervous system and reduce stress
• Gentle walking: 20 minutes in nature daily
• Restorative yoga: 15 minutes focusing on deep breathing
• Meditation: 10-15 minutes daily for stress reduction
• Tai Chi: gentle movements 3x weekly if available
• Avoid HIIT: no high-intensity workouts temporarily
• Monitor: Check BPM weekly, aim for 10-15 BPM decrease in 3 weeks`;
      
    } else {
      // Normal BPM or no BPM fallback
      fallbackDiet = 
`• Eat 3 balanced meals daily with proteins, carbs, and healthy fats
• Include ${answers.food?.toLowerCase() || 'balanced'} protein sources in every meal
• Drink 8-10 glasses of water daily
• Consume 5 servings of fruits and vegetables daily
• Limit processed foods and sugary drinks
• Practice portion control and mindful eating
• Have healthy snacks like nuts or fruits between meals`;

      fallbackExercise = 
`• Start with 30 minutes of daily walking or light activity
• Include strength training 2-3 times per week
• Gradually increase exercise intensity over 4 weeks
• Mix cardio, strength, and flexibility exercises
• Schedule workouts at consistent times daily
• Listen to your body and rest when needed
• Track your progress and adjust accordingly`;
    }

    return {
      dietPlan: fallbackDiet,
      exercisePlan: fallbackExercise,
      meta: { 
        provider: "fallback", 
        model: "none",
        timestamp: new Date().toISOString(),
        bpm: userBPM,
        bpmStatus: userBPM ? getBPMGuidance(userBPM).goal : null
      },
    };
  }
}

// Export generatePlan as an alias for generateHealthPlan
export { generateHealthPlan as generatePlan };