"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/store";
import { setNotifications, markAllRead } from "@/store/slices/notificationSlice";
import api from "@/utils/api";
import { MdNotifications, MdClose, MdEco } from "react-icons/md";

export default function MainHeader() {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    api.get("/notifications").then((res) => {
      dispatch(setNotifications(res.data.data));
    }).catch(() => {});
  }, [dispatch]);

  const handleMarkAllRead = async () => {
    await api.patch("/notifications");
    dispatch(markAllRead());
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="lg:hidden flex items-center gap-2">
          <MdEco size={24} className="text-primary-700" />
          <span className="font-display font-bold text-primary-700">EcoTrack</span>
        </div>

        <div className="flex-1 lg:block hidden" />

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative w-10 h-10 bg-gray-100 hover:bg-primary-50 rounded-full flex items-center justify-center transition-colors"
            >
              <MdNotifications size={22} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:underline">
                        Tout lire
                      </button>
                      <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600">
                        <MdClose size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">
                        <span className="text-3xl">🔔</span>
                        <p className="text-sm mt-2">Aucune notification</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-primary-50/50" : ""}`}>
                          <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}