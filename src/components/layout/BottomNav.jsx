import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  MoreHorizontal,
  Radio,
  CreditCard,
  Settings,
  ShieldCheck,
  LogOut,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'motion/react';

export default function BottomNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { logout } = useAuthStore();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/orders', icon: Package, label: 'Orders' },
    { to: '/products', icon: ShoppingBag, label: 'Products' },
    { to: '/customers', icon: Users, label: 'Users' },
  ];

  const moreItems = [
    { to: '/broadcast', icon: Radio, label: 'Broadcast' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/subscription', icon: ShieldCheck, label: 'Subscription' },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-14">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
                ${isActive ? 'text-indigo-600' : 'text-gray-400'}
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-400"
          >
            <MoreHorizontal className="w-6 h-6" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMoreOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-12 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">More Options</h3>
                <button onClick={() => setIsMoreOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {moreItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setIsMoreOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 p-4 rounded-2xl border transition-all
                      ${isActive 
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
                        : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-bold text-sm">{label}</span>
                  </NavLink>
                ))}
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 p-4 rounded-2xl border bg-rose-50 border-rose-100 text-rose-600 col-span-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold text-sm">Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
