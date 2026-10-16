import { ReactNode } from 'react';

export default function Sidebar({ children, fullHeight }: { children: ReactNode; fullHeight?: boolean }) {
  return (
    <div className={`w-full md:w-[360px] ${fullHeight ? 'h-full' : 'h-[50vh]'} md:h-full overflow-y-auto bg-white border-r border-gray-200 flex-shrink-0`}>
      {children}
    </div>
  );
}
