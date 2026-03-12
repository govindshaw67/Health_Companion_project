document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = "http://localhost:5000/api";

  // elements
  const pageAuth = document.getElementById("page-auth");
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const forgotPasswordForm = document.getElementById("forgot-password-form");
  const resetCodeForm = document.getElementById("reset-code-form");
  const pageQuestions = document.getElementById("page-questions");
  const pageDashboard = document.getElementById("page3");
  const btnSignup = document.getElementById("btn-signup");
  const btnLogin = document.getElementById("btn-login");
  const backBtn = document.getElementById("back");
  const nextBtn = document.getElementById("next");
  const progressDots = document.getElementById("progress-dots");
  const questionContainer = document.getElementById("question-container");
  const btnNewPlan = document.getElementById("btn-new-plan");
  
  // Forgot password elements
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  const backToLogin = document.getElementById("back-to-login");
  const backToForgot = document.getElementById("back-to-forgot");
  const resetSubmit = document.getElementById("reset-submit");
  const verifyResetCode = document.getElementById("verify-reset-code");

  const TOTAL_QUESTIONS = 10; // Changed from 9 to 10 for BPM question
  let currentQuestion = 0;
  let answers = {};
  let resetPhone = ''; // Store phone for reset process

  // Initialize UI - ALWAYS SHOW LOGIN PAGE FIRST
  function initializeUI() {
    signupForm.style.display = "none";
    loginForm.style.display = "none";
    forgotPasswordForm.style.display = "none";
    resetCodeForm.style.display = "none";
    pageQuestions.style.display = "none";
    pageDashboard.style.display = "none";
    pageAuth.style.display = "block";
    
    // 🔥 DISABLE AUTO-LOGIN - Clear tokens to force login page
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    console.log('🔍 [APP] Auto-login disabled - showing login page');
  }

  // Auth button handlers
  btnSignup.addEventListener("click", () => {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
    forgotPasswordForm.style.display = "none";
    resetCodeForm.style.display = "none";
  });

  btnLogin.addEventListener("click", () => {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    forgotPasswordForm.style.display = "none";
    resetCodeForm.style.display = "none";
  });

  // Forgot Password handlers
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    signupForm.style.display = "none";
    forgotPasswordForm.style.display = "block";
    resetCodeForm.style.display = "none";
  });

  backToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    forgotPasswordForm.style.display = "none";
    resetCodeForm.style.display = "none";
    loginForm.style.display = "block";
  });

  backToForgot.addEventListener("click", (e) => {
    e.preventDefault();
    resetCodeForm.style.display = "none";
    forgotPasswordForm.style.display = "block";
  });

  // Forgot Password - Send Reset Code
  resetSubmit.addEventListener("click", async () => {
    const phone = document.getElementById("reset-phone").value;
    
    if (!phone) {
      alert('Please enter your phone number');
      return;
    }

    resetPhone = phone; // Store for later use

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      
      if (res.ok) {
        alert(`Reset code sent! Demo code: ${data.demoCode}\n\nIn production, this would be sent via SMS.`);
        forgotPasswordForm.style.display = "none";
        resetCodeForm.style.display = "block";
      } else {
        alert(data.message || 'Failed to send reset code');
      }
    } catch (err) {
      console.error('🔍 [FORGOT PASSWORD] Error:', err);
      alert('Error sending reset code: ' + err.message);
    }
  });

  // Verify Reset Code and Set New Password
  verifyResetCode.addEventListener("click", async () => {
    const code = document.getElementById("reset-code").value;
    const newPassword = document.getElementById("new-password").value;

    if (!code || !newPassword) {
      alert('Please enter reset code and new password');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      // First verify the code
      const verifyRes = await fetch(`${API_BASE}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: resetPhone, code })
      });

      const verifyData = await verifyRes.json();
      
      if (!verifyRes.ok) {
        alert(verifyData.message || 'Invalid reset code');
        return;
      }

      // If code is verified, reset password
      const resetRes = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: resetPhone, code, newPassword })
      });

      const resetData = await resetRes.json();
      
      if (resetRes.ok) {
        alert('Password reset successfully! Please login with your new password.');
        resetCodeForm.style.display = "none";
        loginForm.style.display = "block";
        
        // Clear forms
        document.getElementById("reset-phone").value = "";
        document.getElementById("reset-code").value = "";
        document.getElementById("new-password").value = "";
        resetPhone = '';
      } else {
        alert(resetData.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('🔍 [RESET PASSWORD] Error:', err);
      alert('Error resetting password: ' + err.message);
    }
  });

  // Signup function
  document.getElementById("signup-submit").addEventListener("click", async () => {
    const name = document.getElementById("signup-name").value;
    const phone = document.getElementById("signup-phone").value;
    const password = document.getElementById("signup-password").value;
    
    console.log('🔍 [SIGNUP] Attempting signup...');
    
    if (!name || !phone || !password) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password })
      });
      
      console.log('🔍 [SIGNUP] Response status:', res.status);
      
      const data = await res.json();
      console.log('🔍 [SIGNUP] Response data:', data);
      
      if (res.ok) {
        console.log('🔍 [SIGNUP] Success!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        pageAuth.style.display = 'none';
        pageQuestions.style.display = 'block';
        renderQuestion();
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) { 
      console.error('🔍 [SIGNUP] Error:', err); 
      alert('Signup error: ' + err.message); 
    }
  });

  // Login function
  document.getElementById("login-submit").addEventListener("click", async () => {
    const phone = document.getElementById("login-phone").value;
    const password = document.getElementById("login-password").value;
    
    console.log('🔍 [LOGIN] Attempting login...');
    
    if (!phone || !password) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      
      console.log('🔍 [LOGIN] Response status:', res.status);
      
      const data = await res.json();
      console.log('🔍 [LOGIN] Response data:', data);
      
      if (res.ok) {
        console.log('🔍 [LOGIN] Success!');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        pageAuth.style.display = 'none';
        loadDashboard();
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) { 
      console.error('🔍 [LOGIN] Error:', err); 
      alert('Login error: ' + err.message); 
    }
  });

  // ✅ NEW: Enter key handler for questions
  function setupEnterKeyListener() {
    questionContainer.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        nextBtn.click(); // Trigger next button click
      }
    });
  }

  // ✅ NEW: Auto-focus on input fields
  function autoFocusInput() {
    setTimeout(() => {
      const input = questionContainer.querySelector('input');
      if (input && input.type !== 'radio' && input.type !== 'checkbox') {
        input.focus();
      }
    }, 100);
  }

  // Questionnaire rendering
  function renderProgress() {
    progressDots.innerHTML = '';
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const s = document.createElement('span');
      s.className = 'dot' + (i <= currentQuestion ? ' completed' : '');
      progressDots.appendChild(s);
    }
  }

  function renderQuestion() {
    renderProgress();
    questionContainer.innerHTML = '';
    switch(currentQuestion) {
      case 0:
        questionContainer.innerHTML = `<h2>Hello 👋</h2><p>Please tell us your name.</p><input id="qName" placeholder="Enter your full name" />`; 
        break;
      case 1:
        questionContainer.innerHTML = `<h2>Biological Sex</h2>
          <label><input type="radio" name="sex" value="Male" /> Male</label>
          <label><input type="radio" name="sex" value="Female" /> Female</label>`; 
        break;
      case 2:
        questionContainer.innerHTML = `<h2>Activity Level</h2>
          <label><input type="radio" name="activity" value="Sedentary" /> Mostly sitting</label>
          <label><input type="radio" name="activity" value="Moderate" /> Often standing</label>
          <label><input type="radio" name="activity" value="Active" /> Walking</label>`; 
        break;
      case 3:
        questionContainer.innerHTML = `<h2>Age</h2><input id="qAge" type="number" min="1" max="120" placeholder="Enter your age" />`; 
        break;
      case 4:
        questionContainer.innerHTML = `<h2>Height (cm)</h2><input id="qHeight" type="number" min="50" max="250" placeholder="Enter height in cm" />`; 
        break;
      case 5:
        questionContainer.innerHTML = `<h2>Weight (kg)</h2><input id="qWeight" type="number" min="20" max="300" placeholder="Enter weight in kg" />`; 
        break;
      case 6:
        questionContainer.innerHTML = `<h2>Food Preference</h2>
          <label><input type="radio" name="food" value="Vegetarian" /> Vegetarian</label>
          <label><input type="radio" name="food" value="Non-vegetarian" /> Non-vegetarian</label>
          <label><input type="radio" name="food" value="Vegan" /> Vegan</label>`; 
        break;
      case 7:
        questionContainer.innerHTML = `<h2>Allergies</h2><textarea id="qAllergies" placeholder="List any food allergies (optional)"></textarea>`; 
        break;
      case 8:
        questionContainer.innerHTML = `<h2>Health Conditions</h2>
          <label><input type="checkbox" name="conditions" value="Diabetes" /> Diabetes</label>
          <label><input type="checkbox" name="conditions" value="Hypertension" /> Hypertension</label>
          <label><input type="checkbox" name="conditions" value="Heart Disease" /> Heart Disease</label>
          <label><input type="checkbox" name="conditions" value="None" /> None</label>`; 
        break;
      case 9:
        questionContainer.innerHTML = `<h2>❤️ Heart Rate (BPM)</h2>
          <p>Enter your resting heart rate (beats per minute):</p>
          <input id="qBPM" type="number" min="40" max="200" placeholder="e.g., 72" />
          <div class="bpm-info">
            <p><strong>Normal Range:</strong> 60-100 BPM</p>
            <p><small>Below 60: Bradycardia | Above 100: Tachycardia</small></p>
          </div>`; 
        break;
    }
    
    backBtn.disabled = currentQuestion === 0;
    nextBtn.textContent = currentQuestion === TOTAL_QUESTIONS - 1 ? 'Finish' : 'Next >';
    
    // ✅ Setup enter key listener and auto-focus
    setupEnterKeyListener();
    autoFocusInput();
  }

  backBtn.addEventListener('click', () => { 
    if (currentQuestion > 0) { 
      currentQuestion--; 
      renderQuestion(); 
    } 
  });

  nextBtn.addEventListener('click', async () => {
    if (!saveAnswer()) {
      alert('Please answer this question before continuing.');
      return;
    }
    
    if (currentQuestion < TOTAL_QUESTIONS - 1) { 
      currentQuestion++; 
      renderQuestion(); 
    } else { 
      await savePlan(); 
    }
  });

  function saveAnswer() {
    let isValid = true;
    
    switch(currentQuestion) {
      case 0: 
        answers.name = document.getElementById('qName')?.value || '';
        isValid = answers.name.trim() !== '';
        break;
      case 1: 
        answers.sex = document.querySelector("input[name='sex']:checked")?.value || '';
        isValid = answers.sex !== '';
        break;
      case 2: 
        answers.activity = document.querySelector("input[name='activity']:checked")?.value || '';
        isValid = answers.activity !== '';
        break;
      case 3: 
        answers.age = parseInt(document.getElementById('qAge')?.value) || 0;
        isValid = answers.age > 0 && answers.age <= 120;
        break;
      case 4: 
        answers.height = parseFloat(document.getElementById('qHeight')?.value) || 0;
        isValid = answers.height > 50 && answers.height <= 250;
        break;
      case 5: 
        answers.weight = parseFloat(document.getElementById('qWeight')?.value) || 0;
        isValid = answers.weight > 20 && answers.weight <= 300;
        break;
      case 6: 
        answers.food = document.querySelector("input[name='food']:checked")?.value || '';
        isValid = answers.food !== '';
        break;
      case 7: 
        answers.allergies = document.getElementById('qAllergies')?.value || '';
        isValid = true; // Allergies are optional
        break;
      case 8: 
        answers.conditions = Array.from(document.querySelectorAll("input[name='conditions']:checked")).map(cb => cb.value);
        isValid = true; // Conditions are optional
        break;
      case 9:
        answers.bpm = parseInt(document.getElementById('qBPM')?.value) || 0;
        isValid = answers.bpm >= 40 && answers.bpm <= 200;
        if (!isValid) {
          alert('Please enter a valid BPM between 40 and 200');
        }
        break;
    }
    
    return isValid;
  }

  async function savePlan() {
    const token = localStorage.getItem('token');
    if (!token) { 
      alert('Not authenticated'); 
      return; 
    }
    
    console.log('🔍 [SAVE PLAN] Saving plan with answers:', answers);
    
    try {
      nextBtn.disabled = true;
      nextBtn.textContent = 'Generating plan...';
      
      const res = await fetch(`${API_BASE}/plans`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ answers })
      });
      
      console.log('🔍 [SAVE PLAN] Response status:', res.status);
      
      const data = await res.json();
      console.log('🔍 [SAVE PLAN] Response data:', data);
      
      nextBtn.disabled = false;
      nextBtn.textContent = 'Finish';
      
      if (!res.ok) { 
        alert(data.message || 'Failed to save plan'); 
      } else {
        loadDashboard();
      }
    } catch (err) {
      console.error('🔍 [SAVE PLAN] Error:', err);
      alert('Error saving plan: ' + err.message);
      nextBtn.disabled = false;
      nextBtn.textContent = 'Finish';
    }
  }

  // Get BPM status and recommendations
  function getBPMStatus(bpm) {
    if (bpm < 60) return { status: 'low', emoji: '💙', message: 'Low Heart Rate (Bradycardia)' };
    if (bpm > 100) return { status: 'high', emoji: '❤️', message: 'High Heart Rate (Tachycardia)' };
    return { status: 'normal', emoji: '💚', message: 'Normal Heart Rate' };
  }

  function getBPMRecommendations(bpm) {
    if (bpm < 60) {
      return {
        diet: "• Increase electrolyte intake (bananas, spinach, nuts)\n• Include omega-3 rich foods (salmon, walnuts)\n• Stay hydrated with electrolyte drinks\n• Moderate caffeine intake",
        exercise: "• Light cardio activities (walking, swimming)\n• Strength training 2-3 times weekly\n• Avoid intense endurance training\n• Regular breathing exercises"
      };
    } else if (bpm > 100) {
      return {
        diet: "• Reduce caffeine and stimulants\n• Increase magnesium-rich foods (dark leafy greens, avocados)\n• Include calming herbs (chamomile tea)\n• Limit processed foods and sugar",
        exercise: "• Gentle yoga and stretching\n• Meditation and deep breathing\n• Light walking 20-30 minutes daily\n• Avoid high-intensity workouts"
      };
    } else {
      return {
        diet: "• Balanced diet with lean proteins\n• Whole grains and fresh vegetables\n• Healthy fats (avocado, olive oil)\n• Stay hydrated with water",
        exercise: "• 30 minutes moderate exercise daily\n• Mix of cardio and strength training\n• Regular stretching and flexibility work\n• Active lifestyle maintenance"
      };
    }
  }

  // Dashboard load function
  async function loadDashboard() {
    console.log('🔍 [DASHBOARD] Starting loadDashboard...');
    
    pageAuth.style.display = 'none';
    pageQuestions.style.display = 'none';
    pageDashboard.style.display = 'block';
    
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    console.log('🔍 [DASHBOARD] Token exists:', !!token);
    console.log('🔍 [DASHBOARD] User ID:', userId);
    
    if (!token) { 
      alert('Not authenticated - Please login again'); 
      pageAuth.style.display = 'block';
      pageDashboard.style.display = 'none';
      return; 
    }

    try {
      console.log('🔍 [DASHBOARD] Fetching dashboard data...');
      
      const res = await fetch(`${API_BASE}/plans/dashboard`, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('🔍 [DASHBOARD] Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.log('🔍 [DASHBOARD] Error data:', errorData);
        throw new Error(errorData.message || 'Failed to load dashboard');
      }
      
      const data = await res.json();
      console.log('🔍 [DASHBOARD] Success! Data received:', data);
      
      const { user } = data;
      const p = user.latestPlan || {};
      const userBPM = user.bpm || p.bpm;
      
      // Get BPM status and recommendations
      const bpmStatus = userBPM ? getBPMStatus(userBPM) : null;
      const bpmRecommendations = userBPM ? getBPMRecommendations(userBPM) : null;

      // Handle different response formats for diet and exercise plans
      let dietHTML = '<p>No diet plan yet</p>';
      let exHTML = '<p>No exercise plan yet</p>';
      
      if (p.dietPlan) {
        if (typeof p.dietPlan === 'object') {
          dietHTML = p.dietPlan.summary ? 
            `<div class="plan-section">${p.dietPlan.summary}</div>` : 
            `<pre>${JSON.stringify(p.dietPlan, null, 2)}</pre>`;
        } else {
          dietHTML = `<div class="plan-section">${p.dietPlan}</div>`;
        }
      }
      
      if (p.exercisePlan) {
        if (typeof p.exercisePlan === 'object') {
          exHTML = p.exercisePlan.summary ? 
            `<div class="plan-section">${p.exercisePlan.summary}</div>` : 
            `<pre>${JSON.stringify(p.exercisePlan, null, 2)}</pre>`;
        } else {
          exHTML = `<div class="plan-section">${p.exercisePlan}</div>`;
        }
      }

      // BPM Display Section
      const bpmDisplay = userBPM ? `
        <div class="bpm-display ${bpmStatus.status}">
          <div class="bpm-header">
            <h3>${bpmStatus.emoji} Heart Health</h3>
            <span class="bpm-value">${userBPM} BPM</span>
          </div>
          <p class="bpm-status">${bpmStatus.message}</p>
          <div class="bpm-recommendations">
            <div class="recommendation-card">
              <h4>🍽️ Diet Suggestions</h4>
              <div class="plan-section">${bpmRecommendations.diet}</div>
            </div>
            <div class="recommendation-card">
              <h4>💪 Exercise Suggestions</h4>
              <div class="plan-section">${bpmRecommendations.exercise}</div>
            </div>
          </div>
        </div>
      ` : `
        <div class="bpm-display no-data">
          <h3>❤️ Heart Rate</h3>
          <p>Complete your health assessment to get personalized heart health recommendations.</p>
        </div>
      `;
      
      document.getElementById('user-info').innerHTML = `
        <div class="user-profile">
          <h3>Your Profile</h3>
          <p><strong>Name:</strong> ${user.name || 'Not set'}</p>
          <p><strong>Phone:</strong> ${user.phone || 'Not set'}</p>
          <p><strong>Age:</strong> ${user.age || 'Not set'}</p>
          <p><strong>Height:</strong> ${user.height || 'Not set'} cm</p>
          <p><strong>Weight:</strong> ${user.weight || 'Not set'} kg</p>
          <p><strong>Activity Level:</strong> ${user.activity || 'Not set'}</p>
          ${userBPM ? `<p><strong>Resting BPM:</strong> ${userBPM}</p>` : ''}
        </div>
        
        ${bpmDisplay}
        
        <div class="health-plans">
          <div class="plan-card">
            <h3>🍽️ Your Diet Plan</h3>
            ${dietHTML}
          </div>
          <div class="plan-card">
            <h3>💪 Your Exercise Plan</h3>
            ${exHTML}
          </div>
        </div>
      `;
      
      console.log('🔍 [DASHBOARD] Dashboard loaded successfully!');
      
    } catch (err) {
      console.error('🔍 [DASHBOARD] Error:', err);
      
      if (err.message.includes('Invalid Token') || err.message.includes('401')) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        pageAuth.style.display = 'block';
        pageDashboard.style.display = 'none';
      } else {
        alert('Error loading dashboard: ' + err.message);
      }
    }
  }

  // New plan button
  if (btnNewPlan) {
    btnNewPlan.addEventListener('click', () => {
      console.log('🔍 [NEW PLAN] Starting new plan creation...');
      pageQuestions.style.display = 'block';
      pageDashboard.style.display = 'none';
      currentQuestion = 0;
      answers = {};
      renderQuestion();
    });
  }

  // Initialize the app - ALWAYS SHOW LOGIN PAGE FIRST
  initializeUI();
});