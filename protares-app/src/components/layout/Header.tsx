import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function Header({ title, showBack = false, onBack, rightAction }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 flex-shrink-0">
      <div className="w-12">
        {showBack && (
          <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
        )}
      </div>
      <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">{title}</h1>
      <div className="w-12 flex justify-end">{rightAction}</div>
    </header>
  );
}
