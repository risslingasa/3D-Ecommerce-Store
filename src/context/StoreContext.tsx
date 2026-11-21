import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore';
import {
  auth,
  browserPopupRedirectResolver,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '@/src/lib/firebase';
import {
  COLOURWAYS,
  FREE_SHIPPING_THRESHOLD,
  getColourByRow,
  getProductByCol,
  STANDARD_SHIPPING_COST,
} from '@/src/data/catalog';

export interface CartItem {
  lineId: string;
  productId: string;
  col: number;
  row: number;
  kind: string;
  colourName: 'Peach' | 'Pink' | 'Sage' | 'Butter';
  size: string;
  unitPrice: number;
  quantity: number;
}

export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    kind: string;
    colourName: 'Peach' | 'Pink' | 'Sage' | 'Butter';
    col: number;
    row: number;
    size: string;
    unitPrice: number;
    quantity: number;
  }>;
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  status: 'confirmed';
  shippingInfo: ShippingInfo;
  createdAt?: Timestamp | null;
}

export interface PdpSelection {
  col: number;
  row: number;
}

interface StoreContextValue {
  user: User | null;
  authReady: boolean;
  authBusy: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<User | null>;
  logOut: () => Promise<void>;

  cart: CartItem[];
  totalCount: number;
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  addToCart: (col: number, row: number, size?: string, qty?: number) => Promise<void>;
  updateQuantity: (lineId: string, delta: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;

  orders: OrderRecord[];
  ordersLoading: boolean;
  placeOrder: (shippingInfo: ShippingInfo) => Promise<OrderRecord>;

  pdpSelection: PdpSelection | null;
  openPdp: (col: number, row: number) => void;
  closePdp: () => void;

  bagOpen: boolean;
  setBagOpen: (open: boolean) => void;

  sizeGuideOpen: boolean;
  sizeGuideContextCol: number | null;
  openSizeGuide: (col?: number | null) => void;
  closeSizeGuide: () => void;
  onSelectSizeFromGuide: ((size: string) => void) | null;
  registerSizeGuideCallback: (cb: ((size: string) => void) | null) => void;

  ordersOpen: boolean;
  setOrdersOpen: (open: boolean) => void;

  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const GUEST_CART_KEY = 'bunto_guest_cart_v1';

function buildLineId(productId: string, row: number, size: string): string {
  const safeSize = size.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${productId}_r${row}_${safeSize}`.slice(0, 96);
}

function loadGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        item &&
        typeof item.lineId === 'string' &&
        typeof item.col === 'number' &&
        typeof item.row === 'number' &&
        typeof item.quantity === 'number' &&
        item.quantity >= 1
    );
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota issues in restricted iframes
  }
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReadyUid, setProfileReadyUid] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => loadGuestCart());
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [pdpSelection, setPdpSelection] = useState<PdpSelection | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeGuideContextCol, setSizeGuideContextCol] = useState<number | null>(null);
  const [onSelectSizeFromGuide, setOnSelectSizeFromGuide] = useState<
    ((size: string) => void) | null
  >(null);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  const ensureUserProfile = useCallback(async (u: User) => {
    const userPath = `users/${u.uid}`;
    const userRef = doc(db, 'users', u.uid);
    const displayName = (u.displayName || 'LUNO Customer').trim().slice(0, 100);
    const email = (u.email || 'customer@luno.store').trim().slice(0, 254);

    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: u.uid,
          displayName,
          email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userRef, {
          displayName,
          email,
          updatedAt: serverTimestamp(),
        });
      }
      setProfileReadyUid(u.uid);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  }, []);

  // Merge any local guest cart items into Firestore once profile exists
  const mergeGuestCartIntoFirestore = useCallback(async (uid: string) => {
    const guestItems = loadGuestCart();
    if (guestItems.length === 0) return;

    for (const item of guestItems) {
      const lineRef = doc(db, 'users', uid, 'cart', item.lineId);
      const path = `users/${uid}/cart/${item.lineId}`;
      try {
        const existingSnap = await getDoc(lineRef);
        if (existingSnap.exists()) {
          const prevQty = Number(existingSnap.data().quantity || 1);
          const nextQty = Math.min(20, prevQty + item.quantity);
          await updateDoc(lineRef, {
            quantity: nextQty,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(lineRef, {
            userId: uid,
            productId: item.productId,
            col: item.col,
            row: item.row,
            kind: item.kind,
            colourName: item.colourName,
            size: item.size,
            unitPrice: item.unitPrice,
            quantity: Math.min(20, Math.max(1, item.quantity)),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    saveGuestCart([]);
  }, []);

  // Auth listener + redirect result recovery
  useEffect(() => {
    void getRedirectResult(auth).catch((err) => {
      console.error('Google redirect resolution error:', err);
    });

    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) {
        setAuthError(null);
        try {
          await ensureUserProfile(nextUser);
          await mergeGuestCartIntoFirestore(nextUser.uid);
        } catch (err) {
          console.error('Failed syncing user profile:', err);
          showToast('Signed in, but could not sync saved bag right now.');
        }
      } else {
        setProfileReadyUid(null);
        setOrders([]);
        setCart(loadGuestCart());
      }
    });
    return () => unsub();
  }, [ensureUserProfile, mergeGuestCartIntoFirestore, showToast]);

  // Firestore real-time cart & orders listeners (only when authenticated & profile ready)
  useEffect(() => {
    if (!authReady || !user || profileReadyUid !== user.uid) return;

    const cartPath = `users/${user.uid}/cart`;
    const cartQuery = query(
      collection(db, 'users', user.uid, 'cart'),
      where('userId', '==', user.uid)
    );
    const unsubCart = onSnapshot(
      cartQuery,
      (snap) => {
        const items: CartItem[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            lineId: d.id,
            productId: String(data.productId),
            col: Number(data.col),
            row: Number(data.row),
            kind: String(data.kind),
            colourName: data.colourName as CartItem['colourName'],
            size: String(data.size),
            unitPrice: Number(data.unitPrice),
            quantity: Number(data.quantity),
          };
        });
        items.sort((a, b) => a.lineId.localeCompare(b.lineId));
        setCart(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, cartPath);
      }
    );

    const ordersPath = `users/${user.uid}/orders`;
    setOrdersLoading(true);
    const ordersQuery = query(
      collection(db, 'users', user.uid, 'orders'),
      where('userId', '==', user.uid)
    );
    const unsubOrders = onSnapshot(
      ordersQuery,
      (snap) => {
        const list: OrderRecord[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            orderNumber: String(data.orderNumber),
            items: Array.isArray(data.items) ? data.items : [],
            itemCount: Number(data.itemCount || 0),
            subtotal: Number(data.subtotal || 0),
            shipping: Number(data.shipping || 0),
            total: Number(data.total || 0),
            status: 'confirmed',
            shippingInfo: data.shippingInfo as ShippingInfo,
            createdAt: (data.createdAt as Timestamp | null) || null,
          };
        });
        list.sort((a, b) => {
          const ta = a.createdAt?.toMillis() ?? Date.now();
          const tb = b.createdAt?.toMillis() ?? Date.now();
          return tb - ta;
        });
        setOrders(list);
        setOrdersLoading(false);
      },
      (error) => {
        setOrdersLoading(false);
        handleFirestoreError(error, OperationType.LIST, ordersPath);
      }
    );

    return () => {
      unsubCart();
      unsubOrders();
    };
  }, [authReady, user, profileReadyUid]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Call signInWithPopup synchronously first to preserve browser user-gesture activation
    const popupPromise = signInWithPopup(
      auth,
      googleProvider,
      browserPopupRedirectResolver
    );
    setAuthBusy(true);
    setAuthError(null);
    try {
      const result = await popupPromise;
      showToast(`Signed in as ${result.user.displayName || result.user.email}`);
      return result.user;
    } catch (error: unknown) {
      const firebaseErr = error as { code?: string; message?: string };
      const code = firebaseErr?.code || '';
      console.error('Google Sign-In error:', code, error);

      if (code === 'auth/popup-closed-by-user') {
        showToast('Google Sign-In window was closed before finishing.');
        return null;
      }

      let friendly = 'Unable to complete Google Sign-In. Please allow popups and try again.';
      if (code === 'auth/popup-blocked') {
        friendly =
          'Your browser blocked the Google Sign-In popup. Allow popups for this site in your address bar, then click Try Again.';
      } else if (code === 'auth/unauthorized-domain') {
        const host = window.location.hostname || 'this domain';
        friendly = `Google Sign-In is not yet authorized for "${host}". Add this domain in Firebase Console → Authentication → Settings → Authorized domains.`;
      } else if (code === 'auth/operation-not-allowed') {
        friendly =
          'Google Sign-In is disabled for this Firebase project. Enable the Google provider in Firebase Console → Authentication.';
      } else if (code === 'auth/cancelled-popup-request') {
        friendly =
          'A sign-in popup is already open. Check your browser windows or click Try Again.';
      } else if (code === 'auth/network-request-failed') {
        friendly =
          'Network error contacting Google Sign-In. Check your connection and try again.';
      } else if (code) {
        friendly = `Google Sign-In failed (${code}). Please allow popups and try again.`;
      }

      setAuthError(friendly);
      showToast(friendly);
      return null;
    } finally {
      setAuthBusy(false);
    }
  }, [showToast]);

  const logOut = useCallback(async () => {
    await signOut(auth);
    setOrdersOpen(false);
    showToast('Signed out');
  }, [showToast]);

  const addToCart = useCallback(
    async (col: number, row: number, size?: string, qty = 1) => {
      const product = getProductByCol(col);
      const colour = getColourByRow(row);
      const chosenSize = (size && product.sizes.includes(size) ? size : product.defaultSize).slice(
        0,
        16
      );
      const lineId = buildLineId(product.id, colour.row, chosenSize);
      const safeQty = Math.min(20, Math.max(1, Math.round(qty)));

      if (!user || profileReadyUid !== user.uid) {
        setCart((prev) => {
          const existing = prev.find((i) => i.lineId === lineId);
          const next = existing
            ? prev.map((i) =>
                i.lineId === lineId
                  ? { ...i, quantity: Math.min(20, i.quantity + safeQty) }
                  : i
              )
            : [
                ...prev,
                {
                  lineId,
                  productId: product.id,
                  col: product.col,
                  row: colour.row,
                  kind: product.kind,
                  colourName: colour.name,
                  size: chosenSize,
                  unitPrice: product.price,
                  quantity: safeQty,
                },
              ];
          saveGuestCart(next);
          return next;
        });
        return;
      }

      const lineRef = doc(db, 'users', user.uid, 'cart', lineId);
      const path = `users/${user.uid}/cart/${lineId}`;
      try {
        const snap = await getDoc(lineRef);
        if (snap.exists()) {
          const currentQty = Number(snap.data().quantity || 1);
          await updateDoc(lineRef, {
            quantity: Math.min(20, currentQty + safeQty),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(lineRef, {
            userId: user.uid,
            productId: product.id,
            col: product.col,
            row: colour.row,
            kind: product.kind.slice(0, 40),
            colourName: COLOURWAYS[colour.row]?.name || 'Peach',
            size: chosenSize,
            unitPrice: product.price,
            quantity: safeQty,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    },
    [user, profileReadyUid]
  );

  const updateQuantity = useCallback(
    async (lineId: string, delta: number) => {
      const target = cart.find((i) => i.lineId === lineId);
      if (!target) return;
      const nextQty = target.quantity + delta;

      if (!user || profileReadyUid !== user.uid) {
        setCart((prev) => {
          const next =
            nextQty <= 0
              ? prev.filter((i) => i.lineId !== lineId)
              : prev.map((i) =>
                  i.lineId === lineId ? { ...i, quantity: Math.min(20, nextQty) } : i
                );
          saveGuestCart(next);
          return next;
        });
        return;
      }

      const lineRef = doc(db, 'users', user.uid, 'cart', lineId);
      const path = `users/${user.uid}/cart/${lineId}`;
      try {
        if (nextQty <= 0) {
          await deleteDoc(lineRef);
        } else {
          await updateDoc(lineRef, {
            quantity: Math.min(20, nextQty),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [cart, user, profileReadyUid]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!user || profileReadyUid !== user.uid) {
        setCart((prev) => {
          const next = prev.filter((i) => i.lineId !== lineId);
          saveGuestCart(next);
          return next;
        });
        return;
      }

      const lineRef = doc(db, 'users', user.uid, 'cart', lineId);
      const path = `users/${user.uid}/cart/${lineId}`;
      try {
        await deleteDoc(lineRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user, profileReadyUid]
  );

  const totalCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const shippingCost = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  }, [subtotal]);

  const grandTotal = subtotal + shippingCost;

  const placeOrder = useCallback(
    async (shippingInfo: ShippingInfo): Promise<OrderRecord> => {
      if (!user) {
        throw new Error('Please sign in with Google to place your order.');
      }
      if (cart.length === 0) {
        throw new Error('Your shopping bag is empty.');
      }

      const sanitizedShipping: ShippingInfo = {
        fullName: shippingInfo.fullName.trim().slice(0, 100),
        address: shippingInfo.address.trim().slice(0, 200),
        city: shippingInfo.city.trim().slice(0, 80),
        postalCode: shippingInfo.postalCode.trim().slice(0, 20),
        country: shippingInfo.country.trim().slice(0, 80),
      };

      const boundedItems = cart.slice(0, 20).map((item) => ({
        productId: item.productId.slice(0, 64),
        kind: item.kind.slice(0, 40),
        colourName: item.colourName,
        col: item.col,
        row: item.row,
        size: item.size.slice(0, 16),
        unitPrice: item.unitPrice,
        quantity: Math.min(20, Math.max(1, item.quantity)),
      }));

      const orderItemsCount = boundedItems.reduce((s, i) => s + i.quantity, 0);
      const orderSubtotal = boundedItems.reduce(
        (s, i) => s + i.unitPrice * i.quantity,
        0
      );
      const orderShipping =
        orderSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
      const orderTotal = orderSubtotal + orderShipping;

      const randomDigits = String(Math.floor(100000 + Math.random() * 900000));
      const orderNumber = `BNT-${randomDigits}`;
      const orderId = `ord_${Date.now()}_${randomDigits}`;
      const orderPath = `users/${user.uid}/orders/${orderId}`;

      const orderDocData = {
        userId: user.uid,
        orderNumber,
        items: boundedItems,
        itemCount: orderItemsCount,
        subtotal: orderSubtotal,
        shipping: orderShipping,
        total: orderTotal,
        status: 'confirmed' as const,
        shippingInfo: sanitizedShipping,
        createdAt: serverTimestamp(),
      };

      try {
        const batch = writeBatch(db);
        const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
        batch.set(orderRef, orderDocData);

        for (const item of cart) {
          const cartRef = doc(db, 'users', user.uid, 'cart', item.lineId);
          batch.delete(cartRef);
        }

        await batch.commit();

        return {
          id: orderId,
          orderNumber,
          items: boundedItems,
          itemCount: orderItemsCount,
          subtotal: orderSubtotal,
          shipping: orderShipping,
          total: orderTotal,
          status: 'confirmed',
          shippingInfo: sanitizedShipping,
          createdAt: null,
        };
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, orderPath);
      }
    },
    [cart, user]
  );

  const openPdp = useCallback((col: number, row: number) => {
    setPdpSelection({ col, row });
  }, []);

  const closePdp = useCallback(() => {
    setPdpSelection(null);
  }, []);

  const openSizeGuide = useCallback((col: number | null = null) => {
    setSizeGuideContextCol(col);
    setSizeGuideOpen(true);
  }, []);

  const closeSizeGuide = useCallback(() => {
    setSizeGuideOpen(false);
  }, []);

  const registerSizeGuideCallback = useCallback(
    (cb: ((size: string) => void) | null) => {
      setOnSelectSizeFromGuide(() => cb);
    },
    []
  );

  const value: StoreContextValue = {
    user,
    authReady,
    authBusy,
    authError,
    clearAuthError,
    signInWithGoogle,
    logOut,
    cart,
    totalCount,
    subtotal,
    shippingCost,
    grandTotal,
    addToCart,
    updateQuantity,
    removeItem,
    orders,
    ordersLoading,
    placeOrder,
    pdpSelection,
    openPdp,
    closePdp,
    bagOpen,
    setBagOpen,
    sizeGuideOpen,
    sizeGuideContextCol,
    openSizeGuide,
    closeSizeGuide,
    onSelectSizeFromGuide,
    registerSizeGuideCallback,
    ordersOpen,
    setOrdersOpen,
    menuOpen,
    setMenuOpen,
    toastMessage,
    showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
