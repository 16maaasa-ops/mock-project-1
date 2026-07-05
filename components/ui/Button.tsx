import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white active:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900",
  secondary:
    "bg-gray-100 text-gray-900 active:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:active:bg-gray-700",
  danger:
    "bg-red-600 text-white active:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`w-full rounded-xl px-4 py-3 text-base font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
