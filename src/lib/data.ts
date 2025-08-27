import type { Product, Sale } from './types';

export const products: Product[] = [
  { id: 'prod_1', name: 'Artisan Bread', price: 5.50 },
  { id: 'prod_2', name: 'Croissant', price: 3.25 },
  { id: 'prod_3', name: 'Coffee', price: 4.00 },
  { id: 'prod_4', name: 'Pain au Chocolat', price: 3.75 },
  { id: 'prod_5', name: 'Macaron Box (6)', price: 12.00 },
  { id: 'prod_6', name: 'Iced Latte', price: 4.50 },
];

export const sales: Sale[] = Array.from({ length: 12 }, (_, i) => {
  const product = products[Math.floor(Math.random() * products.length)];
  const quantity = Math.floor(Math.random() * 5) + 1;
  const month = i + 1;
  return {
    id: `sale_${i}`,
    productId: product.id,
    quantity,
    total: product.price * quantity,
    paymentMethod: Math.random() > 0.5 ? 'card' : 'cash',
    date: new Date(2024, month - 1, Math.floor(Math.random() * 28) + 1),
  };
}).sort((a, b) => a.date.getTime() - b.date.getTime());

export const monthlySales = sales.reduce((acc, sale) => {
  const month = sale.date.toLocaleString('default', { month: 'short' });
  const existing = acc.find(d => d.month === month);
  if (existing) {
    existing.total += sale.total;
  } else {
    acc.push({ month, total: sale.total });
  }
  return acc;
}, [] as { month: string; total: number }[]);
