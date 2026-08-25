"use client";
import { motion } from "motion/react";

const containerVariants = {
  hidden: {
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.2,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function VariantsExample() {
  const items = ["One", "Two", "Three", "Four"];

  return (
    <motion.ul
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, i) => (
        <motion.li
          key={i}
          variants={itemVariants}
          className="p-4 bg-blue-500 text-white rounded-lg"
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
