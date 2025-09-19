"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
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
        console.log('📧 User email:', firebaseUser.email);
        
        // 1. Try to fetch user by UID first
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log('✅ User found by UID:', userData);
          console.log('🎭 Role found:', userData.rol);

          const userWithUid = {
            ...userData,
            uid: firebaseUser.uid,
            id: userDocSnap.id
          } as User & { uid: string };
          
          setUser(userWithUid);
          setRole(userData.rol);
        } else {
          // 2. Fallback: Search by email
          console.log(`🟡 User with UID ${firebaseUser.uid} not found. Searching by email...`);
          
          if (firebaseUser.email) {
            const usersQuery = query(
              collection(db, 'users'), 
              where('email', '==', firebaseUser.email)
            );
            const querySnapshot = await getDocs(usersQuery);
            
            if (!querySnapshot.empty) {
              const userDocFromEmail = querySnapshot.docs[0];
              const userData = userDocFromEmail.data();
              console.log('✅ User found by email:', userData);
              console.log('🎭 Role found:', userData.rol);

              const userWithUid = {
                ...userData,
                uid: firebaseUser.uid,
                id: userDocFromEmail.id
              } as User & { uid: string };
              
              setUser(userWithUid);
              setRole(userData.rol);
            } else {
              console.log('❌ No user document found by UID or email');
              
              // 🔍 DEBUG: MOSTRAR TODOS LOS USUARIOS EN FIRESTORE
              console.log('Todos los documentos en colección "users":');
              try {
                const allUsersQuery = query(collection(db, 'users'));
                const allUsersSnapshot = await getDocs(allUsersQuery);
                allUsersSnapshot.forEach((doc) => {
                  console.log('Document ID:', doc.id, 'Data:', doc.data());
                });
              } catch (error) {
                console.error('Error fetching all users:', error);
              }
              
              setUser(null);
              setRole(null);
            }
          } else {
            console.log('❌ User has no email address');
            setUser(null);
            setRole(null);
          }
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