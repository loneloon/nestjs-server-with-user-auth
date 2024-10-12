import { Prisma } from "@prisma/client";


export type SignUpDto = Omit<Prisma.UserCreateInput, "id" | "createdAt" | "updatedAt"> & { pass: string };

export type SignInDto = {
    username: string;
    pass: string;
};
