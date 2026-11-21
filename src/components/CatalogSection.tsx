import React, { useMemo, useState } from 'react';
import {
  COLOURWAYS,
  getGarmentTitle,
  getSpritePosition,
  PRODUCTS,
} from '@/src/data/catalog';
import { useStore } from '@/src/context/StoreContext';

export function CatalogSection() {
  const { openPdp, addToCart, showToast, openSizeGuide } = useStore();
  const [selectedKind, setSelectedKind] = useState<string>('all');
  const [selectedColour, setSelectedColour] = useState<number | 'all'>('all');
  const [cardRows, setCardRows] = useState<Record<string, number>>({
    romper: 0,
    tee: 1,
    dungarees: 2,
    cardigan: 3,
    'bucket-hat': 1,
  });

  // Curated 16-piece capsule view when a specific colour is NOT locked, or full matching variants
  const displayedCards = useMemo(() => {
    const filteredProducts =
      selectedKind === 'all'
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.id === selectedKind);

    if (selectedColour !== 'all') {
      return filteredProducts.map((product) => ({
        key: `${product.id}-${selectedColour}`,
        product,
        row: selectedColour,
        allowInlineSwitch: false,
      }));
    }

    // When viewing "All", show all 5 core silhouettes (each with live 4-colourway switching)
    // plus an additional curated colour pairing grid so shoppers can explore the 16-piece edit
    if (selectedKind === 'all') {
      const capsuleEdit: Array<{ productId: string; row: number }> = [
        { productId: 'romper', row: 0 },
        { productId: 'tee', row: 1 },
        { productId: 'dungarees', row: 2 },
        { productId: 'cardigan', row: 3 },
        { productId: 'bucket-hat', row: 1 },
        { productId: 'cardigan', row: 2 },
        { productId: 'dungarees', row: 0 },
        { productId: 'romper', row: 1 },
        { productId: 'tee', row: 3 },
        { productId: 'bucket-hat', row: 2 },
        { productId: 'dungarees', row: 3 },
        { productId: 'tee', row: 0 },
      ];
      return capsuleEdit.map((entry, idx) => {
        const product = PRODUCTS.find((p) => p.id === entry.productId)!;
        const cardKey = `${product.id}-${entry.row}-${idx}`;
        return {
          key: cardKey,
          product,
          row: cardRows[cardKey] ?? entry.row,
          allowInlineSwitch: true,
        };
      });
    }

    // When a specific silhouette is chosen, show all 4 colourways side by side
    const product = filteredProducts[0];
    return COLOURWAYS.map((c) => ({
      key: `${product.id}-${c.row}`,
      product,
      row: c.row,
      allowInlineSwitch: false,
    }));
  }, [selectedKind, selectedColour, cardRows]);

  const handleQuickAdd = (
    e: React.MouseEvent,
    col: number,
    row: number,
    defaultSize: string
  ) => {
    e.stopPropagation();
    void addToCart(col, row, defaultSize, 1);
    showToast(`Added ${getGarmentTitle(col, row)} (${defaultSize}) to bag`);
  };

  return (
    <section
      id="collection"
      className="relative bg-[#F9F2E9] border-t border-[#E6D9D2] py-20 md:py-28 px-6 md:px-12"
    >
      <div className="max-w-[1320px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-[#E6D9D2]">
          <div className="max-w-xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#716D71]">
              The Basics · Ages 1–6
            </p>
            <h2 className="mt-3 text-3xl md:text-[42px] font-medium tracking-[-0.025em] leading-[1.1] text-[#3E3A3C] text-balance">
              Soft everyday shapes in four gentle mineral tones.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => openSizeGuide(null)}
              className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#3E3A3C] border-b border-[#3E3A3C] pb-1 hover:opacity-65 transition-opacity whitespace-nowrap cursor-pointer"
            >
              Size &amp; Fit Guide
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="py-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Silhouette Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter by garment silhouette"
            className="flex flex-wrap items-center gap-1.5"
          >
            {[
              { id: 'all', label: 'All Pieces' },
              ...PRODUCTS.map((p) => ({ id: p.id, label: p.kind })),
            ].map((tab) => {
              const active = selectedKind === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedKind(tab.id)}
                  className={`px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors whitespace-nowrap shrink-0 cursor-pointer rounded-full ${
                    active
                      ? 'bg-[#3E3A3C] text-[#F9F2E9]'
                      : 'text-[#716D71] hover:text-[#3E3A3C] hover:bg-[#F3EAE0]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Colourway Filter */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#716D71] whitespace-nowrap">
              Colour
            </span>
            <button
              type="button"
              onClick={() => setSelectedColour('all')}
              className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] transition-colors cursor-pointer whitespace-nowrap ${
                selectedColour === 'all'
                  ? 'text-[#3E3A3C] border-b border-[#3E3A3C]'
                  : 'text-[#716D71] hover:text-[#3E3A3C]'
              }`}
            >
              All
            </button>
            <div className="flex items-center gap-2.5">
              {COLOURWAYS.map((c) => {
                const active = selectedColour === c.row;
                return (
                  <button
                    key={c.name}
                    type="button"
                    aria-label={`Filter by ${c.name}`}
                    aria-pressed={active}
                    onClick={() =>
                      setSelectedColour((prev) => (prev === c.row ? 'all' : c.row))
                    }
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                      active
                        ? 'ring-1 ring-[#3E3A3C] ring-offset-2 ring-offset-[#F9F2E9] scale-105'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* 3-Column Uniform Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-12 pt-4">
          {displayedCards.map(({ key, product, row, allowInlineSwitch }) => {
            const title = getGarmentTitle(product.col, row);
            const spritePos = getSpritePosition(product.col, row);

            return (
              <article
                key={key}
                onClick={() => openPdp(product.col, row)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openPdp(product.col, row);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${title}`}
                className="group flex flex-col cursor-pointer focus-visible:outline-2 focus-visible:outline-[#3E3A3C] focus-visible:outline-offset-4"
              >
                {/* Uniform Aspect Ratio Garment Frame */}
                <div className="relative aspect-[4/4.3] w-full bg-[#F3EAE0] overflow-hidden flex items-center justify-center transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
                  <div
                    className="garment-sprite w-[82%] h-[82%] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    style={{ backgroundPosition: spritePos }}
                  />

                  {/* Subtle Quick-Add Affordance */}
                  <button
                    type="button"
                    onClick={(e) =>
                      handleQuickAdd(e, product.col, row, product.defaultSize)
                    }
                    className="absolute bottom-4 right-4 px-3.5 py-2 bg-[#F9F2E9]/95 border border-[#E6D9D2] text-[10px] font-medium uppercase tracking-[0.24em] text-[#3E3A3C] opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 hover:border-[#3E3A3C] transition-all cursor-pointer whitespace-nowrap"
                  >
                    Quick Add · {product.defaultSize}
                  </button>
                </div>

                {/* Uniform Clean Metadata Footer */}
                <div className="pt-4 flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#716D71]">
                      {product.category}
                    </span>
                    <span className="text-[15px] font-semibold tabular-nums text-[#3E3A3C]">
                      ${product.price}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-[17px] font-medium tracking-[-0.015em] text-[#3E3A3C]">
                      {title}
                    </h3>

                    {allowInlineSwitch && (
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {COLOURWAYS.map((swatch) => {
                          const isCurrent = row === swatch.row;
                          return (
                            <button
                              key={swatch.name}
                              type="button"
                              aria-label={`Preview ${swatch.name} ${product.kind}`}
                              onClick={() =>
                                setCardRows((prev) => ({
                                  ...prev,
                                  [key]: swatch.row,
                                }))
                              }
                              className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-transform ${
                                isCurrent
                                  ? 'ring-1 ring-[#3E3A3C] ring-offset-1 ring-offset-[#F9F2E9]'
                                  : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: swatch.hex }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
