import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SecretService } from '../secret/secret.service';
import { SignUpDto, SignInDto } from './auth.dto';
import { hash, genSalt } from "bcrypt";
import { Secret, User, Prisma, Session } from '@prisma/client';
import { SessionService } from '../session/session.service';
import { isEqual } from "lodash"
import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';


@Injectable()
export class AuthService {
  private async generatePasswordHashAndSalt(
    password: string
  ): Promise<[string, string]> {
    const saltRounds: number = Math.floor(Math.random() * 10);

    const salt: string = await genSalt(saltRounds);
    const passHash: string = await hash(password, salt);

    return [passHash, salt];
  }

  private async checkPasswordAgainstHash(
    password: string,
    hashRecord: string,
    saltRecord: string
  ): Promise<boolean> {
    const trialHash: string = await hash(password, saltRecord);

    return isEqual(trialHash, hashRecord);
  }

  async signUp(userService: UserService, secretService: SecretService, signUpDto: SignUpDto): Promise<User> {
    const existingUser: User | null = await userService.user({username: signUpDto.username});
    if (existingUser){
      throw new Error(`User with the username '${signUpDto.username}' already exists!`);
    }

    const newUser = await userService.createUser({username: signUpDto.username})

    const [passHash, salt] = await this.generatePasswordHashAndSalt(signUpDto.pass);  

    secretService.createSecret({
      externalId: newUser.id,
      passHash: passHash,
      salt: salt
    })
    
    return newUser;
  }

  async signIn(userService: UserService, secretService: SecretService, sessionService: SessionService, signInDto: SignInDto): Promise<Session> {
    const user: User | null = await userService.user({username: signInDto.username});

    if (!user) {
      throw new Error("Wrong credentials!")
    }
    
    const secret: Secret | null = await secretService.secret({externalId: user.id});
    
    if (this.checkPasswordAgainstHash(signInDto.pass, secret.passHash, secret.salt)) {
      const session: Session = await sessionService.createSession({
        id: uuid(),
        user: { connect: {id: user.id} },
        expiresAt: DateTime.now().plus({ hours: 24 }).toJSDate()
      })
      
      return session;
    } else {
      throw new Error("Wrong credentials!");
    }
  }

  async signOut(sessionService: SessionService, cookie: string): Promise<Session | null> {
    const cookieArray = cookie.split("=") ?? [];
    const sessionIdIdx = cookieArray.findIndex((el) => el === "sesh");
    if (sessionIdIdx >= 0) {
        if (cookieArray.length-1 >= sessionIdIdx+1 ){
          const sessionId: string = cookieArray[sessionIdIdx+1];
          return await sessionService.deleteSession({id: sessionId});
        }
    }
    throw new Error("Malformed cookie! Cannot validate user action.");
  }

  async getUser(userService:UserService, sessionService: SessionService, cookie: string): Promise<User | null> {
    const cookieArray = cookie.split("=") ?? [];
    const sessionIdIdx = cookieArray.findIndex((el) => el === "sesh");
    if (sessionIdIdx >= 0) {
        if (cookieArray.length-1 >= sessionIdIdx+1 ){
          const sessionId: string = cookieArray[sessionIdIdx+1];
          const session: Session | null = await sessionService.session({id: sessionId});

          if (session) {
            return await userService.user({id: session.userId});
          }
          return null
        }
    }
    throw new Error("Malformed cookie! Cannot validate user action.");
  }
}
