'use client';

export type OrderLineItem = {
  id?: string;
  name: string;
  description?: string | null;
  quantity: number;
  subtotal?: number | string;
};

export function OrderLineItems({
  items,
  showSubtotal = false,
  className = '',
}: {
  items: OrderLineItem[];
  showSubtotal?: boolean;
  className?: string;
}) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;

  return (
    <ul className={`space-y-2 ${className}`}>
      {list.map((item, idx) => (
        <li key={item.id ?? `${item.name}-${idx}`} className="text-sm">
          <div className="flex justify-between gap-2">
            <span className="font-medium">
              {item.name} × {item.quantity}
            </span>
            {showSubtotal && item.subtotal != null && (
              <span className="shrink-0 text-zinc-600">
                {Number(item.subtotal).toLocaleString()} UZS
              </span>
            )}
          </div>
          {item.description?.trim() && (
            <p className="mt-0.5 text-xs text-zinc-500">{item.description.trim()}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
