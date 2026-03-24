import { CANCEL_POLICY } from "@/lib/constants";

export default function CancelPolicy() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <h4 className="font-bold text-amber-800 mb-2">キャンセルポリシー</h4>
      <p className="text-sm text-amber-700 leading-relaxed">{CANCEL_POLICY}</p>
    </div>
  );
}
