'use client';

import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-12">
        <Image 
          src="/logo.png" 
          alt="Low Key High" 
          width={1600} 
          height={500} 
          className="h-64 w-auto md:h-80" 
          priority 
        />
        <div className="loader"></div>
      </div>
    </div>
  );
}
