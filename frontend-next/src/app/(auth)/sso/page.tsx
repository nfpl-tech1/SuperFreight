"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

function SsoInner() {
  const { ssoLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAttemptedLogin = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      toast.error("Missing SSO token.");
      router.replace("/login");
      return;
    }

    if (hasAttemptedLogin.current) {
      return;
    }

    hasAttemptedLogin.current = true;

    void ssoLogin(token)
      .then(() => {
        router.replace("/");
      })
      .catch((error) => {
        toast.error(getErrorMessage(error, "SSO login failed."));
        router.replace("/login");
      });
  }, [router, searchParams, ssoLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function SsoPage() {
  return (
    <Suspense>
      <SsoInner />
    </Suspense>
  );
}
