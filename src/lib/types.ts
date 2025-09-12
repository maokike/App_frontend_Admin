import { Timestamp } from "firebase/firestore";

export type UserRole = 'admin' | 'local';

export type User = {
  id?: string;
  uid?: string;
  name: string;
  role: UserRole;
  email: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  stock?: number;
};

export type PaymentMethod = 'cash' | 'card';

export type Sale = {
  id: string;
  productId: string;
  quantity: number;
  total: number;
  paymentMethod: PaymentMethod;
  date: Timestamp | Date;
  localId?: string;
};

export type Local = {
    id: string;
    name: string;
    address: string;
    phone?: string;
    userId: string;
};
