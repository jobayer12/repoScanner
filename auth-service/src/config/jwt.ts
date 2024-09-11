import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret:
    process.env.NODE_ENV === 'prod'
      ? process.env.JWT_PROD_SECRET
      : process.env.JWT_DEV_SECRET,
}));
