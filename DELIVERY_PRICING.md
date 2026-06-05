# Delivery pricing

Automatic customer delivery fee based on straight-line distance (Haversine) between the merchant branch and the customer GPS location at checkout.

## Settings (admin)

Stored in the `settings` table under key `delivery_pricing` (group: `delivery`).

| Field | Purpose | Default |
|-------|---------|---------|
| `baseDeliveryFee` | Flat base fee (UZS) | **8000** |
| `perKmFee` | Fee per billable km (UZS) | **1500** |
| `maxDeliveryDistance` | Maximum delivery radius (km) | **10** |
| `courierPricePerKm` | Courier payout calculation (separate) | 1500 |
| `courierMinFee` | Minimum courier fee | 5000 |

Admin path: **Settings → Delivery pricing**.

Legacy keys (`pricePerKm`, `baseFee`, `roadDistanceFactor`) are normalized on read for backward compatibility.

## Formula

```
straightLineKm = haversine(restaurant, customer)
distanceKm = straightLineKm × 1.3
rawFee = baseDeliveryFee + (distanceKm × perKmFee)
deliveryFee = roundToNearest500(rawFee)
```

Example: 1 km straight → 1.3 km billable → 8000 + (1.3 × 1500) = 9950 → **10 000 UZS**.

Orders beyond `maxDeliveryDistance` are rejected at quote and checkout.

## Merchant coordinates

Delivery origin is the merchant **primary branch** (`restaurant_branches`):

- `latitude`, `longitude` (required for fee calculation)
- `address`

Admin sets coordinates in **Restaurants** create/edit:

- Manual lat/lng entry
- **Open map picker** (Leaflet + OpenStreetMap)
- Coordinates shown on restaurant detail page

## Customer location

At checkout the customer selects GPS location. Web and mobile auto-fetch delivery quote when coordinates are set.

## APIs

| Endpoint | Description |
|----------|-------------|
| `POST /orders/delivery-quote` | Preview fee + distance for checkout |
| `POST /orders/guest` | Creates order; freezes fee + distance + coords |

## Order storage (frozen snapshot)

On `orders` (never updated after creation):

| Column | Description |
|--------|-------------|
| `distance_km` | Billable km (× 1.3) at order time |
| `delivery_fee` | Rounded customer fee |
| `restaurant_latitude` / `restaurant_longitude` | Branch coords |
| `customer_latitude` / `customer_longitude` | Customer coords |

## Implementation

- `backend/src/domain/delivery/delivery-fee.calculator.ts`
- `backend/src/domain/delivery/delivery-pricing.service.ts`
- `backend/src/modules/settings/settings.service.ts`
