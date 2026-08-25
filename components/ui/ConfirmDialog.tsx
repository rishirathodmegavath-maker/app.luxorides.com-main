"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  confirmDisabled = false,
  children,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  confirmDisabled?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="lux-modal-backdrop fixed inset-0 z-40"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="
              fixed z-50 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2
              top-1/2 -translate-y-1/2
              max-w-sm w-full
              lux-panel
              rounded-3xl
              p-6 text-white
            "
          >
            <h3 className="text-lg font-semibold">{title}</h3>

            {description && (
              <p className="mt-2 text-sm text-white/70">
                {description}
              </p>
            )}

            {children && <div className="mt-4">{children}</div>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="
                  px-4 py-2 rounded-xl
                  lux-control
                  transition
                "
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                disabled={confirmDisabled}
                className={`
                  px-4 py-2 rounded-xl font-medium
                  transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    danger
                      ? "bg-rose-500/80 hover:bg-rose-500"
                      : "bg-white text-black hover:bg-white/90"
                  }
                `}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
