import { SalesForm } from "./sales-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function LocalDashboard() {
  return (
    <div className="grid gap-8">
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
