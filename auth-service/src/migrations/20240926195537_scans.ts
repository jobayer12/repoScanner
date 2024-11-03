import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTableIfNotExists('scans', (table) => {
    table.uuid('id').defaultTo(knex.fn.uuid()).primary().unique();
    table.string('repository', 255).notNullable();
    table.string('branch', 255).notNullable();
    table.string('status', 30).notNullable();
    table.string('sha', 255).notNullable();
    table
      .bigIncrements('user_id')
      .notNullable()
      .references('id')
      .inTable('users');
    table.jsonb('result').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {}
