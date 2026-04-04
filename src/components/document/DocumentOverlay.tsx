import { useEffect, type PropsWithChildren } from "react";
import { FiX } from "react-icons/fi";

interface OverlayBaseProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

interface DrawerProps extends OverlayBaseProps {
  side?: "left" | "right";
  widthClassName?: string;
}

interface ModalProps extends OverlayBaseProps {
  widthClassName?: string;
}

export const IconButton = ({
  children,
  className = "",
  title,
  onClick,
  disabled = false,
  type = "button",
}: PropsWithChildren<{
  className?: string;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}>) => (
  <button
    type={type}
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

export const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />
);

const OverlayFrame = ({
  open,
  onClose,
  children,
}: PropsWithChildren<{
  open: boolean;
  onClose: () => void;
}>) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {children}
    </div>
  );
};

const OverlayHeader = ({
  title,
  description,
  onClose,
}: {
  title: string;
  description?: string;
  onClose: () => void;
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      ) : null}
    </div>
    <IconButton title="Close" onClick={onClose} className="h-10 w-10 shrink-0">
      <FiX size={18} />
    </IconButton>
  </div>
);

export const Drawer = ({
  open,
  onClose,
  title,
  description,
  side = "right",
  widthClassName = "w-full max-w-[380px]",
  children,
}: PropsWithChildren<DrawerProps>) => (
  <OverlayFrame open={open} onClose={onClose}>
    <div
      className={`absolute inset-y-0 ${side === "right" ? "right-0" : "left-0"} ${widthClassName} border-slate-200 bg-white shadow-2xl`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex h-full flex-col">
        <OverlayHeader
          title={title}
          description={description}
          onClose={onClose}
        />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  </OverlayFrame>
);

export const Modal = ({
  open,
  onClose,
  title,
  description,
  widthClassName = "w-full max-w-[520px]",
  children,
}: PropsWithChildren<ModalProps>) => (
  <OverlayFrame open={open} onClose={onClose}>
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`${widthClassName} overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl`}
      >
        <OverlayHeader
          title={title}
          description={description}
          onClose={onClose}
        />
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  </OverlayFrame>
);
