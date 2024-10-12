import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Secret, Prisma } from '@prisma/client';

@Injectable()
export class SecretService {
  constructor(private prisma: PrismaService) {}

  async secret(
    secretWhereUniqueInput: Prisma.SecretWhereUniqueInput,
  ): Promise<Secret | null> {
    return this.prisma.secret.findUnique({
      where: secretWhereUniqueInput,
    });
  }

  async secrets(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SecretWhereUniqueInput;
    where?: Prisma.SecretWhereInput;
    orderBy?: Prisma.SecretOrderByWithRelationInput;
  }): Promise<Secret[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.secret.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createSecret(data: Prisma.SecretCreateInput): Promise<Secret> {
    return this.prisma.secret.create({
      data,
    });
  }

  async updateSecret(params: {
    where: Prisma.SecretWhereUniqueInput;
    data: Prisma.SecretUpdateInput;
  }): Promise<Secret> {
    const { where, data } = params;
    return this.prisma.secret.update({
      data,
      where,
    });
  }

  async deleteSecret(where: Prisma.SecretWhereUniqueInput): Promise<Secret> {
    return this.prisma.secret.delete({
      where,
    });
  }
}
