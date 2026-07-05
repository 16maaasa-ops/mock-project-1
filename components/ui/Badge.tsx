type Tone = "success" | "warning" | "neutral" | "danger";

const toneClasses: Record<Tone, string> = {
  success:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  warning:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
