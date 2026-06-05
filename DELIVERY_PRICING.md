# Delivery pricing

Automatic customer delivery fee based on straight-line distance (Haversine) between the merchant branch and the customer GPS location at checkout.

## Settings (admin)

Stored in the `settings` table under key `delivery_pricing` (group: `delivery`).

| Field | Purpose |
|-------|---------|
| `pricePerKm` | **Customer** base price per kilometer (UZS). Admin UI: *Base price per kilometer*. Default: **3000**. |
| `baseFee` | Legacy field; customer formula uses **0** (distance-only pricing). |
| `minDeliveryFee` | Legacy field; customer formula uses **0**. |
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
distanceKm = haversine(restaurantLat, restaurantLng, customerLat, customerLng)
```

Rounded to 2 decimal places in the utility.

**Future:** Implement `DistanceCalculator` with OSRM, Google Directions, or Yandex Routing and inject it into `DeliveryPricingService` — checkout and order creation stay unchanged.

## Customer delivery fee formula

`backend/src/domain/delivery/delivery-fee.calculator.ts`:

```
rawFee = distanceKm × pricePerKm
deliveryFee = roundToNearest500(rawFee)
```

Example: 4.3 km × 3000 = 12 900 → **13 000 UZS**.

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

Web and mobile show:

- Products (subtotal)
- Delivery (computed amount)
- Total (subtotal − promo + delivery)

Delivery line updates when GPS coordinates change (`POST /orders/delivery-quote`).

## Admin order view

Order drawer shows distance (km), delivery fee (UZS), restaurant coordinates, and customer coordinates.

## Out of scope

- Courier live tracking
- Road routing (planned via `DistanceCalculator` swap)
- Free-delivery threshold enforcement (setting exists but not applied to customer fee yet)
