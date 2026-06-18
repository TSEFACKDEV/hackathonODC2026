"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { MdEco } from "react-icons/md";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-light py-8 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8"
        >
          {/* Logo ou header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mb-3">
              <MdEco className="text-2xl text-primary-700" />
            </div>
            <h1 className="text-xl font-display font-bold text-gray-900">EcoTrack</h1>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}