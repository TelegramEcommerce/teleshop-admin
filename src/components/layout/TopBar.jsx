import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User, Menu } from 'lucide-react';
import BotSwitcher from '../shared/BotSwitcher';

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-indigo-600 shadow-md">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="md:hidden text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-xl">T</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">TeleShop</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center px-4">
          <BotSwitcher />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-white text-sm font-medium leading-none">{user?.email?.split('@')[0]}</span>
            <span className="text-indigo-100 text-xs mt-1">{user?.is_superadmin ? 'Superadmin' : 'Owner'}</span>
          </div>
          <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-white/20 flex items-center justify-center text-white cursor-pointer overflow-hidden">
              {user?.telegram_id ? (
                <img src={`https://t.me/i/userpic/320/${user.telegram_id}.jpg`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 hidden group-hover:block">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
