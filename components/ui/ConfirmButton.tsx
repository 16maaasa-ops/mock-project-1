"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ConfirmButton({
  action,
  confirmMessage,
  children,
  variant = "secondary",
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  children: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      disabled={pending}
      onClick={async () => {
        if (!window.confirm(confirmMessage)) return;
        setPending(true);
        try {
          await action();
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "処理中..." : children}
    </Button>
  );
}
