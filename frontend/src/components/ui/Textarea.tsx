import type { TextareaHTMLAttributes } from "react";
export default function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`input h-28 ${props.className || ""}`} />;
}
