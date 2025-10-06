import { Timestamp } from "firebase/firestore";

export type UserRole = 'admin' | 'local';

export interface LocalAssignment {
  localId: string;
  name: string;
}

export type User = {
  id?: string;
  uid?: string;
  name: string;
  rol: UserRole;
  email: string;
  locales_asignados?: LocalAssignment[];
  // Legacy field, can be phased out. For now, represents the active local.
  localId?: string | null; 
};

export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  stock?: number;
};

export type PaymentMethod = 'cash' | 'card';

export interface SaleProduct {
  productId: string;
  productName: string;
  quantity: number;
}

export type Sale = {
  id: string;
  saleId: string;
  products: SaleProduct[];
  total: number;
  paymentMethod: PaymentMethod;
  date: Timestamp | Date;
  localId?: string;
  paymentProofUrl?: string; // Optional URL for the payment proof image
};


export type Local = {
    id: string;
    name: string;
    address: string;
    phone?: string;
    userId: string;
};
