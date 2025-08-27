export type UserRole = 'admin' | 'local';

export type Product = {
  id: string;
  name: string;
  price: number;
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
