import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/src/context/StoreContext';

export function MenuDrawer() {
  const {
    menuOpen,
    setMenuOpen,
    openSizeGuide,
    setBagOpen,
    setOrdersOpen,
    totalCount,
    user,
    signInWithGoogle,
    logOut,
  } = useStore();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, setMenuOpen]);

  if (!menuOpen) return null;

  const navigateTo = (id?: string) => {
    setMenuOpen(false);
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Store Navigation"
      className="fixed inset-0 z-[80] bg-[#3E3A3C]/35 backdrop-blur-[2px] flex justify-end"
      onClick={() => setMenuOpen(false)}
    >
      <aside
        className="w-full max-w-[380px] h-full bg-[#F9F2E9] border-l border-[#E6D9D2] flex flex-col justify-between p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-[#E6D9D2]">
            <span className="text-xl font-bold tracking-[-0.035em] text-[#3E3A3C]">
              LUNO<sup className="text-[0.5em] font-medium align-[0.9em] ml-[0.04em]">®</sup>
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="w-9 h-9 rounded-full border border-[#E6D9D2] flex items-center justify-center text-[#3E3A3C] hover:border-[#3E3A3C] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav aria-label="Menu" className="mt-8 flex flex-col space-y-5">
            <button
              type="button"
              onClick={() => navigateTo()}
              className="text-left text-2xl font-medium tracking-[-0.02em] text-[#3E3A3C] hover:opacity-65 transition-opacity cursor-pointer"
            >
              Garment Ring
            </button>
            <button
              type="button"
              onClick={() => navigateTo('collection')}
              className="text-left text-2xl font-medium tracking-[-0.02em] text-[#3E3A3C] hover:opacity-65 transition-opacity cursor-pointer"
            >
              The Basics Collection
            </button>
            <button
              type="button"
              onClick={() => navigateTo('craft')}
              className="text-left text-2xl font-medium tracking-[-0.02em] text-[#3E3A3C] hover:opacity-65 transition-opacity cursor-pointer"
            >
              Organic Cotton &amp; Craft
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openSizeGuide(null);
              }}
              className="text-left text-2xl font-medium tracking-[-0.02em] text-[#3E3A3C] hover:opacity-65 transition-opacity cursor-pointer"
            >
              Size &amp; Fit Guide
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setBagOpen(true);
              }}
              className="text-left text-2xl font-medium tracking-[-0.02em] text-[#3E3A3C] hover:opacity-65 transition-opacity cursor-pointer tabular-nums"
            >
              Shopping Bag ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setOrdersOpen(true);
              }}
              className="text-left text-2xl font-medium tracking-[-0.02em] text-[#3E3A3C] hover:opacity-65 transition-opacity cursor-pointer"
            >
              Order History
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-[#E6D9D2]">
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#3E3A3C] truncate">
                  {user.displayName}
                </p>
                <p className="text-[11px] text-[#716D71] truncate">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => void logOut()}
                className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#716D71] hover:text-[#3E3A3C] cursor-pointer whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                void signInWithGoogle();
              }}
              className="w-full py-3 px-4 border border-[#3E3A3C] text-[10px] font-medium uppercase tracking-[0.28em] text-[#3E3A3C] hover:bg-[#3E3A3C] hover:text-[#F9F2E9] transition-colors cursor-pointer"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
