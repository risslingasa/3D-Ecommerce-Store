import React, { useEffect, useState } from 'react';
import { useStore } from '@/src/context/StoreContext';

export function StickyHeader() {
  const {
    totalCount,
    setBagOpen,
    openSizeGuide,
    setOrdersOpen,
    user,
    signInWithGoogle,
    authBusy,
  } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.78;
      setVisible(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-[#F9F2E9]/92 backdrop-blur-md border-b border-[#E6D9D2] transition-all duration-300 ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xl font-bold tracking-[-0.035em] text-[#3E3A3C] whitespace-nowrap shrink-0"
        >
          BUNTO<sup className="text-[0.5em] font-medium align-[0.9em] ml-[0.04em]">°</sup>
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.26em] text-[#716D71]"
        >
          <button
            type="button"
            onClick={() => scrollTo('collection')}
            className="hover:text-[#3E3A3C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Collection
          </button>
          <button
            type="button"
            onClick={() => scrollTo('craft')}
            className="hover:text-[#3E3A3C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Craft
          </button>
          <button
            type="button"
            onClick={() => openSizeGuide(null)}
            className="hover:text-[#3E3A3C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Size Guide
          </button>
          <button
            type="button"
            onClick={() => {
              if (user) {
                setOrdersOpen(true);
              } else {
                void signInWithGoogle();
              }
            }}
            disabled={authBusy}
            className="hover:text-[#3E3A3C] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            {user ? 'Orders' : 'Sign In'}
          </button>
        </nav>

        {/* Zone 3: Primary Bag trigger */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setBagOpen(true)}
            aria-label={`Bag, ${totalCount} ${totalCount === 1 ? 'item' : 'items'}`}
            className="inline-flex items-center gap-3 px-4 py-2 border border-[#E6D9D2] rounded-full text-[11px] font-medium uppercase tracking-[0.24em] text-[#3E3A3C] hover:border-[#3E3A3C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <path d="M3.5 5.5h9l-.7 8h-7.6z" />
              <path d="M5.8 5.5V4.4a2.2 2.2 0 0 1 4.4 0v1.1" />
            </svg>
            <span className="tabular-nums">Bag ({totalCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
