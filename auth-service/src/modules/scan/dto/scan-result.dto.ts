import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class ScanResultDto {
  @IsString()
  @Expose({ toPlainOnly: true, name: 'scan_id' })
  scanId: string;

  @Expose({ toPlainOnly: true, name: 'result' })
  result: any;

  @Expose({ name: 'status', toPlainOnly: true })
  status: 'SCAN_FAILED' | 'SCAN_DONE';
}
