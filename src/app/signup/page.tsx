import { SignupForm } from "@/components/auth/signup-form";
import { DollarSign } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center space-y-2 mb-8">
        <div className="bg-primary text-primary-foreground p-3 rounded-full">
          <DollarSign className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold font-headline">Create an Account</h1>
        <p className="text-muted-foreground">Enter your details to get started.</p>
      </div>
      <SignupForm />
        <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/" className="font-semibold text-primary hover:underline">
            Login
            </Link>
        </p>
    </main>
  );
}
