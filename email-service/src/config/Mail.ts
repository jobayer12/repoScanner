import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: +process.env.MAIL_PORT || 587,
  user: process.env.MAIL_USERNAME,
  pass: process.env.MAIL_PASSWORD,
  default: {
    from: process.env.MAIL_DEFAULT_FROM,
  },
}));
