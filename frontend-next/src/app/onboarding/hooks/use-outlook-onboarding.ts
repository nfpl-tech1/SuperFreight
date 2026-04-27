"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api, getErrorMessage, OutlookStatus } from "@/lib/api";

export function useOutlookOnboarding() {
  const { isAuthenticated, isLoading, refreshSession, requiresOnboarding, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<OutlookStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [signatureStepDismissed, setSignatureStepDismissed] = useState(false);
  const handledCodeRef = useRef<string | null>(null);

  const isMailboxConnected = Boolean(status?.isConnected || user?.outlookConnected);
  const needsSignatureSetup =
    isMailboxConnected && !user?.emailSignature && !signatureStepDismissed;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!requiresOnboarding && !needsSignatureSetup && !isLoading) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, needsSignatureSetup, requiresOnboarding, router]);

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
    if (!codeParam || handledCodeRef.current === codeParam) {
      return;
    }
    handledCodeRef.current = codeParam;
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
        toast.success("Outlook mailbox connected. Set up your signature to finish.");
        router.replace("/onboarding");
      } catch (error) {
        handledCodeRef.current = null;
        toast.error(getErrorMessage(error, "Failed to complete Outlook connection."));
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
      toast.error(getErrorMessage(error, "Failed to start Outlook connection."));
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
    } catch (error) {
      toast.error(getErrorMessage(error, "Reconnect failed."));
    } finally {
      setBusy(false);
    }
  };

  const skipSignatureSetup = () => {
    setSignatureStepDismissed(true);
    router.replace("/dashboard");
  };

  return {
    busy,
    needsSignatureSetup,
    status,
    handleConnect,
    handleReconnect,
    skipSignatureSetup,
  };
}
