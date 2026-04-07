"use client";
import React from 'react';
import TypingGame from '@/components/TypingGame';
import { RESUME_TYPING_TEST } from '@/constants/typingGame';

export default function BreakPage() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-grid pointer-events-none opacity-50" aria-hidden="true" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black pointer-events-none" aria-hidden="true" />

      <main className="relative z-20">
        <TypingGame testText={RESUME_TYPING_TEST} />
      </main>
    </>
  );
}
