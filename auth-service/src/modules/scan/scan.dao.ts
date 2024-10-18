import { Inject } from '@nestjs/common';
import { ScanResponseDto, ScanSaveDto } from './dto/scan.dto';
import { KNEX_CONNECTION } from '../../common/utils/constants';
import { Knex } from 'knex';
import * as knexnest from 'knexnest';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ScanResultDto } from './dto/scan-result.dto';

export class ScanDao {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async save(payload: ScanSaveDto): Promise<string> {
    const scan = instanceToPlain(payload);
    return this.knex
      .withSchema('public')
      .insert(scan, ['id'])
      .into('scans')
      .then((ids) => (ids.length > 0 ? ids[0].id : 0));
  }

  async update(scanId: string, payload: ScanResultDto): Promise<boolean> {
    const transformedPayload = instanceToPlain(payload);
    return this.knex
      .update(transformedPayload)
      .into('scans')
      .where('id', scanId)
      .returning('id')
      .then((id) => id.length > 0)
      .catch((error) => {
        return false;
      });
  }

  async scanById(userId: number, scanId: string): Promise<ScanResponseDto> {
    return knexnest(
      this.knex
        .select([
          's.id as _id',
          's.repository as _repository',
          's.branch as _branch',
          's.sha AS _sha',
          's.status AS _status',
          's.result AS _result',
        ])
        .from('scans as s')
        .where({ user_id: userId, id: scanId }),
    ).then((scans: any[]) => {
      if (scans && scans.length > 0) {
        return plainToInstance(ScanResponseDto, scans.pop());
      }
      return null;
    });
  }

  async scanList(userId: number): Promise<Array<ScanResponseDto>> {
    return knexnest(
      this.knex
        .select([
          's.id as _id',
          's.repository as _repository',
          's.branch as _branch',
          's.sha AS _sha',
          's.status AS _status',
        ])
        .from('scan as s')
        .where({ user_id: userId }),
    ).then((scans: any[]) => {
      if (scans && scans.length > 0) {
        return plainToInstance(ScanResponseDto, scans);
      }
      return [];
    });
  }
}
