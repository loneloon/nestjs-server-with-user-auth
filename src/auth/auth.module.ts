import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { SecretModule } from '../secret/secret.module';
import { SessionModule } from '../session/session.module';

@Module({
    imports: [UserModule, SecretModule, SessionModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
