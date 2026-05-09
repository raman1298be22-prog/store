"use client";
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";


export default function Page() {
  const laptop = { /* define your laptop object here */ };
  // Dynamically import the component to ensure it only runs on the client
  const TechreviveWithAdmin = dynamic(() => import('@/components/techrevive-with-admin').then(mod => mod.default), { ssr: false });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  

  return (
    <>
      <TechreviveWithAdmin />
    </>
  );
};

