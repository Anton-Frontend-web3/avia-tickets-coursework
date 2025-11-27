import NextAuth from "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
      role: string;
      id: string;
    }
  }
  
  // 2. Расширяем тип Session
  declare module "next-auth" {
    interface Session {
      user: {
        id: string;
        role: string;
      } & DefaultSession["user"]; // Сохраняем стандартные поля, такие как name, email, image
    }
  
    // 3. Расширяем базовый тип User (который приходит из функции authorize)
    interface User extends DefaultUser {
      role: string;
    }
  }