import { prisma } from '../../../config/database';
import { AuditService } from '../audit/audit.service';

export const DEFAULT_SETTINGS: Record<string, { value: string; description: string }> = {
  gym_name: { value: 'RV Fitness', description: 'Gym legal or trading name' },
  gym_address: { value: 'Narsobawadi, Maharashtra, India', description: 'Gym physical address' },
  gym_phone: { value: '+91 98765 43210', description: 'Gym contact phone number' },
  gym_email: { value: 'info@rvfitness.com', description: 'Gym official billing email' },
  gym_gstin: { value: '27AAAAA0000A1Z5', description: 'Goods & Services Tax Identification Number' },
  default_tax_rate_bps: { value: '1800', description: 'Default tax rate in basis points (1800 = 18%)' },
  invoice_prefix: { value: 'INV', description: 'Invoice number prefix' },
  payment_prefix: { value: 'PAY', description: 'Payment record number prefix' },
  receipt_prefix: { value: 'RCT', description: 'Receipt number prefix' },
  currency_code: { value: 'INR', description: 'Primary currency code' },
  overdue_days_warning: { value: '7', description: 'Days overdue before warning notification' },
  overdue_days_critical: { value: '30', description: 'Days overdue before suspension' },
};

export class SettingsService {
  public static async initializeDefaults(): Promise<void> {
    for (const [key, item] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = await prisma.gymSetting.findUnique({ where: { key } });
      if (!existing) {
        await prisma.gymSetting.create({
          data: {
            key,
            value: item.value,
            description: item.description,
          },
        });
      }
    }
  }

  public static async getAll(): Promise<Record<string, string>> {
    const settings = await prisma.gymSetting.findMany();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    // Fill in defaults if not found
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      if (!(k in result)) {
        result[k] = v.value;
      }
    }
    return result;
  }

  public static async get(key: string): Promise<string> {
    const setting = await prisma.gymSetting.findUnique({ where: { key } });
    if (setting) return setting.value;
    return DEFAULT_SETTINGS[key]?.value || '';
  }

  public static async update(
    settings: Record<string, string>,
    userId: string
  ): Promise<Record<string, string>> {
    const oldValues = await this.getAll();

    for (const [key, value] of Object.entries(settings)) {
      await prisma.gymSetting.upsert({
        where: { key },
        update: { value: String(value), updatedBy: userId },
        create: {
          key,
          value: String(value),
          description: DEFAULT_SETTINGS[key]?.description || '',
          updatedBy: userId,
        },
      });
    }

    const newValues = await this.getAll();

    await AuditService.log({
      userId,
      action: 'SETTINGS_UPDATED',
      entityType: 'GymSetting',
      entityId: userId,
      oldValues,
      newValues,
    });

    return newValues;
  }
}
