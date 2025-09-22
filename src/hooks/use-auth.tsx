
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserRole, User } from '@/lib/types';

interface AuthContextType {
  user: (User & { uid: string; localId?: string }) | null;
  loading: boolean;
  rol: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(User & { uid: string; localId?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'Usuarios', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as User;
          
          let localId: string | undefined = undefined;
          // If user is 'local', find their assigned local
          if (userData.rol === 'local') {
            const localsQuery = query(collection(db, 'locals'), where('userId', '==', firebaseUser.uid));
            const localsSnapshot = await getDocs(localsQuery);
            if (!localsSnapshot.empty) {
              localId = localsSnapshot.docs[0].id;
            }
          }

          const userWithDetails = {
            ...userData,
            uid: firebaseUser.uid,
            id: userDocSnap.id,
            localId: localId,
          };
          
          setUser(userWithDetails);
          setRole(userData.rol);

        } else {
            console.log(`User with UID ${firebaseUser.uid} not found.`);
            setUser(null);
            setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading, role };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
