type MetricRowProps = {
  label: string;
  value: string;
  // icon:string;
};
// import {Hash} from "lucide-react";

export function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 last:border-none last:pb-0">
      <span className="text-[var(--text-700)]">{label}</span>
      <span className="font-semibold text-[var(--text-900)]">{value}</span>
    </div>
  );
}
