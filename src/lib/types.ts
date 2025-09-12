export type UserRole = 'admin' | 'local';

export type User = {
  id: string;
  name: string;
  role: UserRole;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

export type PaymentMethod = 'cash' | 'card';

export type Sale = {
  id: string;
  productId: string;
  quantity: number;
  total: number;
  paymentMethod: PaymentMethod;
  date: Date;
};

export type Local = {
    id: string;
    name: string;
    address: string;
    phone?: string;
    userId: string;
};
