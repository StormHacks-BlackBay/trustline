import { useEffect, useId, useRef, type ReactNode } from "react";
import "./Sheet.css";

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Language and direction of the sheet's content, when it differs from the page. */
  lang?: string;
  dir?: "ltr" | "rtl";
}

/** Modal bottom sheet built on <dialog>, which handles focus trapping and Escape natively. */
export function Sheet({ open, title, onClose, children, lang, dir }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      onClose={onClose}
      lang={lang}
      dir={dir}
    >
      <div className="stack">
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
