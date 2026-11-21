import React, { useEffect, useState } from 'react';
import { X, Minus, Plus, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import {
  FREE_SHIPPING_THRESHOLD,
  getGarmentTitle,
  getSpritePosition,
} from '@/src/data/catalog';
import {
  type OrderRecord,
  type ShippingInfo,
  useStore,
} from '@/src/context/StoreContext';

type DrawerStep = 'bag' | 'checkout' | 'confirmed';

export function BagDrawer() {
  const {
    bagOpen,
    setBagOpen,
    cart,
    totalCount,
    subtotal,
    shippingCost,
    grandTotal,
    updateQuantity,
    removeItem,
    user,
    signInWithGoogle,
    authBusy,
    authError,
    placeOrder,
    setOrdersOpen,
  } = useStore();

  const [step, setStep] = useState<DrawerStep>('bag');
  const [shippingForm, setShippingForm] = useState<ShippingInfo>({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (user?.displayName && !shippingForm.fullName) {
      setShippingForm((prev) => ({
        ...prev,
        fullName: user.displayName || '',
      }));
    }
  }, [user, shippingForm.fullName]);

  useEffect(() => {
    if (!bagOpen) {
      const t = window.setTimeout(() => {
        if (step === 'confirmed') setStep('bag');
        setFormError(null);
      }, 250);
      return () => window.clearTimeout(t);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBagOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bagOpen, setBagOpen, step]);

  if (!bagOpen) return null;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (shippingForm.fullName.trim().length < 2) {
      setFormError('Please enter the recipient full name.');
      return;
    }
    if (shippingForm.address.trim().length < 3) {
      setFormError('Please enter a complete street address.');
      return;
    }
    if (shippingForm.city.trim().length < 1) {
      setFormError('Please enter your city.');
      return;
    }
    if (shippingForm.postalCode.trim().length < 2) {
      setFormError('Please enter your postal code.');
      return;
    }
    if (shippingForm.country.trim().length < 2) {
      setFormError('Please enter your country.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await placeOrder(shippingForm);
      setConfirmedOrder(order);
      setStep('confirmed');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to place order right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      className="fixed inset-0 z-[80] bg-[#3E3A3C]/35 backdrop-blur-[2px] flex justify-end"
      onClick={() => setBagOpen(false)}
    >
      <aside
        className="w-full max-w-[460px] h-full bg-[#F9F2E9] border-l border-[#E6D9D2] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#E6D9D2] shrink-0">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => {
                  setStep('bag');
                  setFormError(null);
                }}
                aria-label="Back to bag"
                className="text-[#716D71] hover:text-[#3E3A3C] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#3E3A3C]">
              {step === 'bag' && `Shopping Bag (${totalCount})`}
              {step === 'checkout' && 'Checkout'}
              {step === 'confirmed' && 'Order Confirmed'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setBagOpen(false)}
            aria-label="Close bag"
            className="w-8 h-8 rounded-full border border-[#E6D9D2] flex items-center justify-center text-[#3E3A3C] hover:border-[#3E3A3C] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: BAG ITEMS */}
        {step === 'bag' && (
          <>
            {cart.length > 0 && (
              <div className="px-6 py-3.5 bg-[#F3EAE0] border-b border-[#E6D9D2] shrink-0">
                <p className="text-xs text-[#3E3A3C]">
                  {remainingForFreeShipping > 0 ? (
                    <>
                      Add{' '}
                      <span className="font-semibold tabular-nums">
                        ${remainingForFreeShipping}
                      </span>{' '}
                      more for complimentary shipping.
                    </>
                  ) : (
                    'Complimentary tracked shipping unlocked.'
                  )}
                </p>
                <div className="mt-2 h-1 w-full bg-[#E6D9D2] overflow-hidden">
                  <div
                    className="h-full bg-[#3E3A3C] transition-all duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#716D71]">
                    Your bag is empty
                  </p>
                  <p className="mt-3 text-sm text-[#716D71] max-w-[26ch] leading-relaxed">
                    Spin the ring or browse the organic cotton basics below to
                    begin.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBagOpen(false);
                      document
                        .getElementById('collection')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-6 border-b border-[#3E3A3C] pb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-[#3E3A3C] hover:opacity-65 transition-opacity cursor-pointer"
                  >
                    Explore The Basics
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-[#E6D9D2]">
                  {cart.map((item) => {
                    const title = getGarmentTitle(item.col, item.row);
                    return (
                      <li key={item.lineId} className="py-5 first:pt-0 flex gap-4">
                        <div className="w-20 h-20 bg-[#F3EAE0] shrink-0 flex items-center justify-center p-1.5">
                          <div
                            className="garment-sprite w-full h-full"
                            style={{
                              backgroundPosition: getSpritePosition(item.col, item.row),
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-medium text-[#3E3A3C] truncate">
                                {title}
                              </h3>
                              <p className="mt-0.5 text-xs text-[#716D71]">
                                Size {item.size} · {item.colourName}
                              </p>
                            </div>
                            <span className="text-sm font-semibold tabular-nums text-[#3E3A3C]">
                              ${item.unitPrice * item.quantity}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center border border-[#E6D9D2]">
                              <button
                                type="button"
                                aria-label={`Decrease quantity of ${title}`}
                                onClick={() => void updateQuantity(item.lineId, -1)}
                                className="w-7 h-7 flex items-center justify-center text-[#3E3A3C] hover:bg-[#F3EAE0] transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-medium tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label={`Increase quantity of ${title}`}
                                onClick={() => void updateQuantity(item.lineId, 1)}
                                className="w-7 h-7 flex items-center justify-center text-[#3E3A3C] hover:bg-[#F3EAE0] transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              aria-label={`Remove ${title}`}
                              onClick={() => void removeItem(item.lineId)}
                              className="text-[#716D71] hover:text-[#3E3A3C] transition-colors p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-6 py-5 border-t border-[#E6D9D2] bg-[#F9F2E9] shrink-0 space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[#716D71]">
                    <span>Subtotal</span>
                    <span className="tabular-nums">${subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[#716D71]">
                    <span>Shipping</span>
                    <span className="tabular-nums">
                      {shippingCost === 0 ? 'Complimentary' : `$${shippingCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E6D9D2] font-semibold text-[#3E3A3C]">
                    <span>Total</span>
                    <span className="tabular-nums">${grandTotal}</span>
                  </div>
                </div>

                {!user ? (
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      disabled={authBusy}
                      onClick={async () => {
                        const signedIn = await signInWithGoogle();
                        if (signedIn) setStep('checkout');
                      }}
                      className="w-full py-3.5 px-6 bg-[#3E3A3C] text-[#F9F2E9] text-[11px] font-medium uppercase tracking-[0.26em] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                    >
                      {authBusy ? 'Signing In…' : 'Sign In with Google to Checkout'}
                    </button>
                    <p className="text-[11px] text-[#716D71] text-center">
                      Your bag syncs automatically and saves receipts to Order History.
                    </p>
                    {authError && (
                      <p className="text-xs text-red-700 text-center">{authError}</p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep('checkout')}
                    className="w-full py-3.5 px-6 bg-[#3E3A3C] text-[#F9F2E9] text-[11px] font-medium uppercase tracking-[0.28em] hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* STEP 2: CHECKOUT FORM */}
        {step === 'checkout' && (
          <form
            onSubmit={handleCheckoutSubmit}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#716D71]">
                  Account
                </p>
                <p className="mt-1 text-sm text-[#3E3A3C]">
                  {user?.displayName} · {user?.email}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E6D9D2] space-y-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#716D71]">
                  Shipping Details
                </p>

                <div>
                  <label
                    htmlFor="ship-name"
                    className="block text-xs text-[#716D71] mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="ship-name"
                    type="text"
                    required
                    maxLength={100}
                    value={shippingForm.fullName}
                    onChange={(e) =>
                      setShippingForm((p) => ({ ...p, fullName: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F3EAE0]/70 border border-[#E6D9D2] text-sm text-[#3E3A3C] focus:outline-none focus:border-[#3E3A3C]"
                    placeholder="Clara Lindqvist"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ship-addr"
                    className="block text-xs text-[#716D71] mb-1.5"
                  >
                    Street Address
                  </label>
                  <input
                    id="ship-addr"
                    type="text"
                    required
                    maxLength={200}
                    value={shippingForm.address}
                    onChange={(e) =>
                      setShippingForm((p) => ({ ...p, address: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F3EAE0]/70 border border-[#E6D9D2] text-sm text-[#3E3A3C] focus:outline-none focus:border-[#3E3A3C]"
                    placeholder="42 Maple Terrace, Apt 3B"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="ship-city"
                      className="block text-xs text-[#716D71] mb-1.5"
                    >
                      City
                    </label>
                    <input
                      id="ship-city"
                      type="text"
                      required
                      maxLength={80}
                      value={shippingForm.city}
                      onChange={(e) =>
                        setShippingForm((p) => ({ ...p, city: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-[#F3EAE0]/70 border border-[#E6D9D2] text-sm text-[#3E3A3C] focus:outline-none focus:border-[#3E3A3C]"
                      placeholder="Portland"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ship-postal"
                      className="block text-xs text-[#716D71] mb-1.5"
                    >
                      Postal Code
                    </label>
                    <input
                      id="ship-postal"
                      type="text"
                      required
                      maxLength={20}
                      value={shippingForm.postalCode}
                      onChange={(e) =>
                        setShippingForm((p) => ({
                          ...p,
                          postalCode: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-[#F3EAE0]/70 border border-[#E6D9D2] text-sm text-[#3E3A3C] focus:outline-none focus:border-[#3E3A3C]"
                      placeholder="97205"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ship-country"
                    className="block text-xs text-[#716D71] mb-1.5"
                  >
                    Country
                  </label>
                  <input
                    id="ship-country"
                    type="text"
                    required
                    maxLength={80}
                    value={shippingForm.country}
                    onChange={(e) =>
                      setShippingForm((p) => ({ ...p, country: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F3EAE0]/70 border border-[#E6D9D2] text-sm text-[#3E3A3C] focus:outline-none focus:border-[#3E3A3C]"
                  />
                </div>
              </div>

              {/* Compact Order Review */}
              <div className="pt-4 border-t border-[#E6D9D2] space-y-2 text-xs">
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#716D71]">
                  Order Summary ({totalCount} {totalCount === 1 ? 'piece' : 'pieces'})
                </p>
                {cart.map((item) => (
                  <div
                    key={item.lineId}
                    className="flex justify-between text-[#3E3A3C]"
                  >
                    <span>
                      {item.quantity} × {getGarmentTitle(item.col, item.row)} (
                      {item.size})
                    </span>
                    <span className="tabular-nums font-medium">
                      ${item.unitPrice * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {formError && <p className="text-xs text-red-700">{formError}</p>}
            </div>

            <div className="px-6 py-5 border-t border-[#E6D9D2] shrink-0 space-y-3">
              <div className="flex justify-between text-sm font-semibold text-[#3E3A3C]">
                <span>Total Due</span>
                <span className="tabular-nums">${grandTotal}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 bg-[#3E3A3C] text-[#F9F2E9] text-[11px] font-medium uppercase tracking-[0.28em] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Confirming Order…' : `Confirm Order — $${grandTotal}`}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ORDER CONFIRMED RECEIPT */}
        {step === 'confirmed' && confirmedOrder && (
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-[#3E3A3C]">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#716D71]">
                    Order Confirmed
                  </p>
                  <h3 className="text-xl font-medium tabular-nums">
                    {confirmedOrder.orderNumber}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-[#716D71] leading-relaxed">
                Thank you, {confirmedOrder.shippingInfo.fullName}. Your organic
                cotton basics are being wrapped in tissue paper and prepared for
                dispatch to {confirmedOrder.shippingInfo.city}.
              </p>

              <div className="bg-[#F3EAE0] border border-[#E6D9D2] p-5 space-y-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#716D71]">
                  Receipt Summary
                </p>
                <div className="space-y-2 text-sm">
                  {confirmedOrder.items.map((it, idx) => (
                    <div
                      key={`${it.productId}-${idx}`}
                      className="flex justify-between text-[#3E3A3C]"
                    >
                      <span>
                        {it.quantity} × {it.colourName} {it.kind} ({it.size})
                      </span>
                      <span className="tabular-nums">
                        ${it.unitPrice * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-[#E6D9D2] flex justify-between text-sm font-semibold text-[#3E3A3C]">
                  <span>Total Paid</span>
                  <span className="tabular-nums">${confirmedOrder.total}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setBagOpen(false);
                  setOrdersOpen(true);
                }}
                className="w-full py-3.5 px-6 bg-[#3E3A3C] text-[#F9F2E9] text-[11px] font-medium uppercase tracking-[0.28em] hover:opacity-90 transition-opacity cursor-pointer"
              >
                View Order History
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('bag');
                  setBagOpen(false);
                }}
                className="w-full py-3 px-6 border border-[#E6D9D2] text-[#3E3A3C] text-[11px] font-medium uppercase tracking-[0.26em] hover:border-[#3E3A3C] transition-colors cursor-pointer"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
