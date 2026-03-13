import { ReactNode } from 'react';

export default function Sidebar({ children }: { children: ReactNode }) {
  return (
    <div className="w-full md:w-[360px] h-[50vh] md:h-full overflow-y-auto bg-white border-r border-gray-200 flex-shrink-0">
      {children}
    </div>
  );
}
