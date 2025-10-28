export default function EmptyState({title, subtitle, action}:{title:string;subtitle?:string;action?:React.ReactNode}) {
    return (
      <div className="section flex flex-col items-center text-center gap-2">
        <div className="text-lg font-semibold">{title}</div>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
        {action}
      </div>
    );
  }
  