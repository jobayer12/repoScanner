import type { Knex } from 'knex';
import * as bcrypt from 'bcryptjs';

export const payload: Record<string, string | boolean> = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  password: bcrypt.hashSync('v0N6OI8'),
  is_verified: true,
};

export async function up(knex: Knex): Promise<void> {
  return knex.insert(payload).into('users');
}

export async function down(knex: Knex): Promise<void> {}
