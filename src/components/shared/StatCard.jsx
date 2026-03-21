import React from 'react';
import { motion } from 'motion/react';

export default function StatCard({ title, value, icon: Icon, trend, color = 'indigo' }) {
  const colors = {
    indigo: 'from-indigo-500 to-purple-600',
    emerald: 'from-emerald-500 to-teal-600',
    rose: 'from-rose-500 to-pink-600',
    amber: 'from-amber-500 to-orange-600',
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg shadow-indigo-100`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {trend && (
          <p className={`text-xs font-medium mt-0.5 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend > 0 ? '+' : ''}{trend}% from last month
          </p>
        )}
      </div>
    </motion.div>
  );
}
