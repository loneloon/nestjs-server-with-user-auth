# NestJS + Prisma template

## Description

[Nest](https://github.com/nestjs/nest)+[Prisma](https://github.com/prisma/prisma) TypeScript starter repository with simple user authentication flow out of the box.

## Project setup

```bash
$ yarn install

$ yarn prisma-migrate
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```
## Auth module

Implemented with User, Secret and Session models. 4 exposed handlers are instantly available to use on '/auth' route:
  - *GET*: get current user, using session cookie (if any) extracted from request
  - *PUT*: sign up. Expected body { username: string, pass: string }
  - *POST*: sign in. Expected body { username: string, pass: string }
  - *DELETE*: sign out, using session cookie (if any) extracted from request

By default data is stored in an sqlite db doc. You're free to reconfigure prisma to use any database that is compatible with Prisma.
