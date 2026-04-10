"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-semibold text-foreground">App shell error</h1>
          <p className="text-sm text-muted-foreground">
            A root-level rendering error occurred. Reset the app shell to try the request again.
          </p>
          <Button onClick={() => reset()}>Reload app</Button>
        </div>
      </body>
    </html>
  );
}
