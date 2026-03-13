import { ReactNode } from 'react';

export default function MainContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 h-[50vh] md:h-full relative">
      {children}
    </div>
  );
}
