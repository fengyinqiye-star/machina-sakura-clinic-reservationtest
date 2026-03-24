import Badge from "@/components/atoms/Badge";
import { STATUS_LABELS, STATUS_COLORS, type ReservationStatus } from "@/types";
import Link from "next/link";

interface ReservationRowProps {
  id: string;
  reservationDate: string;
  reservationTime: string;
  patientName: string;
  phone: string;
  menuName: string;
  status: ReservationStatus;
}

export default function ReservationRow({
  id,
  reservationDate,
  reservationTime,
  patientName,
  phone,
  menuName,
  status,
}: ReservationRowProps) {
  return (
    <Link
      href={`/admin/reservations/${id}`}
      className="block hover:bg-gray-50 transition-colors"
    >
      <div className="grid grid-cols-[120px_1fr_120px_140px_100px] gap-2 items-center px-4 py-3 border-b border-gray-100 text-sm">
        <span className="text-gray-700 font-medium">
          {reservationDate}
          <br />
          <span className="text-gray-500">{reservationTime}</span>
        </span>
        <span className="text-gray-800 font-medium">{patientName}</span>
        <span className="text-gray-600">{phone}</span>
        <span className="text-gray-600">{menuName}</span>
        <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
      </div>
    </Link>
  );
}
