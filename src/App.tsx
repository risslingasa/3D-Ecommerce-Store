import React from 'react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { StoreProvider, useStore } from '@/src/context/StoreContext';
import { HeroRing } from '@/src/components/HeroRing';
import { StickyHeader } from '@/src/components/StickyHeader';
import { CatalogSection } from '@/src/components/CatalogSection';
import { CraftSection } from '@/src/components/CraftSection';
import { ProductDetailModal } from '@/src/components/ProductDetailModal';
import { SizeGuideModal } from '@/src/components/SizeGuideModal';
import { BagDrawer } from '@/src/components/BagDrawer';
import { OrdersDrawer } from '@/src/components/OrdersDrawer';
import { MenuDrawer } from '@/src/components/MenuDrawer';

function ToastBanner() {
  const { toastMessage } = useStore();
  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] px-5 py-3 bg-[#3E3A3C] text-[#F9F2E9] text-[11px] font-medium tracking-[0.14em] shadow-lg whitespace-nowrap max-w-[90vw] truncate"
    >
      {toastMessage}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        {/* Hidden inline SVG alpha-cleanup filter applied to every garment layer */}
        <svg
          width="0"
          height="0"
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
          aria-hidden="true"
        >
          <defs>
            <filter id="clean" colorInterpolationFilters="sRGB">
              <feComponentTransfer>
                <feFuncA type="linear" slope="1.1" intercept="-0.1" />
              </feComponentTransfer>
            </filter>
          </defs>
        </svg>

        <div id="top" className="min-h-screen bg-[#F9F2E9] text-[#3E3A3C]">
          <StickyHeader />
          <main>
            <HeroRing />
            <CatalogSection />
            <CraftSection />
          </main>

          <ProductDetailModal />
          <SizeGuideModal />
          <BagDrawer />
          <OrdersDrawer />
          <MenuDrawer />
          <ToastBanner />
        </div>
      </StoreProvider>
    </ErrorBoundary>
  );
}
