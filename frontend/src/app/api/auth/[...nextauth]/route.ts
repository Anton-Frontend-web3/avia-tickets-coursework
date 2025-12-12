import bcrypt from 'bcryptjs'
import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { pool } from '@/lib/db'

// Расширяем стандартный тип User
interface User extends NextAuthUser {
  id: string
  email: string
  role: string
}

// Простой кэш в памяти, чтобы не долбить базу каждую секунду
// Хранит: userId -> { role, timestamp }
const userCache = new Map<string, { role: string; timestamp: number }>()
const CACHE_TTL = 1 * 1000 // 5 минут

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [credentials.email]
          )

          const user = result.rows[0]

          // Защита от перебора (Brute Force): небольшая задержка
          if (!user) {
            await new Promise(resolve => setTimeout(resolve, 500)) 
            return null
          }

          const passwordsMatch = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!passwordsMatch) {
            await new Promise(resolve => setTimeout(resolve, 500))
            return null
          }

          return {
            id: user.user_id.toString(),
            email: user.email,
            role: user.role
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      // 1. Первый вход
      if (user) {
        token.id = user.id
        token.role = user.role
        // Сохраняем в кэш
        userCache.set(token.id as string, { role: user.role as string, timestamp: Date.now() })
        return token
      }

      // 2. Проверка при навигации
      if (token?.id) {
        const userId = token.id as string

        // А. Проверяем кэш
        const cacheEntry = userCache.get(userId)
        if (cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_TTL)) {
            // Если данные в кэше свежие - используем их и НЕ ходим в БД
            token.role = cacheEntry.role
            return token
        }

        // Б. Если кэша нет или он протух - идем в БД
        try {
          const dbUserRes = await pool.query(
            'SELECT user_id, role FROM users WHERE user_id = $1', 
            [userId]
          )

          // Если юзера удалили (Зомби-сессия)
          if (dbUserRes.rowCount === 0) {
            // Возвращаем пустой объект (валидный для типов, но убьет сессию дальше)
            return {} as any
          }

          // Обновляем данные
          const newRole = dbUserRes.rows[0].role
          token.role = newRole
          
          // Обновляем кэш
          userCache.set(userId, { role: newRole, timestamp: Date.now() })

        } catch (error) {
          console.error("JWT check error:", error)
          // Если БД лежит, лучше вернуть старый токен (пусть работает пока может),
          // чем выкидывать пользователя.
          return token 
        }
      }

      return token
    },

    async session({ session, token }) {
      // Если токен пустой (мы вернули {} из jwt), значит сессия мертва
      if (!token || Object.keys(token).length === 0) {
        return null as any // Тут null разрешен, это сигнал для signOut
      }

      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    // error: '/auth/error' // Можно добавить страницу ошибок
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }