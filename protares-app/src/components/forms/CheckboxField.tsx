import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface CheckboxFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string | ReactNode;
}

export function CheckboxField<T extends FieldValues>({ control, name, label }: CheckboxFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="mb-4">
          <label className="flex items-start gap-3 cursor-pointer" onClick={() => onChange(!value)}>
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                value ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
              }`}
            >
              {value && <Check size={16} className="text-white" />}
            </div>
            <span className="text-gray-700 text-sm">{label}</span>
          </label>
          {error && <p className="text-emergency-500 text-sm mt-1 ml-9">{error.message}</p>}
        </div>
      )}
    />
  );
}
