import Router from 'next/router';
import { parseCookies, setCookie } from 'nookies';
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../../services/api";

type SignInCredentials = {
  email: string;
  password: string;
};

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

interface SessionData extends User {
  token: string;
  refreshToken: string;
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User;
}

export const AuthContext = createContext({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode 
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const isAuthenticated = !!user;

  useEffect(() => {
      const { 'nextauth.token': token } = parseCookies();

      if(token) {
        api.get<User>('/me').then(response => {
          const { email, permissions, roles} = response.data;

          setUser({
            email,
            permissions,
            roles,
          });
        }); 
      }
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post<SessionData>('/sessions', {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard')
      
      console.log({ login: response.data })
    } catch (error) {
      console.log(error);
    }
  }
  
  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}