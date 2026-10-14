import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
dotenv.config();

beforeAll(async () => {
  // Set test environment flags
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_must_be_at_least_32_characters_long_for_security';
  process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_must_be_at_least_32_characters_long';
});

afterAll(async () => {
  // Global teardown
});
