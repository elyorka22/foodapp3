# Order lifecycle

Full delivery flow: **Customer → Manager → Courier**.

## Statuses

| Status | Alias (spec) | Who triggers | Description |
|--------|--------------|--------------|-------------|
| `PENDING` | PENDING | System | Order placed |
| `ACCEPTED` | — | Manager / restaurant | Order accepted |
| `PREPARING` | — | Manager / restaurant | Kitchen preparing |
| `COURIER_ASSIGNED` | ASSIGNED | Manager or courier accept | Courier linked to order |
| `ARRIVED_AT_RESTAURANT` | ARRIVED_AT_RESTAURANT | Courier | Courier at pickup point |
| `PICKED_UP` | PICKED_UP | Courier | Order collected |
| `DELIVERING` | DELIVERING | Courier | En route to customer |
| `DELIVERED` | DELIVERED | Courier | Completed |
| `CANCELLED` | CANCELLED | Manager / system | Cancelled |

## Transitions

```
PENDING → ACCEPTED | CANCELLED
ACCEPTED → PREPARING | CANCELLED
PREPARING → COURIER_ASSIGNED | CANCELLED
COURIER_ASSIGNED → ARRIVED_AT_RESTAURANT | CANCELLED
ARRIVED_AT_RESTAURANT → PICKED_UP | CANCELLED
PICKED_UP → DELIVERING
DELIVERING → DELIVERED
```

Courier self-accept from pool: `POST /orders/:id/accept` (requires online).

Manager assignment: `POST /orders/:id/assign-courier`.

## Courier actions

| Button | API |
|--------|-----|
| Accept | `POST /orders/:id/accept` |
| Decline | `POST /couriers/orders/:id/decline` |
| Arrived at restaurant | `PATCH /orders/:id/status` → `ARRIVED_AT_RESTAURANT` |
| Picked up | `PATCH /orders/:id/status` → `PICKED_UP` then `DELIVERING` |
| Delivered | `PATCH /orders/:id/status` → `DELIVERED` |

## Notifications

| Event | Customer | Manager | Courier |
|-------|----------|---------|---------|
| Courier assigned | ORDER_READY | — | ORDER_ASSIGNED |
| Order picked up | ORDER_DELIVERING | — | — |
| Order delivered | ORDER_COMPLETED | ORDER_DELIVERED (admin) | — |
| Courier declined | — | ORDER_PROBLEM + COURIER_DECLINED (admin) | — |

## Realtime

- Customer tracking: `GET /orders/track/:token` + polling (5s in mobile)
- WebSocket: `OrdersGateway` emits on every status change
- Manager dashboard: admin socket + 15s list refetch

## Frozen delivery snapshot

On order creation these fields never change:

- `customer_latitude`, `customer_longitude`
- `restaurant_latitude`, `restaurant_longitude`
- `distance_km` (Haversine × 1.3)
- `delivery_fee` (rounded to 500 UZS)
