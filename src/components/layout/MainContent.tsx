import { ReactNode } from 'react';

export default function MainContent({ children, hiddenOnMobile }: { children: ReactNode; hiddenOnMobile?: boolean }) {
  return (
    <div className={`flex-1 h-[50vh] md:h-full relative ${hiddenOnMobile ? 'hidden md:block' : ''}`}>
      {children}
    </div>
  );
}
