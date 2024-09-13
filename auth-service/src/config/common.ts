import { registerAs } from '@nestjs/config';

export default registerAs('common', () => ({
  baseDir: __dirname + '/../',
  host: process.env.HOST,
  port: Number(process.env.PORT || 3000),
}));
