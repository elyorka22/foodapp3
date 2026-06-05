# Delivery pricing

Automatic customer delivery fee based on straight-line distance (Haversine) between the merchant branch and the customer GPS location at checkout.

## Settings (admin)

Stored in the `settings` table under key `delivery_pricing` (group: `delivery`).

| Field | Purpose |
|-------|---------|
| `pricePerKm` | **Customer** base price per kilometer (UZS). Admin UI: *Base price per kilometer*. Default: **3000**. |
| `roadDistanceFactor` | Multiplier on straight-line km to approximate road distance. Default: **1.35** (+35%). |
| `baseFee` | Optional flat fee added before rounding. Default: **0**. |
| `minDeliveryFee` | Minimum customer delivery fee after rounding. Default: **0**. |
| `courierPricePerKm` | Courier payout calculation (separate from customer fee). |
| `courierMinFee` | Minimum courier fee. |

Admin path: **Settings → Delivery → Base price per kilometer**.

Changing `pricePerKm` affects **new quotes and new orders only**. Existing orders keep frozen `deliveryFee`, `distanceKm`, and coordinate snapshots.

## Merchant coordinates

Delivery origin is the merchant **primary branch** (`restaurant_branches`):

- `latitude`, `longitude` (required for fee calculation)
- `address`

Admin sets coordinates in **Restaurants** / **Stores** create/edit forms (manual entry + OpenStreetMap preview link). On save, the first branch is created or updated.

## Customer location

At checkout the customer must:

1. Enter delivery address (text)
2. Tap **Send location** (GPS) — `latitude` / `longitude` are sent with the order

Without valid coordinates, checkout cannot complete and delivery fee is not shown.

## Distance calculation

**Current:** `HaversineDistanceCalculator` in `backend/src/domain/delivery/distance-calculator.ts`.

```
straightLineKm = haversine(restaurantLat, restaurantLng, customerLat, customerLng)
billableDistanceKm = straightLineKm × roadDistanceFactor
```

Straight-line km is stored on the order as `distance_km`. Customer fee uses `billableDistanceKm` (shown in checkout UI).

**Future:** Implement `DistanceCalculator` with OSRM, Google Directions, or Yandex Routing and inject it into `DeliveryPricingService` — checkout and order creation stay unchanged.

## Customer delivery fee formula

`backend/src/domain/delivery/delivery-fee.calculator.ts`:

```
rawFee = baseFee + billableDistanceKm × pricePerKm
deliveryFee = max(minDeliveryFee, roundToNearest500(rawFee))
```

Example: 3.2 km straight × 1.35 = 4.32 billable km; 4.32 × 3000 = 12 960 → **13 000 UZS**.

## APIs

| Endpoint | Description |
|----------|-------------|
| `POST /orders/delivery-quote` | Preview `{ distanceKm, deliveryFee, pricePerKm, coordinates }` for checkout UI |
| `POST /orders/guest` | Creates order; recomputes and **freezes** fee + distance + coords |

## Order storage (frozen snapshot)

On `orders`:

| Column | Description |
|--------|-------------|
| `distance_km` | Distance at order time |
| `delivery_fee` | Rounded customer fee |
| `restaurant_latitude` / `restaurant_longitude` | Branch coords at order time |
| `customer_latitude` / `customer_longitude` | Customer coords at order time |

Also stored on `guest_orders` and `addresses` for delivery workflow.

## Checkout UI

Flow:

1. Customer enters address and taps **Yetkazish narxini hisoblash** (send GPS).
2. App calls `POST /orders/delivery-quote` and shows distance + delivery fee in a green banner.
3. **Place order** stays disabled until the quote succeeds.

Web and mobile show:

- Products (subtotal)
- Delivery (computed amount)
- Total (subtotal − promo + delivery)

## Admin order view

Order drawer shows distance (km), delivery fee (UZS), restaurant coordinates, and customer coordinates.

## Out of scope

- Courier live tracking
- Road routing (planned via `DistanceCalculator` swap)
- Free-delivery threshold enforcement (setting exists but not applied to customer fee yet)
