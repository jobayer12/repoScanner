import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTableIfNotExists('users', (table) => {
    table.increments('id').primary();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.boolean('is_verified').notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {}
