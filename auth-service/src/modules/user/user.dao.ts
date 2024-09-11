import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserCreatePayload, UserDto } from './dto/user.dto';
import * as knexnest from 'knexnest';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from '../../common/utils/constants';
import { Inject } from '@nestjs/common/decorators';
import { PasswordResetDto } from './dto/password-reset.dto';
import { PasswordResetTypeEnum } from '../../common/enum/password-reset-type.enum';

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

  async updateUserAccount(id: number, payload: UserDto): Promise<boolean> {
    const transformedPayload = instanceToPlain(payload);
    return this.knex
      .update(transformedPayload)
      .into('users')
      .where('id', id)
      .returning('id')
      .then((id) => id.length > 0)
      .catch((error) => {
        return false;
      });
  }

  async resetPasswordDetails(
    verificationId: string,
    type: PasswordResetTypeEnum,
  ): Promise<PasswordResetDto> {
    return this.knex
      .select([
        'id AS id',
        'user_id AS userId',
        'type AS type',
        'token AS token',
        'is_used AS isUsed',
      ])
      .into('reset_password')
      .where({
        token: verificationId,
        type: type,
      })
      .then((response) =>
        response?.length > 0
          ? plainToInstance(PasswordResetDto, response.pop())
          : null,
      )
      .catch((error) => null);
  }

  async updateResetPasswordDetails(
    id: number,
    isUsed: boolean,
  ): Promise<boolean> {
    return this.knex
      .update('is_used', isUsed)
      .into('reset_password')
      .where('id', id)
      .returning('*')
      .then((response) => response?.length > 0)
      .catch((error) => false);
  }

  async resetPassword(
    payload: PasswordResetDto,
  ): Promise<Array<PasswordResetDto>> {
    const transaction = this.knex.transaction(async (trx: Knex.Transaction) => {
      return trx
        .update({ is_used: true })
        .into('reset_password')
        .where({ user_id: payload.userId, is_used: false, type: payload.type })
        .returning('id')
        .then((ids) => {
          return trx
            .insert(instanceToPlain(payload))
            .into('reset_password')
            .returning([
              'id AS _id',
              'user_id AS _userId',
              'type AS _type',
              'token AS _token',
              'is_used AS _isUsed',
            ]);
        })
        .then(trx.commit)
        .catch(trx.rollback);
    });
    return knexnest(transaction).then((response: any) =>
      plainToInstance(PasswordResetDto, response),
    );
  }

  async getUserByEmailAddress(email: string): Promise<UserDto> {
    return knexnest(
      this.knex
        .select([
          'u.id as _id',
          'u.first_name as _firstName',
          'u.last_name as _lastName',
          'u.email AS _email',
          'u.password AS _password',
          'u.is_verified AS _isVerified',
        ])
        .from('users as u')
        .where({ email: email }),
    ).then((user: any[]) => {
      if (user && user.length > 0) {
        return plainToInstance(UserDto, user.pop());
      }
      return null;
    });
  }
}
