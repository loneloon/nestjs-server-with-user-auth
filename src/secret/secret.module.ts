import { Module } from '@nestjs/common';
import { SecretService } from './secret.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [SecretService],
    exports: [SecretService]
})
export class SecretModule {}
