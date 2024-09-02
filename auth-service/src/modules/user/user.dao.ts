import { instanceToPlain, plainToInstance } from 'class-transformer';
import { DatabaseService } from '../database/database.service';
import { UserCreatePayload } from './dto/user.dto';
import * as knexnest from 'knexnest';

export class UserDao {
  constructor(private readonly database: DatabaseService) {}

  async create(payload: UserCreatePayload): Promise<number> {
    const user = instanceToPlain(payload);
    const knex = await this.database.connection();
    return knex
      .withSchema('public')
      .insert(user, ['id'])
      .into('users')
      .then((ids) => (ids.length > 0 ? ids[0].id : 0));
  }

  async getUserByEmailAddress(email: string): Promise<UserCreatePayload> {
    const knex = await this.database.connection();
    return knexnest(
      knex.select([
        'u.id as _id',
        'u.first_name as _firstName',
        'u.last_name as _lastName',
        'u.email AS _email',
        'u.password AS _password',
      ]),
    )
      .from('users as u')
      .where({ email: email })
      .then((user: unknown) => plainToInstance(UserCreatePayload, user));
  }
}
