import type { ReactNode } from "react";

export function Tabs({
  tabs, active, onChange,
}: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-2 border-b">
      {tabs.map(t => (
        <button key={t}
          onClick={() => onChange(t)}
          className={`px-3.5 py-2 -mb-px rounded-t-lg
            ${active===t ? "border-b-2 border-brand-500 text-brand-700 font-medium"
                          : "text-gray-600 hover:text-gray-900"}`}>
          {t}
        </button>
      ))}
    </div>
  );
}
export function TabPanel({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return <div className="mt-4">{children}</div>;
}
