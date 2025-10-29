export default function Badge({ color="gray", children }:{color?: "gray"|"green"|"blue"|"orange"|"red", children:any}) {
    const map: Record<string,string> = {
      gray:   "bg-gray-100 text-gray-700",
      green:  "bg-green-100 text-green-700",
      blue:   "bg-blue-100 text-blue-700",
      orange: "bg-orange-100 text-orange-700",
      red:    "bg-rose-100 text-rose-700",
    };
    return <span className={`chip ${map[color]}`}>{children}</span>;
  }
  