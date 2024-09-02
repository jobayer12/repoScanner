import { registerAs } from '@nestjs/config';

export default registerAs('common', () => ({
  baseDir: __dirname + '/../',
}));
