import { FIRST_VISIT_NOTICE } from "@/lib/constants";

export default function FirstVisitNotice() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
      <h4 className="font-bold text-green-800 mb-2">{FIRST_VISIT_NOTICE.title}</h4>
      <ul className="space-y-1">
        {FIRST_VISIT_NOTICE.items.map((item, i) => (
          <li key={i} className="text-sm text-green-700 flex items-start gap-2">
            <span className="shrink-0 mt-0.5">&#10003;</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
