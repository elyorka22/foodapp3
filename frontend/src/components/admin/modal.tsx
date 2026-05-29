'use client';

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="absolute left-1/2 top-1/2 max-h-[90vh] w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-white p-5 shadow-xl dark:border-white/10 dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button type="button" className="text-sm opacity-60" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
