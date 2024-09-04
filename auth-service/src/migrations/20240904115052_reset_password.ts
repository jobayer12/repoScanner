import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTableIfNotExists('reset_password', (table) => {
    table.increments('id').primary();
    table.bigInteger('user_id').notNullable().references('id').inTable('users');
    table.string('token', 255).notNullable();
    table.boolean('is_used').notNullable().defaultTo(false);
    table.enum('type', ['RESET_PASSWORD', 'VERIFY_ACCOUNT']);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {}
