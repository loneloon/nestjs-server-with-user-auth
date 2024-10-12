import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
    Res,
    HttpStatus,
    Req,
  } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Session, User } from '@prisma/client';
import { SecretService } from '../secret/secret.service';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { SessionService } from '../session/session.service';
import { SignUpDto, SignInDto } from './auth.dto';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly secretService: SecretService,
        private readonly sessionService: SessionService
    ){}

    @Put()
    async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
        try {
            const result: User = await this.authService.signUp(this.userService, this.secretService, signUpDto);
            return res.status(HttpStatus.CREATED).json(result);
        } catch (err: any) {
            res.status(HttpStatus.BAD_REQUEST).json({message: err.message})
            return;
        }
    }

    @Post()
    async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
        try {
            const session = await this.authService.signIn(this.userService, this.secretService, this.sessionService, signInDto)
            res.status(HttpStatus.OK).cookie("sesh", session.id, { expires: session.expiresAt}).send();
            return;
        } catch (err: any) {
            res.status(HttpStatus.FORBIDDEN).json({message: err.message});
            return;
        }
    }

    @Delete()
    async signOut(@Req() req: Request, @Res() res: Response) {
        const cookie: string | undefined | null = req.headers.cookie;

        if (cookie) {
            try {
                const session: Session | null = await this.authService.signOut(this.sessionService, cookie);
                if (session) {
                    res.status(HttpStatus.OK).clearCookie("sesh").send();
                    return;
                }    
            } catch (err: any) {
                res.status(HttpStatus.BAD_REQUEST).json({message: err.message});
                return;
            }
        } 

        res.status(HttpStatus.OK).send();
        return;
    }

    @Get()
    async getCurrentUser(@Req() req: Request, @Res() res: Response) {
        const cookie: string | undefined | null = req.headers.cookie;

        if (cookie) {
            try {
                const user: User | null = await this.authService.getUser(this.userService, this.sessionService, cookie);
                if (user) {
                    res.status(HttpStatus.OK).json({user});
                    return;
                }    
            } catch (err: any) {
                res.status(HttpStatus.BAD_REQUEST).json({message: err.message});
                return;
            }
        } 

        res.status(HttpStatus.NOT_FOUND).json({ user: null });
        return;
    }
}
