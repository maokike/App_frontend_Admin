import { LoginForm } from "@/components/auth/login-form";
import { DollarSign } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center space-y-2 mb-8">
        <div className="bg-primary text-primary-foreground p-3 rounded-full">
          <DollarSign className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold font-headline">Local Sales Tracker</h1>
        <p className="text-muted-foreground">Sign in to access your dashboard</p>
      </div>
      <LoginForm />
    </main>
  );
}
