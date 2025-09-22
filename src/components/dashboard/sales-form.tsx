
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Landmark, PlusCircle, Trash2 } from "lucide-react";
import { collection, getDocs, addDoc, Timestamp, writeBatch, doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

const saleItemSchema = z.object({
  productId: z.string().min(1, "Please select a product."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
});

const formSchema = z.object({
  products: z.array(saleItemSchema).min(1, "Please add at least one product."),
  paymentMethod: z.enum(["cash", "card"], { required_error: "Please select a payment method." }),
});

export function SalesForm() {
  const [total, setTotal] = useState(0);
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();


  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, "products");
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productList);
    };
    fetchProducts();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: [{ productId: "", quantity: 1 }],
      paymentMethod: "card",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      const saleProducts = value.products || [];
      let currentTotal = 0;
      for (const saleProduct of saleProducts) {
        if (saleProduct.productId && saleProduct.quantity > 0) {
          const product = products.find(p => p.id === saleProduct.productId);
          if (product) {
            currentTotal += product.price * saleProduct.quantity;
          }
        }
      }
      setTotal(currentTotal);
    });
    return () => subscription.unsubscribe();
  }, [form, products]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to record a sale.", variant: "destructive" });
        return;
    }

    try {
        await runTransaction(db, async (transaction) => {
            const salesCollectionRef = collection(db, "sales");
            let totalItems = 0;

            for (const item of values.products) {
                totalItems += item.quantity;
                const productRef = doc(db, "products", item.productId);
                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists()) {
                    throw new Error(`Product ${item.productId} not found!`);
                }

                const newStock = (productDoc.data().stock || 0) - item.quantity;
                if (newStock < 0) {
                    throw new Error(`Not enough stock for ${productDoc.data().name}.`);
                }
                
                transaction.update(productRef, { stock: newStock });

                const productData = products.find(p => p.id === item.productId);

                // Add sale document
                const saleDocRef = doc(salesCollectionRef);
                transaction.set(saleDocRef, {
                    productId: item.productId,
                    quantity: item.quantity,
                    total: (productData?.price || 0) * item.quantity,
                    paymentMethod: values.paymentMethod,
                    date: Timestamp.now(),
                    localId: (user as any).localId,
                });
            }
        });

        toast({
            title: "Sale Recorded!",
            description: `Successfully recorded sale.`,
        });
        form.reset({
            products: [{ productId: "", quantity: 1 }],
            paymentMethod: "card",
        });
        setTotal(0);

    } catch (error: any) {
        toast({
            title: "Error Recording Sale",
            description: error.message,
            variant: "destructive",
        });
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div className="space-y-4">
            <FormLabel className="text-base font-bold">Products</FormLabel>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_auto_auto] items-end gap-2 p-4 border rounded-lg bg-muted/30">
                <FormField
                  control={form.control}
                  name={`products.${index}.productId`}
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name={`products.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" {...field} min={1} className="w-20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
             <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: "", quantity: 1 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="card" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" /> Card
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="cash" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-muted-foreground" /> Cash
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex flex-col gap-4">
            <div className="bg-muted rounded-lg p-6 flex flex-col items-center justify-center space-y-2">
                <h3 className="text-lg font-medium text-muted-foreground">Total Amount</h3>
                <p className="text-5xl font-bold font-headline text-primary">
                    ${total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </p>
            </div>
            <Button type="submit" size="lg" className="w-full">
                <PlusCircle className="mr-2 h-5 w-5" />
                Record Sale
            </Button>
        </div>

      </form>
    </Form>
  );
}
