import { ScanModule } from '../modules/scan/scan.module';
import { UserModule } from '../modules/user/user.module';

export default [
  {
    path: '/api/v1',
    children: [
      // {
      //   path: 'user',
      //   module: UserModule,
      // },
      {
        path: 'scan',
        module: ScanModule,
      },
    ],
  },
];
