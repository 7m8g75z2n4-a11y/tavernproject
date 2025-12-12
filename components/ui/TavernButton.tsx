import type { ButtonHTMLAttributes } from "react";

type TavernButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-amber-500 text-slate-950 hover:bg-amber-400 border-transparent shadow-amber-400/40",
  secondary: "border border-slate-700 text-slate-100 hover:border-slate-500 bg-transparent",
  ghost: "bg-transparent text-slate-100 hover:bg-slate-900/60 border border-transparent",
  danger: "bg-red-600 text-red-50 hover:bg-red-500 border-transparent",
};

export function TavernButton({
  variant = "primary",
  className,
  ...props
}: TavernButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${VARIANT_CLASSES[variant]} ${className ?? ""}`}
    />
  );
}
