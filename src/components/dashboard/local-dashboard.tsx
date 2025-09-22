import { SalesForm } from "./sales-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function LocalDashboard() {
  const { user, role } = useAuth();

  const isLocalUserWithoutStore = role === 'local' && !user?.localId;

  return (
    <div className="grid gap-8">
      {isLocalUserWithoutStore && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Sin local asignado</AlertTitle>
            <AlertDescription>
                No tienes un local asignado. Por favor, contacta a un administrador para que te asigne a uno y puedas empezar a registrar ventas.
            </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Quick Sale</CardTitle>
          <CardDescription>Record a new sale quickly and efficiently.</CardDescription>
        </CardHeader>
        <CardContent>
          <SalesForm />
        </CardContent>
      </Card>
    </div>
  );
}
