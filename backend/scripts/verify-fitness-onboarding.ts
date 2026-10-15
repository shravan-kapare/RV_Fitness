const API_BASE = 'http://localhost:3000/api/v1';

async function postJson(url: string, body: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function getJson(url: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'GET',
    headers,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function verify() {
  console.log('--- 1. Testing Role-Based Billing Permissions ---');
  // Login as Trainer
  const trainerLogin = await postJson(`${API_BASE}/auth/login`, {
    email: 'trainer@rvfitness.com',
    password: 'Trainer@123456',
  });
  const trainerToken = trainerLogin.data.data.accessToken;

  // Try to access Invoices as Trainer (Must fail with 403 Forbidden)
  const invRes = await getJson(`${API_BASE}/invoices`, trainerToken);
  if (invRes.status === 403) {
    console.log('✅ PASS: Trainer access to /invoices rejected with 403 Forbidden:', invRes.data?.message);
  } else {
    console.error('❌ FAIL: Expected 403, got status:', invRes.status, invRes.data);
  }

  // Try to access Payments as Trainer (Must fail with 403 Forbidden)
  const payRes = await getJson(`${API_BASE}/payments`, trainerToken);
  if (payRes.status === 403) {
    console.log('✅ PASS: Trainer access to /payments rejected with 403 Forbidden:', payRes.data?.message);
  } else {
    console.error('❌ FAIL: Expected 403, got status:', payRes.status, payRes.data);
  }

  // Try to access Receipts as Trainer (Must fail with 403 Forbidden)
  const recRes = await getJson(`${API_BASE}/receipts`, trainerToken);
  if (recRes.status === 403) {
    console.log('✅ PASS: Trainer access to /receipts rejected with 403 Forbidden:', recRes.data?.message);
  } else {
    console.error('❌ FAIL: Expected 403, got status:', recRes.status, recRes.data);
  }

  console.log('\n--- 2. Testing Member Onboarding & Workout Engine ---');
  // Login as Member (Rohit Shinde)
  const memberLogin = await postJson(`${API_BASE}/auth/login`, {
    email: 'rohit.shinde@example.com',
    password: 'Member@123456',
  });
  const memberToken = memberLogin.data.data.accessToken;

  // Check onboarding status
  const statusRes = await getJson(`${API_BASE}/members/onboarding-status`, memberToken);
  console.log('Initial onboarding status:', statusRes.data?.data);

  // Complete Onboarding
  const onboardingPayload = {
    dateOfBirth: '1998-05-14',
    gender: 'MALE',
    phone: '+91 98220 12345',
    emergencyContact: 'Vijay Shinde (+91 98220 99999)',
    address: 'Near Narsimha Temple, Main Road, Narsobawadi, Maharashtra 416104',
    weightKg: 78.5,
    heightCm: 178,
    bodyFatPct: 15.2,
    chestCm: 104,
    waistCm: 84,
    armsCm: 38,
    thighsCm: 58,
    goalType: 'MUSCLE_GAIN',
    targetWeightKg: 82,
    targetDate: '2026-12-31',
    experienceLevel: 'INTERMEDIATE',
    daysPerWeek: 6,
    dietaryPreference: 'High Protein Non-Veg & Eggs',
    limitations: ['LOWER_BACK_PAIN'],
    parqAccepted: true,
  };

  const onboardRes = await postJson(`${API_BASE}/members/onboarding`, onboardingPayload, memberToken);
  console.log('✅ Onboarding completed response:', onboardRes.data?.message);
  console.log('Assessment recorded:', onboardRes.data?.assessment ? `Weight: ${onboardRes.data.assessment.weightKg}kg, BMI: ${onboardRes.data.assessment.bmi}` : null);
  console.log('Goal recorded:', onboardRes.data?.goal ? `Goal: ${onboardRes.data.goal.goalType}, Target: ${onboardRes.data.goal.targetValue}` : null);

  // Fetch today's workout session in Asia/Kolkata
  const todayWorkoutRes = await getJson(`${API_BASE}/fitness/today-workout`, memberToken);
  const workoutData = todayWorkoutRes.data?.data;
  console.log('\n--- 3. Today Workout in Asia/Kolkata ---');
  console.log(`Plan: ${workoutData?.planTitle}`);
  console.log(`Day ${workoutData?.today?.dayNumber} (${workoutData?.today?.weekday}, ${workoutData?.today?.date}): ${workoutData?.today?.dayTitle}`);
  console.log(`Rest day: ${workoutData?.today?.restDay}, Total exercises: ${workoutData?.today?.totalExercises}`);
  
  if (workoutData?.today?.exercises && workoutData.today.exercises.length > 0) {
    console.log('Exercises for today:');
    workoutData.today.exercises.forEach((ex: any) => {
      console.log(`  - ${ex.orderIndex}. ${ex.exerciseName} | Eq: ${ex.requiredEquipment} [Operational: ${ex.isEquipmentOperational}] ${ex.isSubstituted ? '(SUBSTITUTED)' : ''}`);
      if (ex.substitutionNotice) {
        console.log(`    ⚠️ ${ex.substitutionNotice}`);
      }
    });
  }

  // Verify Equipment status endpoint
  const eqRes = await getJson(`${API_BASE}/fitness/equipment`);
  console.log(`\n--- 4. Equipment Inventory: ${eqRes.data?.data?.length} stations loaded ---`);
  const underMaintenance = (eqRes.data?.data || []).filter((e: any) => e.status !== 'OPERATIONAL');
  console.log('Equipment currently in maintenance:', underMaintenance.map((e: any) => e.name));
}

verify().catch(console.error);
