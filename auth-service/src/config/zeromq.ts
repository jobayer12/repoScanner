import { registerAs } from '@nestjs/config';

export default registerAs('zeromq', () => ({
  scanServicePubURL: process.env.ZEROMQ_SCAN_SERVICE_PUB_URL,
  scanServiceSubURL: process.env.ZEROMQ_SCAN_SERVICE_SUB_URL,
  emailServicePubURL: process.env.ZEROMQ_EMAIL_SERVICE_PUB_URL,
}));
