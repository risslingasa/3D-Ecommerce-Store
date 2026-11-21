# BUNTO° Security Specification & Dirty Dozen Threat Matrix

## 1. Data Invariants

1. Every customer profile at `/users/{userId}` can only be read, created, or updated by the verified authenticated user whose `request.auth.uid == userId`. No user can list `/users`.
2. Every cart item at `/users/{userId}/cart/{lineId}` belongs to an existing `/users/{userId}` parent document, enforces `userId == request.auth.uid`, constrains `col` (0–4), `row` (0–3), `colourName` (`Peach | Pink | Sage | Butter`), `quantity` (1–20), and `unitPrice` (1–500), and requires server timestamps (`request.time`).
3. Every order at `/users/{userId}/orders/{orderId}` belongs to an existing `/users/{userId}` parent document, enforces `userId == request.auth.uid`, requires `status == 'confirmed'`, strictly bounds `items` to 1–20 validated maps, enforces shipping address length bounds, and is strictly immutable (no client updates or deletes).

## 2. The "Dirty Dozen" Malicious Payloads (All Must Return PERMISSION_DENIED)

1. **Cross-user profile read (PII leak)**: User B calls `get(/users/userA)`.
2. **Profile collection scrape**: User A calls `list(/users)`.
3. **Unverified email write**: Unverified token (`email_verified: false`) creates `/users/userA`.
4. **Shadow field injection on profile**: User A creates `/users/userA` with extra field `isAdmin: true`.
5. **Immutable timestamp tampering**: User A updates `/users/userA` modifying `createdAt`.
6. **Client-forged timestamp**: User A creates `/users/userA/cart/0-0-1-2Y` with `createdAt` != `request.time`.
7. **Orphaned cart write (Master Gate bypass)**: User A writes `/users/userA/cart/0-0-1-2Y` before `/users/userA` exists.
8. **ID poisoning (Denial of Wallet)**: User A creates `/users/userA/cart/<200-char-invalid-id!@#>` or invalid regex path ID.
9. **Identity spoofing in cart item**: User A writes `/users/userA/cart/0-0-1-2Y` with `userId: "userB"`.
10. **Quantity/value poisoning on cart update**: User A updates cart item with `quantity: 9999` or `unitPrice: -50`.
11. **Order tampering after placement**: User A attempts `update` or `delete` on `/users/userA/orders/ord1` to change `total` or `status`.
12. **Unbounded order array / bad shipping info**: User A creates `/users/userA/orders/ord2` with 25 items or a 10KB `shippingInfo.address` string.
