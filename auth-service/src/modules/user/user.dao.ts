import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserCreatePayload } from './dto/user.dto';
import * as knexnest from 'knexnest';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from '../../common/utils/constants';
import { Inject } from '@nestjs/common/decorators';
import { PasswordResetDto } from './dto/password-reset.dto';

export class UserDao {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async create(payload: UserCreatePayload): Promise<number> {
    const user = instanceToPlain(payload);
    return this.knex
      .withSchema('public')
      .insert(user, ['id'])
      .into('users')
      .then((ids) => (ids.length > 0 ? ids[0].id : 0));
  }

  async resetPassword(
    payload: PasswordResetDto,
  ): Promise<Array<PasswordResetDto>> {
    return knexnest(
      this.knex
        .insert(instanceToPlain(payload))
        .returning([
          'id AS _id',
          'user_id AS _userId',
          'type AS _type',
          'token AS _token',
        ]),
    ).then((response: any) => plainToInstance(PasswordResetDto, response));
  }

  async getUserByEmailAddress(email: string): Promise<UserCreatePayload> {
    return knexnest(
      this.knex
        .select([
          'u.id as _id',
          'u.first_name as _firstName',
          'u.last_name as _lastName',
          'u.email AS _email',
          'u.password AS _password',
        ])
        .from('users as u')
        .where({ email: email }),
    ).then((user: unknown) => plainToInstance(UserCreatePayload, user));
  }
}
