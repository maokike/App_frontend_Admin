
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserRole, User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'Usuarios', firebaseUser.uid);
        
        // Use onSnapshot to listen for real-time updates
        const unsubscribeSnapshot = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            
            const activeLocalId = userData.locales_asignados && userData.locales_asignados.length > 0 
                ? userData.locales_asignados[0].localId 
                : null;

            const userWithDetails: User = {
              ...userData,
              uid: firebaseUser.uid,
              id: userDocSnap.id,
              localId: activeLocalId, // Set the active localId
            };
            
            setUser(userWithDetails);
            setRole(userData.rol);
          } else {
              console.log(`User document with UID ${firebaseUser.uid} not found in Firestore.`);
              setUser(null);
              setRole(null);
          }
          setLoading(false);
        });

        // Return the snapshot listener's unsubscribe function
        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
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
