import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, EventsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
