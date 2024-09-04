import { Body, Controller, Post } from '@nestjs/common';
import { ScanService } from './scan.service';
import { ScanPayloadDto } from './dto/scan.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('')
@ApiTags('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  async scan(@Body() payload: ScanPayloadDto): Promise<string> {
    return this.scanService.scan(payload);
  }
}
