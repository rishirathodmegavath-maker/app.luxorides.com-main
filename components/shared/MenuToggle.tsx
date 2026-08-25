"use client";
import { useState, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

export default function SidebarMenu() {
  const [open, setOpen] = useState(false);
  const cartRef = useRef<HTMLButtonElement>(null);

  // Track cart icon position for precise morph origin
  const [origin, setOrigin] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (cartRef.current) {
      const rect = cartRef.current.getBoundingClientRect();
      setOrigin({ top: rect.top, left: rect.left });
    }
  }, []);

  return (
    <div className="relative">
      {/* CART ICON BUTTON */}
      <button
        ref={cartRef}
        onClick={() => setOpen(true)}
        className="lux-control p-2 rounded-full relative z-[100]"
      >
        <ShoppingCart className="text-white" size={22} />
      </button>

      {/* MORPHING CIRCLE → SIDEBAR */}
      <motion.div
        className="fixed bg-white z-40 origin-center"
        initial={false}
        animate={
          open
            ? {
                width: 300,
                height: "100vh",
                top: 0,
                left: 0,
                borderRadius: "1.2rem",
                transition: {
                  type: "spring",
                  stiffness: 150,
                  damping: 25,
                  restDelta: 0.5,
                },
              }
            : {
                width: 48,
                height: 48,
                top: origin.top,
                left: origin.left,
                borderRadius: "999px",
                transition: {
                  type: "spring",
                  stiffness: 150,
                  damping: 25,
                },
              }
        }
      />

      {/* SIDEBAR CONTENT */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed top-0 left-0 w-[300px] h-screen z-50 px-8 pt-20"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ delay: 0.25 }}
          >
            {/* CLOSE BUTTON (X) */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full 
                         bg-black/10 flex items-center justify-center text-black text-2xl"
            >
              ×
            </button>

            {/* MENU ITEMS */}
            <nav className="flex flex-col gap-6 text-black text-xl font-semibold mt-6">
              <span>Home</span>
              <span>Profile</span>
              <span>Settings</span>
              <span>Logout</span>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
