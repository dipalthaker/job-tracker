import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"soft" };
export default function Button({ variant="primary", className="", ...props }: Props) {
  const base = variant === "primary" ? "btn-primary" : "btn-soft";
  return <button className={`${base} ${className}`} {...props} />;
}
