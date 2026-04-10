"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api, OutlookStatus } from "@/lib/api";

export function useOutlookOnboarding() {
  const { isAuthenticated, isLoading, refreshSession, requiresOnboarding } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<OutlookStatus | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!requiresOnboarding && !isLoading) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, requiresOnboarding, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;

    async function loadStatus() {
      try {
        const nextStatus = await api.getOutlookStatus();
        if (active) {
          setStatus(nextStatus);
        }
      } catch {
        toast.error("Failed to load Outlook onboarding status.");
      }
    }

    void loadStatus();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (!codeParam) {
      return;
    }
    const code = codeParam;

    let active = true;
    setBusy(true);

    async function completeConnection() {
      try {
        const result = await api.completeOutlookConnect(code);
        if (!active) {
          return;
        }

        setStatus(result);
        await refreshSession();
        toast.success("Outlook mailbox connected successfully.");
        router.replace("/dashboard");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to complete Outlook connection.");
      } finally {
        if (active) {
          setBusy(false);
        }
      }
    }

    void completeConnection();

    return () => {
      active = false;
    };
  }, [refreshSession, router, searchParams]);

  const handleConnect = async () => {
    setBusy(true);
    try {
      const result = await api.getOutlookConnectUrl();
      window.location.assign(result.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start Outlook connection.");
      setBusy(false);
    }
  };

  const handleReconnect = async () => {
    setBusy(true);
    try {
      const result = await api.reconnectOutlook();
      setStatus(result);
      await refreshSession();
      toast.success("Outlook subscription refreshed.");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reconnect failed.");
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    status,
    handleConnect,
    handleReconnect,
  };
}
