"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserRole, User } from '@/lib/types';

interface AuthContextType {
  user: (User & { uid: string }) | null;
  loading: boolean;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(User & { uid: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        console.log('🔥 Firebase user authenticated with UID:', firebaseUser.uid);
        console.log('🔥 Firebase user email:', firebaseUser.email);
        
        // Query for the user document by email
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where("email", "==", firebaseUser.email));
        
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming email is unique, so we take the first document
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data() as User;
          
          console.log('📄 User data from Firestore:', userData);
          console.log('🎭 Role found:', userData.role);

          setUser({ 
            ...userData, 
            uid: firebaseUser.uid,
            id: userDoc.id
          });
          setRole(userData.role);
        } else {
          console.log('❌ No user document found in Firestore with email:', firebaseUser.email);
          setUser(null);
          setRole(null);
        }
      } else {
        console.log('👤 No Firebase user authenticated');
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
