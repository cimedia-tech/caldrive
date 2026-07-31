import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    error?: string
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "caldrive_secret_key_9a8b7c6d5e4f3a2b1c",
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_client_secret",
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.readonly",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token as string,
          refreshToken: account.refresh_token as string,
          expiresAt: ((account.expires_at as number) ?? 0) * 1000,
        }
      }

      const expiresAt = (token as Record<string, unknown>).expiresAt as number | undefined
      if (expiresAt && Date.now() < expiresAt) {
        return token
      }

      try {
        const refreshToken = (token as Record<string, unknown>).refreshToken as string | undefined
        const response = await fetch("https://oauth2.googleapis.com/token", {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID ?? "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            grant_type: "refresh_token",
            refresh_token: refreshToken ?? "",
          }),
          method: "POST",
        })

        const tokens = await response.json()

        if (!response.ok) throw tokens

        return {
          ...token,
          accessToken: tokens.access_token as string,
          expiresAt: Date.now() + (tokens.expires_in as number) * 1000,
          refreshToken: (tokens.refresh_token as string) ?? refreshToken,
        }
      } catch (error) {
        console.error("Error refreshing access token", error)
        return { ...token, error: "RefreshTokenError" }
      }
    },
    async session({ session, token }) {
      session.accessToken = (token as Record<string, unknown>).accessToken as string | undefined
      session.error = (token as Record<string, unknown>).error as string | undefined
      return session
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)
