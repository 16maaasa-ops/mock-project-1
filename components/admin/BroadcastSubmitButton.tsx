"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function BroadcastSubmitButton() {
  const [pending, setPending] = useState(false);

  function handleClick(event: FormEvent<HTMLButtonElement>) {
    if (!window.confirm("全ての友だちに配信されます。取り消せません。よろしいですか？")) {
      event.preventDefault();
      return;
    }
    setPending(true);
  }

  return (
    <Button type="submit" variant="danger" disabled={pending} onClick={handleClick}>
      {pending ? "送信中..." : "配信する"}
    </Button>
  );
}
