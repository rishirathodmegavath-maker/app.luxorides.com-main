"use client";

import { motion, type Variants } from "motion/react";
import { useEffect, useRef } from "react";
import styles from "./AnimatedOtpInput.module.css";

export type OtpStatus = "idle" | "verifying" | "success" | "error";

// 52px box + 16px gap, matching the CSS module's .box sizing.
const BOX_PITCH = 68;

export interface AnimatedOtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  status: OtpStatus;
  /** Fires once, exactly when the row transitions from incomplete to fully filled. */
  onComplete?: (code: string) => void;
}

/**
 * Ported from the purchased "Animated OTP Verification" template (merge-to-checkmark
 * sequence) -- same motion language and timings as the driver app's copy of this
 * component, recolored to this app's own --lux-* tokens instead of the driver app's
 * palette, and wired to this app's real OTP verification flow.
 */
export function AnimatedOtpInput({ length = 6, value, onChange, status, onComplete }: AnimatedOtpInputProps) {
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const firedRef = useRef(false);

  useEffect(() => {
    const complete = digits.every((d) => d !== "");
    if (complete && !firedRef.current) {
      firedRef.current = true;
      inputRefs.current.forEach((el) => el?.blur());
      onComplete?.(digits.join(""));
    }
    if (!complete) {
      firedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const locked = status === "verifying" || status === "success";

  function setDigit(index: number, char: string) {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join(""));
  }

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    if (locked) return;
    const raw = e.target.value;
    const char = raw.slice(-1);
    if (char && !/^[0-9]$/.test(char)) return;
    setDigit(index, char);
    if (char && index < length - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (locked) return;
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    if (locked) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length).split("");
    if (pasted.length === 0) return;
    const next = digits.slice();
    pasted.forEach((ch, i) => {
      next[i] = ch;
    });
    onChange(next.join(""));
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  const centerIndex = (length - 1) / 2;
  const animateState = status === "error" ? "error" : status === "success" ? "success" : "idle";

  const boxVariants: Variants = {
    idle: { x: 0, rotate: 0, scale: 1, opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
    error: { x: [0, -10, 10, -8, 8, 0], transition: { duration: 0.4, ease: "easeInOut" } },
    success: (i: number) => {
      const delay = 1.0;
      if (i === 0) {
        return {
          x: [0, BOX_PITCH * centerIndex, BOX_PITCH * centerIndex],
          rotate: [0, 12, 0],
          scale: [1, 0.95, 1.15, 1],
          zIndex: 4,
          transition: { duration: 0.9, times: [0, 0.5, 0.7, 1], delay, ease: [0.25, 1, 0.5, 1] },
        };
      }
      return {
        x: (centerIndex - i) * 36,
        rotate: (i % 2 === 0 ? 1 : -1) * (6 + i * 2),
        scale: [1, 0.85, 0],
        opacity: [1, 1, 0],
        zIndex: length - i,
        transition: { duration: 0.6, times: [0, 0.8, 1], delay, ease: "easeInOut" },
      };
    },
  };

  const textVariants: Variants = {
    idle: { color: "#ffffff" },
    error: { color: "var(--otp-danger)" },
    success: { color: "rgba(255,255,255,0)", transition: { delay: 1.0, duration: 0.2 } },
  };

  const tickContainerVariants: Variants = {
    idle: { opacity: 0, scale: 0.5, x: "-50%", y: "-50%" },
    error: { opacity: 0, scale: 0.5, x: "-50%", y: "-50%" },
    success: {
      opacity: 1,
      scale: 1,
      x: "-50%",
      y: "-50%",
      transition: { delay: 1.45, duration: 0.5, type: "spring", stiffness: 250, damping: 20 },
    },
  };

  const tickPathVariants: Variants = {
    idle: { pathLength: 0 },
    error: { pathLength: 0 },
    success: { pathLength: 1, transition: { delay: 1.5, duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div
      className={`${styles.row} ${status === "success" ? styles.rowComplete : ""} ${status === "error" ? styles.rowError : ""}`}
      onPaste={handlePaste}
      data-testid="otp-row"
    >
      {digits.map((digit, index) => (
        <motion.div key={index} className={styles.box} custom={index} variants={boxVariants} initial="idle" animate={animateState}>
          <motion.input
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            readOnly={locked}
            className={styles.input}
            variants={textVariants}
            initial="idle"
            animate={animateState}
            aria-label={`OTP digit ${index + 1}`}
          />
          {index === 0 && (
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              className={styles.tick}
              variants={tickContainerVariants}
              initial="idle"
              animate={animateState}
            >
              <motion.path d="M5 13l4 4L19 7" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" variants={tickPathVariants} />
            </motion.svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}
