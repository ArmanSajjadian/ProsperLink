import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Demo credentials for MVP — replace with real DB lookup in production
        if (
          credentials?.email === "demo@prosperlink.com" &&
          credentials?.password === "demo123"
        ) {
          return {
            id: "demo-user-1",
            name: "Alex Johnson",
            email: "demo@prosperlink.com",
            image: null,
          };
        }
        // Accept any email/password for MVP demo
        if (credentials?.email && credentials?.password && credentials.password.length >= 6) {
          return {
            id: `user-${Date.now()}`,
            name: credentials.email.split("@")[0],
            email: credentials.email,
            image: null,
          };
        }
        return null;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
