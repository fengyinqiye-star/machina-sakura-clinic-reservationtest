interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
}

export default function FormField({ label, required, children, htmlFor }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
