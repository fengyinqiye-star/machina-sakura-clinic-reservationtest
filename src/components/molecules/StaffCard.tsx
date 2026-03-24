import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

interface StaffCardProps {
  name: string;
  role: string;
  qualifications: string[];
  specialty: string;
  message: string;
  image: string;
}

export default function StaffCard({
  name,
  role,
  qualifications,
  specialty,
  message,
}: StaffCardProps) {
  return (
    <Card className="p-6 text-center" hover>
      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-sakura-100 flex items-center justify-center">
        <span className="text-3xl text-sakura-400">&#128100;</span>
      </div>
      <Badge className="bg-sakura-100 text-sakura-600 mb-2">{role}</Badge>
      <h3 className="text-lg font-bold text-gray-800 mt-2">{name}</h3>
      <p className="text-sm text-gray-500 mt-1">得意分野: {specialty}</p>
      <div className="flex flex-wrap justify-center gap-1 mt-2">
        {qualifications.map((q) => (
          <Badge key={q} className="bg-wgreen-50 text-wgreen-600 text-xs">
            {q}
          </Badge>
        ))}
      </div>
      <p className="text-sm text-gray-600 mt-3 leading-relaxed">{message}</p>
    </Card>
  );
}
