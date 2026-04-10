"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, requiresOnboarding } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(requiresOnboarding ? "/onboarding" : "/dashboard");
    }
  }, [isAuthenticated, requiresOnboarding, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center pb-2 gap-2">
          <BrandLogo
            alt="Nagarkot Forwarders"
            className="mb-1 h-14 w-auto object-contain"
            priority
            sizes="(max-width: 768px) 280px, 490px"
          />
          <p className="text-sm text-muted-foreground">Sign in with your OS account</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 pt-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@nagarkot.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your OS password"
              />
            </div>
            <Button
              type="submit"
              className="w-full flex items-center gap-2"
              size="lg"
              disabled={submitting || !email || !password}
            >
              <LogIn className="w-4 h-4" />
              {submitting ? "Signing in..." : "Sign in to SuperFreight"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
