import bcrypt from "bcryptjs";
import NextAuth, { NextAuthOptions } from "next-auth"; // <-- 1. Импортируем NextAuthOptions
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from 'pg';

// Ваш интерфейс User остается без изменений
interface User {
    id: string;
    email: string;
    role: string;
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req): Promise<User | null> {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const result = await pool.query(
                        'SELECT * FROM users WHERE email = $1', // <-- Рекомендуется использовать нижний регистр для имен таблиц в SQL
                        [credentials.email]
                    );

                    const user = result.rows[0];

                    if (!user) {
                        return null;
                    }
                    const passwordsMatch = await bcrypt.compare(
                        credentials.password,
                        user.password_hash
                    )
                    
                    if (!passwordsMatch) {
                        return null;
                    }

                    
                    return {
                        id: user.user_id.toString(),
                        email: user.email,
                        role: user.role,
                    };

                } catch (error) {
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt", 
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role; 
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login', 
    },
    secret: process.env.AUTH_SECRET, 
};


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };