import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownOption {
  value: string;
  label: string;
}

interface StatusDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export const StatusDropdown = ({
  value,
  options,
  onChange,
  disabled = false,
  size = "md",
  className = "",
}: StatusDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [menuLeft, setMenuLeft] = useState(0);
  const [menuTop, setMenuTop] = useState(0);
  const [menuWidth, setMenuWidth] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const updatePlacement = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;

      const estimatedMenuHeight = Math.min(options.length * 38 + 8, 220);
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const preferUpward = size === "sm";

      const shouldOpenUpward =
        (preferUpward && spaceAbove >= estimatedMenuHeight + 12) ||
        (spaceBelow < estimatedMenuHeight + 12 && spaceAbove > spaceBelow);

      const verticalOffset = 6;
      const clampedLeft = Math.max(
        8,
        Math.min(rect.left, window.innerWidth - rect.width - 8)
      );

      setOpenUpward(shouldOpenUpward);
      setMenuLeft(clampedLeft);
      setMenuTop(shouldOpenUpward ? rect.top - verticalOffset : rect.bottom + verticalOffset);
      setMenuWidth(rect.width);
    };

    updatePlacement();

    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideTrigger = rootRef.current?.contains(target);
      const clickedInsideMenu = menuRef.current?.contains(target);

      if (!clickedInsideTrigger && !clickedInsideMenu) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const activeOption = options.find((opt) => opt.value === value) || options[0];

  const sizeClasses =
    size === "sm"
      ? "min-w-[120px] px-2.5 py-1.5 text-xs"
      : "min-w-[140px] px-3 py-2 text-sm";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 focus:border-blue-200 focus:ring-2 focus:ring-blue-50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses}`}
      >
        <span>{activeOption?.label || value}</span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        createPortal(
          <div
            ref={menuRef}
            style={{
              left: menuLeft,
              top: menuTop,
              width: menuWidth,
              transform: openUpward ? "translateY(-100%)" : "none",
            }}
            className="fixed z-[1000] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            <div className="max-h-56 overflow-y-auto">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
};
