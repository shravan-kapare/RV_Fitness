import { prisma } from '../../config/database';
import { GoalType, EquipmentStatus } from '@prisma/client';
import { EquipmentService } from './equipment.service';

export interface ExerciseTemplate {
  exerciseName: string;
  targetMuscle: string;
  requiredEquipment: string;
  alternativeExerciseName: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface DayTemplate {
  dayNumber: number; // 1 = Monday ... 7 = Sunday
  dayTitle: string;
  restDay: boolean;
  exercises: ExerciseTemplate[];
}

export class WorkoutEngineService {
  /**
   * Calculates the current day-of-week and time details in Asia/Kolkata timezone.
   */
  public static getKolkataDayInfo() {
    const now = new Date();
    // Format to Asia/Kolkata
    const kolkataDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    const weekdayStr = now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long' });
    
    // In JavaScript Date.getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
    // Convert to ISO: 1 = Mon, 2 = Tue, ..., 7 = Sun
    const parts = kolkataDateStr.split('-');
    const localDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const dayOfWeek = localDate.getDay();
    const isoDayNumber = dayOfWeek === 0 ? 7 : dayOfWeek;

    return {
      isoDayNumber,
      weekdayStr,
      kolkataDateStr,
    };
  }

  /**
   * Returns standard 7-day workout routine templates based on goal, experience, and limitations.
   */
  public static getTemplatesForGoal(goalType: GoalType, limitations: string[] = []): DayTemplate[] {
    const hasBackPain = limitations.some((l) => /back/i.test(l));
    const hasKneePain = limitations.some((l) => /knee/i.test(l));
    const hasShoulderPain = limitations.some((l) => /shoulder/i.test(l));

    switch (goalType) {
      case GoalType.MUSCLE_GAIN:
        return [
          {
            dayNumber: 1, // Monday
            dayTitle: 'Push A — Hypertrophy & Chest Power',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Olympic Barbell Flat Bench Press',
                targetMuscle: 'CHEST',
                requiredEquipment: 'Olympic Flat Bench Press',
                alternativeExerciseName: 'Dumbbell Flat Floor Press',
                sets: 4,
                reps: '8-10 reps',
                restSeconds: 90,
              },
              {
                exerciseName: 'Incline Dumbbell Chest Press',
                targetMuscle: 'CHEST',
                requiredEquipment: 'Incline Dumbbell Bench Station',
                alternativeExerciseName: 'Elevated Push-Ups With 2-sec Pause',
                sets: 3,
                reps: '10-12 reps',
                restSeconds: 75,
              },
              {
                exerciseName: 'Pec Deck Machine Chest Flyes',
                targetMuscle: 'CHEST',
                requiredEquipment: 'Pec Deck / Rear Delt Fly Machine',
                alternativeExerciseName: 'Dual Cable Standing Chest Crossover',
                sets: 3,
                reps: '12-15 reps',
                restSeconds: 60,
              },
              {
                exerciseName: hasShoulderPain ? 'Neutral Grip Dumbbell Shoulder Press' : 'Seated Overhead Dumbbell Shoulder Press',
                targetMuscle: 'SHOULDERS',
                requiredEquipment: 'Seated Overhead Dumbbell Shoulder Bench',
                alternativeExerciseName: 'Standing Dumbbell Push Press',
                sets: 3,
                reps: '10 reps',
                restSeconds: 90,
              },
              {
                exerciseName: 'Cable Triceps Rope Pushdown',
                targetMuscle: 'ARMS',
                requiredEquipment: 'Triceps Rope Pushdown Cable Station',
                alternativeExerciseName: 'Bodyweight Bench Dips',
                sets: 3,
                reps: '12-15 reps',
                restSeconds: 60,
              },
            ],
          },
          {
            dayNumber: 2, // Tuesday
            dayTitle: 'Pull A — Lat Width & Upper Back Density',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Wide-Grip Lat Pulldown',
                targetMuscle: 'BACK',
                requiredEquipment: 'Lat Pulldown & Low Row Machine',
                alternativeExerciseName: 'Resistance Band Kneeling Pulldown',
                sets: 4,
                reps: '10-12 reps',
                restSeconds: 90,
              },
              {
                exerciseName: hasBackPain ? 'Chest-Supported Dumbbell Rows' : 'T-Bar Supported Row',
                targetMuscle: 'BACK',
                requiredEquipment: 'T-Bar Supported Row Platform',
                alternativeExerciseName: 'Single-Arm Dumbbell Bench Row',
                sets: 3,
                reps: '8-10 reps',
                restSeconds: 75,
              },
              {
                exerciseName: 'Seated Cable Row to Abdomen',
                targetMuscle: 'BACK',
                requiredEquipment: 'Lat Pulldown & Low Row Machine',
                alternativeExerciseName: 'Bent-Over Dumbbell Neutral Rows',
                sets: 3,
                reps: '10-12 reps',
                restSeconds: 60,
              },
              {
                exerciseName: 'Standing Cable Face Pulls',
                targetMuscle: 'SHOULDERS',
                requiredEquipment: 'Dual Adjustable Cable Crossover',
                alternativeExerciseName: 'Dumbbell Rear Delt Flyes',
                sets: 3,
                reps: '15 reps',
                restSeconds: 60,
              },
              {
                exerciseName: 'EZ-Bar Preacher Biceps Curls',
                targetMuscle: 'ARMS',
                requiredEquipment: 'EZ-Bar Preacher Biceps Bench',
                alternativeExerciseName: 'Standing Dumbbell Alternating Curls',
                sets: 3,
                reps: '10-12 reps',
                restSeconds: 60,
              },
            ],
          },
          {
            dayNumber: 3, // Wednesday
            dayTitle: 'Legs A — Quad Hypertrophy & Calves',
            restDay: false,
            exercises: [
              {
                exerciseName: hasKneePain ? 'Goblet Box Squats with Tempo' : 'Olympic Barbell Back Squat',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Power Squat Cage & Olympic Platform',
                alternativeExerciseName: 'Dumbbell Bulgarian Split Squat',
                sets: 4,
                reps: '8-10 reps',
                restSeconds: 120,
              },
              {
                exerciseName: '45-Degree Angled Leg Press',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Angled Leg Press 45-Degree',
                alternativeExerciseName: 'Walking Dumbbell Lunge Matrix',
                sets: 3,
                reps: '12 reps',
                restSeconds: 90,
              },
              {
                exerciseName: hasBackPain ? 'Dumbbell Romanian Deadlift' : 'Barbell Romanian Deadlift',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Power Squat Cage & Olympic Platform',
                alternativeExerciseName: 'Single-Leg Dumbbell RDL',
                sets: 3,
                reps: '10 reps',
                restSeconds: 90,
              },
              {
                exerciseName: 'Seated & Standing Calf Raises',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Seated & Standing Calf Raise Station',
                alternativeExerciseName: 'Bodyweight Single-Leg Elevated Calf Burnout',
                sets: 4,
                reps: '15-20 reps',
                restSeconds: 45,
              },
              {
                exerciseName: 'Decline Bench Core Crunch & Leg Raise',
                targetMuscle: 'CORE',
                requiredEquipment: 'Adjustable Decline Sit-Up Bench',
                alternativeExerciseName: 'Floor Hollow Body Rockers',
                sets: 3,
                reps: '15 reps',
                restSeconds: 60,
              },
            ],
          },
          {
            dayNumber: 4, // Thursday
            dayTitle: 'Push B — Shoulders, Upper Chest & Arms',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Incline Dumbbell Bench Press',
                targetMuscle: 'CHEST',
                requiredEquipment: 'Incline Dumbbell Bench Station',
                alternativeExerciseName: 'Floor Dumbbell Neutral Press',
                sets: 4,
                reps: '10 reps',
                restSeconds: 90,
              },
              {
                exerciseName: 'Cable Lateral Deltoid Raise',
                targetMuscle: 'SHOULDERS',
                requiredEquipment: 'Cable Lateral Raise Station',
                alternativeExerciseName: 'Standing Dumbbell Side Lateral Raise',
                sets: 4,
                reps: '12-15 reps',
                restSeconds: 60,
              },
              {
                exerciseName: 'Dual Cable Low-to-High Flyes',
                targetMuscle: 'CHEST',
                requiredEquipment: 'Dual Adjustable Cable Crossover',
                alternativeExerciseName: 'Standard Push-Up to Failure',
                sets: 3,
                reps: '12 reps',
                restSeconds: 60,
              },
              {
                exerciseName: 'Overhead Cable Rope Triceps Extension',
                targetMuscle: 'ARMS',
                requiredEquipment: 'Dual Adjustable Cable Crossover',
                alternativeExerciseName: 'Dumbbell Overhead French Press',
                sets: 3,
                reps: '12 reps',
                restSeconds: 60,
              },
            ],
          },
          {
            dayNumber: 5, // Friday
            dayTitle: 'Pull B — Upper Back & Arm Sculpting',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Close-Grip Neutral Lat Pulldown',
                targetMuscle: 'BACK',
                requiredEquipment: 'Lat Pulldown & Low Row Machine',
                alternativeExerciseName: 'Dumbbell Renagade Rows',
                sets: 4,
                reps: '10-12 reps',
                restSeconds: 90,
              },
              {
                exerciseName: 'T-Bar Supported Wide Row',
                targetMuscle: 'BACK',
                requiredEquipment: 'T-Bar Supported Row Platform',
                alternativeExerciseName: 'Incline Bench Chest-Supported Row',
                sets: 3,
                reps: '10 reps',
                restSeconds: 75,
              },
              {
                exerciseName: 'Cable Standing Biceps Hammer Curl',
                targetMuscle: 'ARMS',
                requiredEquipment: 'Dual Adjustable Cable Crossover',
                alternativeExerciseName: 'Dumbbell Hammer Curls',
                sets: 3,
                reps: '12 reps',
                restSeconds: 60,
              },
              {
                exerciseName: 'Decline Sit-Ups with Twist',
                targetMuscle: 'CORE',
                requiredEquipment: 'Adjustable Decline Sit-Up Bench',
                alternativeExerciseName: 'Side Plank Hip Taps',
                sets: 3,
                reps: '12 per side',
                restSeconds: 45,
              },
            ],
          },
          {
            dayNumber: 6, // Saturday
            dayTitle: 'Legs B & High-Intensity Finisher',
            restDay: false,
            exercises: [
              {
                exerciseName: '45-Degree Leg Press (High Foot Placement)',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Angled Leg Press 45-Degree',
                alternativeExerciseName: 'Dumbbell Goblet Squats',
                sets: 4,
                reps: '12-15 reps',
                restSeconds: 90,
              },
              {
                exerciseName: 'Dumbbell Walking Lunges',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Olympic Flat Bench Press',
                alternativeExerciseName: 'Stationary Split Squat',
                sets: 3,
                reps: '12 steps per leg',
                restSeconds: 60,
              },
              {
                exerciseName: 'Seated Calf Raise Burnout',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Seated & Standing Calf Raise Station',
                alternativeExerciseName: 'Standing Wall Calf Raises',
                sets: 3,
                reps: '20 reps',
                restSeconds: 45,
              },
              {
                exerciseName: 'Studio Cycle HIIT Sprint Finisher',
                targetMuscle: 'CARDIO',
                requiredEquipment: 'Spin Bike Studio Cycle',
                alternativeExerciseName: 'Jumping Jacks & Burpee Flow',
                sets: 5,
                reps: '30s sprint / 30s recovery',
                restSeconds: 30,
              },
            ],
          },
          {
            dayNumber: 7, // Sunday
            dayTitle: 'Sanctuary Rest & Muscle Recovery',
            restDay: true,
            exercises: [],
          },
        ];

      case GoalType.WEIGHT_LOSS:
        return [
          {
            dayNumber: 1, // Monday
            dayTitle: 'Full Body Metabolic Resistance Circuit',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Dumbbell Goblet Squats',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Olympic Flat Bench Press',
                alternativeExerciseName: 'Bodyweight Air Squats',
                sets: 4,
                reps: '15 reps',
                restSeconds: 45,
              },
              {
                exerciseName: 'Incline Dumbbell Chest Press',
                targetMuscle: 'CHEST',
                requiredEquipment: 'Incline Dumbbell Bench Station',
                alternativeExerciseName: 'Push-Ups with Knee Support',
                sets: 3,
                reps: '12-15 reps',
                restSeconds: 45,
              },
              {
                exerciseName: 'Lat Pulldown High-Rep Burn',
                targetMuscle: 'BACK',
                requiredEquipment: 'Lat Pulldown & Low Row Machine',
                alternativeExerciseName: 'Band Rows to Chest',
                sets: 3,
                reps: '15 reps',
                restSeconds: 45,
              },
              {
                exerciseName: 'Pro-Run Incline Interval Hike',
                targetMuscle: 'CARDIO',
                requiredEquipment: 'Commercial Treadmill Pro-Run 5000',
                alternativeExerciseName: 'Brisk Walk on Flat Ground',
                sets: 1,
                reps: '15 mins at 8% incline',
                restSeconds: 60,
              },
            ],
          },
          {
            dayNumber: 2, // Tuesday
            dayTitle: 'Cardio Core & Calorie Annihilation',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Spin Bike Calorie Interval Sprints',
                targetMuscle: 'CARDIO',
                requiredEquipment: 'Spin Bike Studio Cycle',
                alternativeExerciseName: 'High Knees Running in Place',
                sets: 8,
                reps: '20s sprint / 40s cruising',
                restSeconds: 40,
              },
              {
                exerciseName: 'Decline Bench Abdominal Crunches',
                targetMuscle: 'CORE',
                requiredEquipment: 'Adjustable Decline Sit-Up Bench',
                alternativeExerciseName: 'Floor Bicycle Crunches',
                sets: 4,
                reps: '20 reps',
                restSeconds: 45,
              },
              {
                exerciseName: 'Cable Diagonal Core Woodchops',
                targetMuscle: 'CORE',
                requiredEquipment: 'Dual Adjustable Cable Crossover',
                alternativeExerciseName: 'Floor Russian Twists',
                sets: 3,
                reps: '15 per side',
                restSeconds: 45,
              },
            ],
          },
          {
            dayNumber: 3, // Wednesday
            dayTitle: 'Lower Body Sculpt & Conditioning',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Angled Leg Press High Volume',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Angled Leg Press 45-Degree',
                alternativeExerciseName: 'Wall Sit Hold for 60s',
                sets: 4,
                reps: '15-18 reps',
                restSeconds: 60,
              },
              {
                exerciseName: 'Dumbbell Walking Lunges',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Olympic Flat Bench Press',
                alternativeExerciseName: 'Static Lunges in Place',
                sets: 3,
                reps: '12 per leg',
                restSeconds: 60,
              },
              {
                exerciseName: 'Seated Calf Raise Pulses',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Seated & Standing Calf Raise Station',
                alternativeExerciseName: 'Stair Step Calf Raises',
                sets: 3,
                reps: '25 reps',
                restSeconds: 30,
              },
              {
                exerciseName: 'Commercial Treadmill Zone-2 Jog',
                targetMuscle: 'CARDIO',
                requiredEquipment: 'Commercial Treadmill Pro-Run 5000',
                alternativeExerciseName: 'Continuous Step Walking',
                sets: 1,
                reps: '20 mins steady pace',
                restSeconds: 60,
              },
            ],
          },
          {
            dayNumber: 4, // Thursday
            dayTitle: 'Active Recovery & Mobility Flow',
            restDay: true,
            exercises: [],
          },
          {
            dayNumber: 5, // Friday
            dayTitle: 'Upper Body Tone & Posture Restoration',
            restDay: false,
            exercises: [
              {
                exerciseName: 'T-Bar Supported Chest Row',
                targetMuscle: 'BACK',
                requiredEquipment: 'T-Bar Supported Row Platform',
                alternativeExerciseName: 'Dumbbell Rows',
                sets: 3,
                reps: '12-15 reps',
                restSeconds: 60,
              },
              {
                exerciseName: 'Cable Lateral Raise Shaper',
                targetMuscle: 'SHOULDERS',
                requiredEquipment: 'Cable Lateral Raise Station',
                alternativeExerciseName: 'Water Bottle Side Raises',
                sets: 3,
                reps: '15 reps',
                restSeconds: 45,
              },
              {
                exerciseName: 'Cable Triceps Rope Pushdown',
                targetMuscle: 'ARMS',
                requiredEquipment: 'Triceps Rope Pushdown Cable Station',
                alternativeExerciseName: 'Chair Dips',
                sets: 3,
                reps: '15 reps',
                restSeconds: 45,
              },
              {
                exerciseName: 'Studio Cycle Moderate Aerobic Flush',
                targetMuscle: 'CARDIO',
                requiredEquipment: 'Spin Bike Studio Cycle',
                alternativeExerciseName: 'Outdoor Jogging',
                sets: 1,
                reps: '20 mins',
                restSeconds: 60,
              },
            ],
          },
          {
            dayNumber: 6, // Saturday
            dayTitle: 'Weekend Calorie Blitz & Core Circuit',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Dual Cable Standing Chest Crossover',
                targetMuscle: 'CHEST',
                requiredEquipment: 'Dual Adjustable Cable Crossover',
                alternativeExerciseName: 'Floor Push-Ups',
                sets: 3,
                reps: '15 reps',
                restSeconds: 45,
              },
              {
                exerciseName: 'Decline Bench Reverse Crunches',
                targetMuscle: 'CORE',
                requiredEquipment: 'Adjustable Decline Sit-Up Bench',
                alternativeExerciseName: 'Lying Leg Raises',
                sets: 4,
                reps: '15 reps',
                restSeconds: 45,
              },
              {
                exerciseName: 'Pro-Run Incline Fat Burner',
                targetMuscle: 'CARDIO',
                requiredEquipment: 'Commercial Treadmill Pro-Run 5000',
                alternativeExerciseName: 'Power Walking',
                sets: 1,
                reps: '25 mins at 6% incline',
                restSeconds: 60,
              },
            ],
          },
          {
            dayNumber: 7, // Sunday
            dayTitle: 'Complete Rest & Mindful Recovery',
            restDay: true,
            exercises: [],
          },
        ];

      default: // STRENGTH, ENDURANCE, GENERAL_FITNESS
        return [
          {
            dayNumber: 1,
            dayTitle: 'Total Body Functional Strength A',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Olympic Barbell Flat Bench Press',
                targetMuscle: 'CHEST',
                requiredEquipment: 'Olympic Flat Bench Press',
                alternativeExerciseName: 'Floor Dumbbell Press',
                sets: 3,
                reps: '10 reps',
                restSeconds: 90,
              },
              {
                exerciseName: 'Lat Pulldown & Seated Cable Row',
                targetMuscle: 'BACK',
                requiredEquipment: 'Lat Pulldown & Low Row Machine',
                alternativeExerciseName: 'Dumbbell Rows',
                sets: 3,
                reps: '10 reps',
                restSeconds: 75,
              },
              {
                exerciseName: 'Angled Leg Press 45-Degree',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Angled Leg Press 45-Degree',
                alternativeExerciseName: 'Bodyweight Squats',
                sets: 3,
                reps: '12 reps',
                restSeconds: 90,
              },
            ],
          },
          {
            dayNumber: 2,
            dayTitle: 'Aerobic Endurance & Core Power',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Commercial Treadmill Steady State Run',
                targetMuscle: 'CARDIO',
                requiredEquipment: 'Commercial Treadmill Pro-Run 5000',
                alternativeExerciseName: 'Outdoor Jogging',
                sets: 1,
                reps: '25 mins',
                restSeconds: 60,
              },
              {
                exerciseName: 'Decline Sit-Up Bench Crunches',
                targetMuscle: 'CORE',
                requiredEquipment: 'Adjustable Decline Sit-Up Bench',
                alternativeExerciseName: 'Plank Hold for 60s',
                sets: 3,
                reps: '15 reps',
                restSeconds: 45,
              },
            ],
          },
          {
            dayNumber: 3,
            dayTitle: 'Mid-Week Rest & Flexibility',
            restDay: true,
            exercises: [],
          },
          {
            dayNumber: 4,
            dayTitle: 'Total Body Functional Strength B',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Power Cage Squats & Platform Lifts',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Power Squat Cage & Olympic Platform',
                alternativeExerciseName: 'Dumbbell Step-Ups',
                sets: 3,
                reps: '10 reps',
                restSeconds: 90,
              },
              {
                exerciseName: 'Seated Overhead Dumbbell Shoulder Bench',
                targetMuscle: 'SHOULDERS',
                requiredEquipment: 'Seated Overhead Dumbbell Shoulder Bench',
                alternativeExerciseName: 'Pike Push-Ups',
                sets: 3,
                reps: '10 reps',
                restSeconds: 60,
              },
              {
                exerciseName: 'T-Bar Supported Row Platform',
                targetMuscle: 'BACK',
                requiredEquipment: 'T-Bar Supported Row Platform',
                alternativeExerciseName: 'Single-Arm Dumbbell Row',
                sets: 3,
                reps: '10 reps',
                restSeconds: 60,
              },
            ],
          },
          {
            dayNumber: 5,
            dayTitle: 'Cardio Flush & Mobility',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Spin Bike Studio Cycle Interval Ride',
                targetMuscle: 'CARDIO',
                requiredEquipment: 'Spin Bike Studio Cycle',
                alternativeExerciseName: 'Brisk Walking',
                sets: 1,
                reps: '30 mins continuous',
                restSeconds: 60,
              },
            ],
          },
          {
            dayNumber: 6,
            dayTitle: 'Weekend Full-Body Circuit',
            restDay: false,
            exercises: [
              {
                exerciseName: 'Dual Cable Standing Chest Crossover',
                targetMuscle: 'CHEST',
                requiredEquipment: 'Dual Adjustable Cable Crossover',
                alternativeExerciseName: 'Standard Push-Ups',
                sets: 3,
                reps: '12 reps',
                restSeconds: 60,
              },
              {
                exerciseName: 'Seated & Standing Calf Raise Station',
                targetMuscle: 'LEGS',
                requiredEquipment: 'Seated & Standing Calf Raise Station',
                alternativeExerciseName: 'Floor Calf Raises',
                sets: 3,
                reps: '15 reps',
                restSeconds: 45,
              },
            ],
          },
          {
            dayNumber: 7,
            dayTitle: 'Sunday Rest Day',
            restDay: true,
            exercises: [],
          },
        ];
    }
  }

  /**
   * Generates and stores a complete personalized workout plan in MySQL for a member.
   */
  public static async generatePersonalizedPlan(
    memberId: string,
    options: {
      goalType: GoalType;
      experienceLevel?: string;
      daysPerWeek?: number;
      limitations?: string[];
      trainerId?: string;
    }
  ) {
    // 1. Get or find default trainer to link
    let trainerId = options.trainerId;
    if (!trainerId) {
      const firstTrainer = await prisma.trainer.findFirst();
      if (firstTrainer) {
        trainerId = firstTrainer.id;
      } else {
        // Fallback: look for an admin user to act as system coach
        const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (adminUser) {
          const sysTrainer = await prisma.trainer.create({
            data: {
              userId: adminUser.id,
              specialization: 'Head Strength & Conditioning Coach',
              experienceYears: 8,
              isAvailable: true,
            },
          });
          trainerId = sysTrainer.id;
        }
      }
    }

    // 2. Load templates for the requested goal
    const dayTemplates = this.getTemplatesForGoal(options.goalType, options.limitations || []);

    // 3. Check equipment operational status
    const operationalMap = await EquipmentService.getEquipmentOperationalMap();

    // 4. In a transaction, archive older plans and insert the new personalized plan
    return prisma.$transaction(async (tx) => {
      await tx.workoutPlan.updateMany({
        where: { memberId, isActive: true },
        data: { isActive: false },
      });

      const goalLabel = options.goalType.replace(/_/g, ' ');
      const plan = await tx.workoutPlan.create({
        data: {
          memberId,
          trainerId: trainerId!,
          title: `Personalized ${goalLabel} Protocol`,
          description: `Customized 7-day routine tailored for ${goalLabel.toLowerCase()} with real-time equipment optimization and injury mitigation.`,
          startDate: new Date(),
          isActive: true,
        },
      });

      for (const day of dayTemplates) {
        const createdDay = await tx.workoutDay.create({
          data: {
            planId: plan.id,
            dayNumber: day.dayNumber,
            dayTitle: day.dayTitle,
            restDay: day.restDay,
          },
        });

        if (!day.restDay && day.exercises && day.exercises.length > 0) {
          const exerciseData = day.exercises.map((ex, idx) => {
            const isOperational = operationalMap.get(ex.requiredEquipment.toLowerCase().trim()) ?? true;
            return {
              dayId: createdDay.id,
              exerciseName: isOperational ? ex.exerciseName : (ex.alternativeExerciseName || ex.exerciseName),
              targetMuscle: ex.targetMuscle,
              requiredEquipment: ex.requiredEquipment,
              alternativeExerciseName: ex.alternativeExerciseName,
              sets: ex.sets,
              reps: ex.reps,
              restSeconds: ex.restSeconds,
              orderIndex: idx + 1,
            };
          });

          await tx.workoutExercise.createMany({
            data: exerciseData,
          });
        }
      }

      return tx.workoutPlan.findUnique({
        where: { id: plan.id },
        include: {
          days: {
            orderBy: { dayNumber: 'asc' },
            include: {
              exercises: { orderBy: { orderIndex: 'asc' } },
            },
          },
        },
      });
    });
  }

  /**
   * Retrieves today's personalized session for the member based on Asia/Kolkata day-of-week,
   * with live equipment operational verification and alternative substitution annotation.
   */
  public static async getTodayWorkoutForMember(memberId: string) {
    const { isoDayNumber, weekdayStr, kolkataDateStr } = this.getKolkataDayInfo();

    // 1. Fetch member's active plan
    let activePlan = await prisma.workoutPlan.findFirst({
      where: { memberId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        trainer: { include: { user: { select: { fullName: true } } } },
        days: {
          include: {
            exercises: { orderBy: { orderIndex: 'asc' } },
          },
        },
      },
    });

    // If no active plan exists, auto-generate one based on member's goal or default
    if (!activePlan) {
      const goal = await prisma.fitnessGoal.findFirst({
        where: { memberId },
        orderBy: { createdAt: 'desc' },
      });
      const goalType = goal?.goalType || GoalType.MUSCLE_GAIN;
      activePlan = await this.generatePersonalizedPlan(memberId, { goalType });
    }

    if (!activePlan) return null;

    // 2. Find today's day in the plan
    const todayDay = activePlan.days.find((d) => d.dayNumber === isoDayNumber) || activePlan.days[0];

    // 3. Check equipment operational status in real-time
    const operationalMap = await EquipmentService.getEquipmentOperationalMap();

    const verifiedExercises = (todayDay?.exercises || []).map((ex) => {
      const eqName = (ex.requiredEquipment || '').toLowerCase().trim();
      const isOperational = eqName ? (operationalMap.get(eqName) ?? true) : true;
      const isSubstituted = !isOperational && !!ex.alternativeExerciseName;

      return {
        id: ex.id,
        exerciseName: isSubstituted ? ex.alternativeExerciseName! : ex.exerciseName,
        originalExerciseName: ex.exerciseName,
        targetMuscle: ex.targetMuscle,
        requiredEquipment: ex.requiredEquipment,
        alternativeExerciseName: ex.alternativeExerciseName,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds,
        orderIndex: ex.orderIndex,
        isEquipmentOperational: isOperational,
        isSubstituted,
        substitutionNotice: isSubstituted
          ? `Equipment "${ex.requiredEquipment}" is under maintenance. Safely substituted with ${ex.alternativeExerciseName}.`
          : null,
      };
    });

    return {
      planId: activePlan.id,
      planTitle: activePlan.title,
      description: activePlan.description,
      trainerName: activePlan.trainer?.user?.fullName || 'RV Fitness Head Coach',
      today: {
        dayNumber: isoDayNumber,
        weekday: weekdayStr,
        date: kolkataDateStr,
        dayTitle: todayDay ? todayDay.dayTitle : 'Active Rest & Recovery',
        restDay: todayDay ? todayDay.restDay : false,
        totalExercises: verifiedExercises.length,
        exercises: verifiedExercises,
      },
      allDays: activePlan.days.map((d) => ({
        dayNumber: d.dayNumber,
        dayTitle: d.dayTitle,
        restDay: d.restDay,
        exerciseCount: d.exercises.length,
      })),
    };
  }
}
