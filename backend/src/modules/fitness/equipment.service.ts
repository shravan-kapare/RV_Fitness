import { prisma } from '../../config/database';
import { EquipmentStatus } from '@prisma/client';

export interface EquipmentRecord {
  id: string;
  name: string;
  category: string;
  targetMuscle: string;
  status: EquipmentStatus;
  notes?: string | null;
}

export class EquipmentService {
  private static defaultStations = [
    { name: 'Olympic Flat Bench Press', category: 'STRENGTH', targetMuscle: 'CHEST', status: EquipmentStatus.OPERATIONAL, notes: 'Full competition bar & plates' },
    { name: 'Incline Dumbbell Bench Station', category: 'FREE_WEIGHTS', targetMuscle: 'CHEST', status: EquipmentStatus.OPERATIONAL, notes: 'Adjustable angle 0-75 degrees' },
    { name: 'Dual Adjustable Cable Crossover', category: 'CABLES', targetMuscle: 'CHEST', status: EquipmentStatus.OPERATIONAL, notes: 'Dual pin-select weight stacks' },
    { name: 'Lat Pulldown & Low Row Machine', category: 'CABLES', targetMuscle: 'BACK', status: EquipmentStatus.OPERATIONAL, notes: 'Ergonomic multi-grip attachments' },
    { name: 'T-Bar Supported Row Platform', category: 'STRENGTH', targetMuscle: 'BACK', status: EquipmentStatus.OPERATIONAL, notes: 'Chest-supported plate loaded' },
    { name: 'Power Squat Cage & Olympic Platform', category: 'STRENGTH', targetMuscle: 'LEGS', status: EquipmentStatus.OPERATIONAL, notes: 'Safety spotter arms included' },
    { name: 'Angled Leg Press 45-Degree', category: 'STRENGTH', targetMuscle: 'LEGS', status: EquipmentStatus.OPERATIONAL, notes: 'Heavy duty 450kg capacity' },
    { name: 'Seated & Standing Calf Raise Station', category: 'STRENGTH', targetMuscle: 'LEGS', status: EquipmentStatus.OPERATIONAL, notes: 'Dual soleus & gastrocnemius' },
    { name: 'Seated Overhead Dumbbell Shoulder Bench', category: 'FREE_WEIGHTS', targetMuscle: 'SHOULDERS', status: EquipmentStatus.OPERATIONAL, notes: 'Upright 85-degree back support' },
    { name: 'Cable Lateral Raise Station', category: 'CABLES', targetMuscle: 'SHOULDERS', status: EquipmentStatus.OPERATIONAL, notes: 'Single handle cuff cables' },
    { name: 'EZ-Bar Preacher Biceps Bench', category: 'FREE_WEIGHTS', targetMuscle: 'ARMS', status: EquipmentStatus.OPERATIONAL, notes: 'Arm isolating bench' },
    { name: 'Triceps Rope Pushdown Cable Station', category: 'CABLES', targetMuscle: 'ARMS', status: EquipmentStatus.OPERATIONAL, notes: 'High pulley cable' },
    { name: 'Pec Deck / Rear Delt Fly Machine', category: 'STRENGTH', targetMuscle: 'CHEST', status: EquipmentStatus.MAINTENANCE, notes: 'Scheduled cable bearing replacement' },
    { name: 'Commercial Treadmill Pro-Run 5000', category: 'CARDIO', targetMuscle: 'CARDIO', status: EquipmentStatus.OPERATIONAL, notes: 'Shock absorption belt' },
    { name: 'Spin Bike Studio Cycle', category: 'CARDIO', targetMuscle: 'CARDIO', status: EquipmentStatus.OPERATIONAL, notes: 'Magnetic flywheel resistance' },
    { name: 'Adjustable Decline Sit-Up Bench', category: 'CORE', targetMuscle: 'CORE', status: EquipmentStatus.OPERATIONAL, notes: 'Contoured leg pads' },
  ];

  public static async ensureSeedEquipment(): Promise<void> {
    const count = await prisma.equipment.count();
    if (count === 0) {
      for (const item of this.defaultStations) {
        await prisma.equipment.create({
          data: item,
        });
      }
    }
  }

  public static async listEquipment(category?: string, targetMuscle?: string) {
    await this.ensureSeedEquipment();
    const where: any = {};
    if (category) where.category = category;
    if (targetMuscle) where.targetMuscle = targetMuscle;
    return prisma.equipment.findMany({
      where,
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });
  }

  public static async updateEquipmentStatus(id: string, status: EquipmentStatus, notes?: string) {
    return prisma.equipment.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
    });
  }

  public static async getEquipmentOperationalMap(): Promise<Map<string, boolean>> {
    await this.ensureSeedEquipment();
    const all = await prisma.equipment.findMany();
    const map = new Map<string, boolean>();
    for (const eq of all) {
      map.set(eq.name.toLowerCase().trim(), eq.status === EquipmentStatus.OPERATIONAL);
    }
    return map;
  }
}
