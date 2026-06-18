import { ReactNode } from "react";
import { MdEco } from "react-icons/md";

interface Props { icon?: ReactNode; title: string; description?: string; action?: ReactNode; children?: ReactNode; }

export default function EmptyState({ icon = <MdEco/>, title, description, action, children }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-display font-bold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>}
      {action}
      {children}
    </div>
  );
}