import React, { useEffect, useState } from 'react';
import { X, Ruler, Check, ChevronDown } from 'lucide-react';
import {
  COLOURWAYS,
  getColourByRow,
  getGarmentTitle,
  getProductByCol,
  getSpritePosition,
  PRODUCTS,
} from '@/src/data/catalog';
import { useStore } from '@/src/context/StoreContext';

export function ProductDetailModal() {
  const {
    pdpSelection,
    closePdp,
    openPdp,
    addToCart,
    setBagOpen,
    openSizeGuide,
    registerSizeGuideCallback,
    showToast,
  } = useStore();

  const [activeRow, setActiveRow] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [openAccordion, setOpenAccordion] = useState<'fabric' | 'fit' | 'details' | null>(
    'details'
  );
  const [justAdded, setJustAdded] = useState(false);

  const product = pdpSelection ? getProductByCol(pdpSelection.col) : null;

  useEffect(() => {
    if (!pdpSelection) return;
    const p = getProductByCol(pdpSelection.col);
    setActiveRow(pdpSelection.row);
    setSelectedSize(p.defaultSize);
    setJustAdded(false);
  }, [pdpSelection]);

  // Register callback so Size Guide can apply a size directly to this PDP
  useEffect(() => {
    if (!product) {
      registerSizeGuideCallback(null);
      return;
    }
    registerSizeGuideCallback((recommendedSize: string) => {
      if (product.sizes.includes(recommendedSize)) {
        setSelectedSize(recommendedSize);
        showToast(`Selected size ${recommendedSize} for ${product.kind}`);
      } else {
        // Map hat sizes or closest valid size for this silhouette
        const fallback = product.sizes[product.sizes.length - 1];
        const mapped =
          product.id === 'bucket-hat'
            ? recommendedSize === '1–2Y'
              ? '1–2Y'
              : recommendedSize === '2–3Y' || recommendedSize === '3–4Y'
                ? '2–4Y'
                : '4–6Y'
            : fallback;
        setSelectedSize(mapped);
        showToast(`Selected closest fit ${mapped} for ${product.kind}`);
      }
    });
    return () => registerSizeGuideCallback(null);
  }, [product, registerSizeGuideCallback, showToast]);

  // Escape key & scroll lock
  useEffect(() => {
    if (!pdpSelection) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePdp();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [pdpSelection, closePdp]);

  if (!pdpSelection || !product) return null;

  const colour = getColourByRow(activeRow);
  const title = getGarmentTitle(product.col, activeRow);
  const companionProducts = PRODUCTS.filter((p) => p.col !== product.col).slice(0, 3);

  const handleAdd = async () => {
    await addToCart(product.col, activeRow, selectedSize || product.defaultSize, 1);
    setJustAdded(true);
    showToast(`Added ${title} (${selectedSize || product.defaultSize}) to bag`);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70] bg-[#3E3A3C]/35 backdrop-blur-[2px] flex items-center justify-center p-0 md:p-6 overflow-y-auto"
      onClick={closePdp}
    >
      <div
        className="relative w-full max-w-[1140px] min-h-screen md:min-h-0 md:max-h-[92vh] bg-[#F9F2E9] border border-[#E6D9D2] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Strip */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-10 h-14 bg-[#F9F2E9]/95 backdrop-blur-sm border-b border-[#E6D9D2]">
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#716D71]">
            LUNO® · {product.category}
          </span>
          <button
            type="button"
            onClick={closePdp}
            aria-label="Close product details"
            className="w-9 h-9 rounded-full border border-[#E6D9D2] flex items-center justify-center text-[#3E3A3C] hover:border-[#3E3A3C] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Editorial PDP Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Garment Showcase Stage */}
          <div className="lg:col-span-6 bg-[#F3EAE0] p-8 md:p-14 flex flex-col items-center justify-between min-h-[380px] lg:min-h-[600px] border-b lg:border-b-0 lg:border-r border-[#E6D9D2]">
            <div className="w-full flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.28em] text-[#716D71]">
              <span>{colour.name}</span>
              <span>{product.ageRange}</span>
            </div>

            <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center my-4">
              <div
                key={`${product.col}-${activeRow}`}
                className="garment-sprite w-full h-full transition-transform duration-300"
                style={{ backgroundPosition: getSpritePosition(product.col, activeRow) }}
              />
              {/* Subtle Floor Shadow */}
              <div
                aria-hidden="true"
                className="absolute bottom-3 w-[68%] h-6 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(120,96,86,0.16) 0%, rgba(120,96,86,0.06) 55%, rgba(120,96,86,0) 100%)',
                  filter: 'blur(3px)',
                }}
              />
            </div>

            <p className="text-xs text-[#716D71] text-center max-w-sm">
              {colour.swatchNote} · 100% GOTS-certified organic cotton
            </p>
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="lg:col-span-6 p-6 md:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#716D71]">
                {product.category}
              </p>

              <div className="mt-3 flex items-baseline justify-between gap-4">
                <h2 className="text-2xl md:text-[34px] font-medium tracking-[-0.025em] leading-[1.1] text-[#3E3A3C]">
                  {title}
                </h2>
                <span className="text-xl font-semibold tabular-nums text-[#3E3A3C] shrink-0">
                  ${product.price}
                </span>
              </div>

              <p className="mt-4 text-[14px] leading-[1.65] text-[#716D71]">
                {product.description} {product.editorialNote}
              </p>

              {/* Colourway Swatch Picker */}
              <div className="mt-8">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.28em]">
                  <span className="text-[#716D71]">Colour</span>
                  <span className="text-[#3E3A3C]">{colour.name}</span>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Select garment colour"
                  className="mt-3.5 flex items-center gap-3.5"
                >
                  {COLOURWAYS.map((swatch) => {
                    const selected = activeRow === swatch.row;
                    return (
                      <button
                        key={swatch.name}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={swatch.name}
                        onClick={() => setActiveRow(swatch.row)}
                        className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                          selected
                            ? 'ring-1 ring-[#3E3A3C] ring-offset-[4px] ring-offset-[#F9F2E9] scale-105'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Size Selector + Size Guide Trigger */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#716D71]">
                    Size · {selectedSize}
                  </span>
                  <button
                    type="button"
                    onClick={() => openSizeGuide(product.col)}
                    className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.26em] text-[#3E3A3C] border-b border-[#3E3A3C] pb-0.5 hover:opacity-65 transition-opacity cursor-pointer whitespace-nowrap"
                  >
                    <Ruler className="w-3 h-3" />
                    Size Guide
                  </button>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Select size"
                  className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2"
                >
                  {product.sizes.map((sz) => {
                    const active = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelectedSize(sz)}
                        className={`py-2.5 px-3 text-xs font-medium tabular-nums border transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-[#3E3A3C] text-[#F9F2E9] border-[#3E3A3C]'
                            : 'bg-transparent text-[#3E3A3C] border-[#E6D9D2] hover:border-[#3E3A3C]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Add to Bag Action */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 py-3.5 px-6 bg-[#3E3A3C] text-[#F9F2E9] text-[11px] font-medium uppercase tracking-[0.28em] hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  {justAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Added to Bag
                    </>
                  ) : (
                    <>Add to Bag — ${product.price}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closePdp();
                    setBagOpen(true);
                  }}
                  className="py-3.5 px-5 border border-[#E6D9D2] text-[#3E3A3C] text-[11px] font-medium uppercase tracking-[0.26em] hover:border-[#3E3A3C] transition-colors cursor-pointer whitespace-nowrap"
                >
                  View Bag
                </button>
              </div>

              {/* Accordion: Construction, Fabric & Care, Fit */}
              <div className="mt-8 border-t border-[#E6D9D2] divide-y divide-[#E6D9D2]">
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion((prev) => (prev === 'details' ? null : 'details'))
                    }
                    className="w-full py-4 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.28em] text-[#3E3A3C] cursor-pointer"
                  >
                    <span>Garment Details</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openAccordion === 'details' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'details' && (
                    <ul className="pb-4 space-y-1.5 text-sm text-[#716D71]">
                      {product.details.map((d) => (
                        <li key={d} className="leading-relaxed">
                          · {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion((prev) => (prev === 'fabric' ? null : 'fabric'))
                    }
                    className="w-full py-4 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.28em] text-[#3E3A3C] cursor-pointer"
                  >
                    <span>Fabric &amp; Care</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openAccordion === 'fabric' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'fabric' && (
                    <div className="pb-4 space-y-2 text-sm text-[#716D71] leading-relaxed">
                      <p>{product.fabric}</p>
                      <p>{product.care}</p>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion((prev) => (prev === 'fit' ? null : 'fit'))
                    }
                    className="w-full py-4 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.28em] text-[#3E3A3C] cursor-pointer"
                  >
                    <span>Fit &amp; Layering</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openAccordion === 'fit' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'fit' && (
                    <p className="pb-4 text-sm text-[#716D71] leading-relaxed">
                      {product.fit}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pair With Companion Pieces */}
            <div className="mt-8 pt-6 border-t border-[#E6D9D2]">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#716D71]">
                Pairs naturally with
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {companionProducts.map((comp, idx) => {
                  const compRow = (activeRow + idx + 1) % COLOURWAYS.length;
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => openPdp(comp.col, compRow)}
                      className="group text-left cursor-pointer"
                    >
                      <div className="aspect-square bg-[#F3EAE0] flex items-center justify-center p-2">
                        <div
                          className="garment-sprite w-full h-full group-hover:scale-105 transition-transform"
                          style={{
                            backgroundPosition: getSpritePosition(comp.col, compRow),
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs font-medium text-[#3E3A3C] truncate">
                        {getGarmentTitle(comp.col, compRow)}
                      </p>
                      <p className="text-xs text-[#716D71] tabular-nums">${comp.price}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
