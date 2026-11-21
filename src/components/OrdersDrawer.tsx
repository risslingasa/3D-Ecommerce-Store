import React, { useEffect } from 'react';
import { X, LogOut, RotateCcw } from 'lucide-react';
import { getSpritePosition } from '@/src/data/catalog';
import { useStore } from '@/src/context/StoreContext';

export function OrdersDrawer() {
  const {
    ordersOpen,
    setOrdersOpen,
    user,
    signInWithGoogle,
    logOut,
    authBusy,
    orders,
    ordersLoading,
    addToCart,
    showToast,
  } = useStore();

  useEffect(() => {
    if (!ordersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOrdersOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ordersOpen, setOrdersOpen]);

  if (!ordersOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Account and Order History"
      className="fixed inset-0 z-[80] bg-[#3E3A3C]/35 backdrop-blur-[2px] flex justify-end"
      onClick={() => setOrdersOpen(false)}
    >
      <aside
        className="w-full max-w-[460px] h-full bg-[#F9F2E9] border-l border-[#E6D9D2] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#E6D9D2] shrink-0">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#3E3A3C]">
            Account &amp; Orders
          </h2>
          <button
            type="button"
            onClick={() => setOrdersOpen(false)}
            aria-label="Close orders"
            className="w-8 h-8 rounded-full border border-[#E6D9D2] flex items-center justify-center text-[#3E3A3C] hover:border-[#3E3A3C] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!user ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#716D71]">
                BUNTO° Customer Account
              </p>
              <p className="mt-3 text-sm text-[#716D71] max-w-[30ch] leading-relaxed">
                Sign in with Google to keep your shopping bag synced across
                devices and access all past order receipts.
              </p>
              <button
                type="button"
                disabled={authBusy}
                onClick={() => void signInWithGoogle()}
                className="mt-6 py-3 px-6 bg-[#3E3A3C] text-[#F9F2E9] text-[11px] font-medium uppercase tracking-[0.26em] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {authBusy ? 'Signing In…' : 'Sign In with Google'}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Signed-In Profile Summary */}
              <div className="flex items-center justify-between pb-5 border-b border-[#E6D9D2]">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#3E3A3C] truncate">
                    {user.displayName || 'BUNTO Customer'}
                  </p>
                  <p className="text-xs text-[#716D71] truncate">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void logOut()}
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#716D71] hover:text-[#3E3A3C] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>

              {/* Order History List */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#716D71]">
                  Order History ({orders.length})
                </p>

                {ordersLoading ? (
                  <p className="mt-6 text-sm text-[#716D71]">
                    Loading your order receipts…
                  </p>
                ) : orders.length === 0 ? (
                  <p className="mt-6 text-sm text-[#716D71] leading-relaxed">
                    No orders yet. Once you confirm a bag at checkout, your
                    itemized receipts will appear here.
                  </p>
                ) : (
                  <div className="mt-4 space-y-5">
                    {orders.map((order) => {
                      const dateLabel = order.createdAt
                        ? order.createdAt.toDate().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Just now';

                      return (
                        <div
                          key={order.id}
                          className="border border-[#E6D9D2] bg-[#F3EAE0]/50 p-4 space-y-3"
                        >
                          <div className="flex items-baseline justify-between gap-2 pb-2.5 border-b border-[#E6D9D2]">
                            <div>
                              <p className="text-sm font-semibold tabular-nums text-[#3E3A3C]">
                                {order.orderNumber}
                              </p>
                              <p className="text-xs text-[#716D71]">
                                {dateLabel} · Confirmed · {order.shippingInfo.city}
                              </p>
                            </div>
                            <span className="text-sm font-semibold tabular-nums text-[#3E3A3C]">
                              ${order.total}
                            </span>
                          </div>

                          <ul className="space-y-2.5">
                            {order.items.map((item, idx) => (
                              <li
                                key={`${order.id}-${idx}`}
                                className="flex items-center gap-3"
                              >
                                <div className="w-11 h-11 bg-[#F9F2E9] shrink-0 flex items-center justify-center p-1">
                                  <div
                                    className="garment-sprite w-full h-full"
                                    style={{
                                      backgroundPosition: getSpritePosition(
                                        item.col,
                                        item.row
                                      ),
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-[#3E3A3C] truncate">
                                    {item.colourName} {item.kind}
                                  </p>
                                  <p className="text-[11px] text-[#716D71] tabular-nums">
                                    Size {item.size} · Qty {item.quantity} · $
                                    {item.unitPrice * item.quantity}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    void addToCart(item.col, item.row, item.size, 1);
                                    showToast(
                                      `Added ${item.colourName} ${item.kind} (${item.size}) to bag`
                                    );
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#716D71] hover:text-[#3E3A3C] cursor-pointer whitespace-nowrap"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Again
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
