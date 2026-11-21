import React, { useEffect, useMemo, useState } from 'react';
import { X, Check } from 'lucide-react';
import { getProductByCol, SIZE_CHART } from '@/src/data/catalog';
import { useStore } from '@/src/context/StoreContext';

function cmToIn(cm: number): string {
  return (cm / 2.54).toFixed(1);
}

function formatRange(range: [number, number], unit: 'cm' | 'in'): string {
  if (unit === 'cm') {
    return `${range[0]}–${range[1]} cm`;
  }
  return `${cmToIn(range[0])}–${cmToIn(range[1])}"`;
}

export function SizeGuideModal() {
  const {
    sizeGuideOpen,
    sizeGuideContextCol,
    closeSizeGuide,
    onSelectSizeFromGuide,
  } = useStore();

  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [childHeightCm, setChildHeightCm] = useState<number>(96);

  useEffect(() => {
    if (!sizeGuideOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSizeGuide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sizeGuideOpen, closeSizeGuide]);

  const recommendedRow = useMemo(() => {
    const match = SIZE_CHART.find(
      (row) => childHeightCm >= row.heightCm[0] && childHeightCm <= row.heightCm[1]
    );
    if (match) return match;
    if (childHeightCm < SIZE_CHART[0].heightCm[0]) return SIZE_CHART[0];
    return SIZE_CHART[SIZE_CHART.length - 1];
  }, [childHeightCm]);

  if (!sizeGuideOpen) return null;

  const contextProduct =
    sizeGuideContextCol !== null ? getProductByCol(sizeGuideContextCol) : null;

  const displayHeight =
    unit === 'cm' ? `${childHeightCm} cm` : `${cmToIn(childHeightCm)} in`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="LUNO® Size & Fit Guide"
      className="fixed inset-0 z-[80] bg-[#3E3A3C]/40 backdrop-blur-[2px] flex items-center justify-center p-4 md:p-8 overflow-y-auto"
      onClick={closeSizeGuide}
    >
      <div
        className="w-full max-w-[780px] bg-[#F9F2E9] border border-[#E6D9D2] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 h-16 bg-[#F9F2E9] border-b border-[#E6D9D2]">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#716D71]">
              LUNO® Sizing · Ages 1–6
            </p>
            <h2 className="text-lg font-medium tracking-tight text-[#3E3A3C]">
              {contextProduct
                ? `${contextProduct.kind} Size & Fit Guide`
                : 'Size & Fit Guide'}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeSizeGuide}
            aria-label="Close size guide"
            className="w-9 h-9 rounded-full border border-[#E6D9D2] flex items-center justify-center text-[#3E3A3C] hover:border-[#3E3A3C] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Interactive Fit Recommender */}
          <div className="bg-[#F3EAE0] border border-[#E6D9D2] p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#716D71]">
                  Quick Fit Finder
                </p>
                <p className="mt-1 text-sm text-[#3E3A3C]">
                  Slide to your child&apos;s height to highlight their best fit.
                </p>
              </div>

              {/* Unit Toggle */}
              <div className="inline-flex items-center border border-[#E6D9D2] bg-[#F9F2E9] p-0.5 self-start sm:self-auto">
                {(['cm', 'in'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] transition-colors cursor-pointer ${
                      unit === u
                        ? 'bg-[#3E3A3C] text-[#F9F2E9]'
                        : 'text-[#716D71] hover:text-[#3E3A3C]'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-[#716D71] mb-2">
                  <span>Child height</span>
                  <span className="font-semibold text-[#3E3A3C] tabular-nums">
                    {displayHeight}
                  </span>
                </div>
                <input
                  type="range"
                  min={78}
                  max={118}
                  step={1}
                  value={childHeightCm}
                  onChange={(e) => setChildHeightCm(Number(e.target.value))}
                  aria-label="Child height in centimetres"
                  className="w-full accent-[#3E3A3C] cursor-pointer"
                />
              </div>

              <div className="sm:pl-6 sm:border-l border-[#E6D9D2] flex items-center justify-between sm:flex-col sm:items-end gap-2">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#716D71]">
                    Suggested
                  </p>
                  <p className="text-xl font-semibold tabular-nums text-[#3E3A3C]">
                    {recommendedRow.size}
                  </p>
                </div>

                {onSelectSizeFromGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSizeFromGuide(recommendedRow.size);
                      closeSizeGuide();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3E3A3C] text-[#F9F2E9] text-[10px] font-medium uppercase tracking-[0.24em] hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                  >
                    <Check className="w-3 h-3" />
                    Apply Size
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Measurement Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6D9D2] text-[10px] font-medium uppercase tracking-[0.24em] text-[#716D71]">
                  <th className="py-3 pr-4">Size</th>
                  <th className="py-3 px-3">Age</th>
                  <th className="py-3 px-3">Height</th>
                  <th className="py-3 px-3">Chest</th>
                  <th className="py-3 px-3">Waist</th>
                  <th className="py-3 pl-3">Head (Hat)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6D9D2] text-sm">
                {SIZE_CHART.map((row) => {
                  const isRecommended = row.size === recommendedRow.size;
                  return (
                    <tr
                      key={row.size}
                      className={`transition-colors ${
                        isRecommended ? 'bg-[#F3EAE0]' : ''
                      }`}
                    >
                      <td className="py-3.5 pr-4 font-semibold tabular-nums text-[#3E3A3C] whitespace-nowrap">
                        {row.size}
                        {isRecommended && (
                          <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#716D71]">
                            Best fit
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-[#716D71] whitespace-nowrap">
                        {row.ageLabel}
                      </td>
                      <td className="py-3.5 px-3 tabular-nums text-[#3E3A3C] whitespace-nowrap">
                        {formatRange(row.heightCm, unit)}
                      </td>
                      <td className="py-3.5 px-3 tabular-nums text-[#3E3A3C] whitespace-nowrap">
                        {formatRange(row.chestCm, unit)}
                      </td>
                      <td className="py-3.5 px-3 tabular-nums text-[#3E3A3C] whitespace-nowrap">
                        {formatRange(row.waistCm, unit)}
                      </td>
                      <td className="py-3.5 pl-3 tabular-nums text-[#3E3A3C] whitespace-nowrap">
                        {formatRange(row.headCm, unit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Silhouette Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E6D9D2] text-xs text-[#716D71] leading-relaxed">
            <div>
              <p className="font-medium uppercase tracking-[0.22em] text-[#3E3A3C]">
                Between Sizes?
              </p>
              <p className="mt-1.5">
                All LUNO® cotton knits are pre-washed for minimal shrinkage. If
                your child is near the top of a height range, size up—our rolled
                dungaree cuffs and cardigan sleeves are cut to fold neatly.
              </p>
            </div>
            <div>
              <p className="font-medium uppercase tracking-[0.22em] text-[#3E3A3C]">
                Bucket Hat Sizing
              </p>
              <p className="mt-1.5">
                Hats come in dual age bands: 1–2Y (46–48 cm), 2–4Y (48–51 cm),
                and 4–6Y (51–54 cm). Measure loosely above the eyebrows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
