import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-xl font-medium">Page not found</p>
      <p className="text-muted-foreground text-sm">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
    </div>
  );
}
