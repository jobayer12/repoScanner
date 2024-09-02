import { registerAs } from '@nestjs/config';

export default registerAs('common', () => ({
  jwt: process.env.JWT_DEV_SECRET,
}));
