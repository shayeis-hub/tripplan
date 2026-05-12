"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth";
import { auth } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login:    (emailAddr: string, pw: string) => Promise<void>;
  register: (emailAddr: string, pw: string) => Promise<void>;
  logout:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function doLogin(emailAddr: string, pw: string) {
    await signInWithEmailAndPassword(auth, emailAddr, pw);
  }

  async function doRegister(emailAddr: string, pw: string) {
    await createUserWithEmailAndPassword(auth, emailAddr, pw);
  }

  async function doLogout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login: doLogin, 
      register: doRegister, 
      logout: doLogout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
