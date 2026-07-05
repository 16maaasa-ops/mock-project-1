import type { ReactNode } from "react";
import { verifySession } from "@/lib/auth/dal";
import { BottomNav } from "@/components/admin/BottomNav";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await verifySession();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          管理画面
        </h1>
        <LogoutButton />
      </header>
      <main className="mx-auto max-w-md p-4">{children}</main>
      <BottomNav />
    </div>
  );
}
