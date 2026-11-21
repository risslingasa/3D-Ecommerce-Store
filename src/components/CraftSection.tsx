import React from 'react';
import { COLOURWAYS, getSpritePosition } from '@/src/data/catalog';
import { useStore } from '@/src/context/StoreContext';

export function CraftSection() {
  const { openSizeGuide, setBagOpen, setOrdersOpen, user, signInWithGoogle } =
    useStore();

  return (
    <>
      <section
        id="craft"
        className="bg-[#F3EAE0] border-t border-[#E6D9D2] py-24 md:py-32 px-6 md:px-12"
      >
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Editorial Story Copy */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#716D71]">
              Organic Cotton &amp; Knit · Made to Hand Down
            </p>
            <h2 className="text-3xl md:text-[40px] font-medium tracking-[-0.025em] leading-[1.12] text-[#3E3A3C] text-balance">
              Fewer pieces, heavier yarn, softer mornings.
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#716D71] max-w-[54ch]">
              Every LUNO® garment is knitted or woven from 100% GOTS-certified
              organic cotton, garment-dyed in small batches across our four
              signature mineral hues, and finished with natural wooden buttons
              and turn-up cuffs that stretch an extra season of wear.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#E6D9D2]">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#716D71]">
                  01. Material
                </p>
                <p className="mt-2 text-sm text-[#3E3A3C] leading-relaxed">
                  Unbleached long-staple organic cotton spun without harsh softeners.
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#716D71]">
                  02. Colour
                </p>
                <p className="mt-2 text-sm text-[#3E3A3C] leading-relaxed">
                  Four mix-and-match tones—Peach, Pink, Sage and Butter—that pair effortlessly.
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#716D71]">
                  03. Longevity
                </p>
                <p className="mt-2 text-sm text-[#3E3A3C] leading-relaxed">
                  Adjustable straps, generous cuffs and reinforced seams made for siblings.
                </p>
              </div>
            </div>
          </div>

          {/* Tonal Colour Palette & Garment Detail Composition */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {COLOURWAYS.map((colour, idx) => {
              const colMap = [1, 2, 0, 3];
              const col = colMap[idx];
              return (
                <div
                  key={colour.name}
                  className="bg-[#F9F2E9] border border-[#E6D9D2] p-6 flex flex-col justify-between aspect-square"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#716D71]">
                      {colour.name}
                    </span>
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: colour.hex }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 flex items-center justify-center my-2">
                    <div
                      className="garment-sprite w-36 h-36 sm:w-40 sm:h-40"
                      style={{ backgroundPosition: getSpritePosition(col, colour.row) }}
                    />
                  </div>
                  <p className="text-xs text-[#716D71]">{colour.swatchNote}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quiet Editorial Footer */}
      <footer className="bg-[#F9F2E9] border-t border-[#E6D9D2] py-14 px-6 md:px-12">
        <div className="max-w-[1320px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="text-xl font-bold tracking-[-0.035em] text-[#3E3A3C]">
              LUNO<sup className="text-[0.5em] font-medium align-[0.9em] ml-[0.04em]">®</sup>
            </p>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#716D71]">
              Soft things for small people · Ages 1–6
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-7 text-[11px] font-medium uppercase tracking-[0.24em] text-[#716D71]">
            <a
              href="#collection"
              className="hover:text-[#3E3A3C] transition-colors whitespace-nowrap"
            >
              Collection
            </a>
            <button
              type="button"
              onClick={() => openSizeGuide(null)}
              className="hover:text-[#3E3A3C] transition-colors whitespace-nowrap cursor-pointer"
            >
              Size Guide
            </button>
            <button
              type="button"
              onClick={() => setBagOpen(true)}
              className="hover:text-[#3E3A3C] transition-colors whitespace-nowrap cursor-pointer"
            >
              Shopping Bag
            </button>
            <button
              type="button"
              onClick={async () => {
                if (user) {
                  setOrdersOpen(true);
                } else {
                  const signedIn = await signInWithGoogle();
                  if (!signedIn) setOrdersOpen(true);
                }
              }}
              className="hover:text-[#3E3A3C] transition-colors whitespace-nowrap cursor-pointer"
            >
              {user ? 'Order History' : 'Sign In'}
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
