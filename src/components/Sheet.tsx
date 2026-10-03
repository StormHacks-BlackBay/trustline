import { useEffect, useRef, type ReactNode } from "react";
import "./Sheet.css";

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Modal bottom sheet built on <dialog>, which handles focus trapping and Escape natively. */
export function Sheet({ open, title, onClose, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="sheet" aria-labelledby="sheet-title" onClose={onClose}>
      <div className="stack">
        <h2 id="sheet-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
