import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend directory or root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  DATABASE_URL: z.string().default('mysql://root:@localhost:3306/rvfitness_dev?connection_limit=10'),
  DATABASE_URL_TEST: z.string().optional(),

  JWT_SECRET: z.string().min(16).default('rv_fitness_super_secret_jwt_access_key_development_only_1234567890'),
  JWT_REFRESH_SECRET: z.string().min(16).default('rv_fitness_super_secret_jwt_refresh_key_development_only_0987654321'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  ADMIN_EMAIL: z.string().email().default('admin@rvfitness.com'),
  ADMIN_PASSWORD: z.string().default('change_this_immediately'),
  ADMIN_NAME: z.string().default('RV Fitness Admin'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  DEFAULT_TAX_RATE_BPS: z.coerce.number().default(1800),
  INVOICE_PREFIX: z.string().default('INV'),
  PAYMENT_PREFIX: z.string().default('PAY'),
  RECEIPT_PREFIX: z.string().default('RCT'),
  CURRENCY_CODE: z.string().default('INR'),

  GYM_NAME: z.string().default('RV Fitness'),
  GYM_ADDRESS: z.string().default('Narsobawadi, Maharashtra, India'),
  GYM_PHONE: z.string().default('+91-XXXXXXXXXX'),
  GYM_EMAIL: z.string().default('info@rvfitness.com'),
  GYM_GSTIN: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
export type EnvConfig = z.infer<typeof envSchema>;
