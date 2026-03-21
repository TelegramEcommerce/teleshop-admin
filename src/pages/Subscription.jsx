import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBot } from '../api/bots';
import { useSelectedBot } from '../hooks/useSelectedBot';
import LoadingSkeleton from '../components/shared/LoadingSkeleton';
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Zap,
  Star,
  Crown,
  Key
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'motion/react';

export default function Subscription() {
  const { selectedBotId } = useSelectedBot();

  const { data: bot, isLoading } = useQuery({
    queryKey: ['bots', selectedBotId],
    queryFn: () => getBot(selectedBotId),
    enabled: !!selectedBotId,
  });

  const plans = [
    { 
      name: 'Free', 
      icon: Zap, 
      color: 'text-gray-400', 
      bg: 'bg-gray-50',
      features: ['Up to 50 Products', 'Basic Analytics', 'Standard Support', 'Manual Payments']
    },
    { 
      name: 'Pro', 
      icon: Star, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      features: ['Unlimited Products', 'Advanced Analytics', 'Priority Support', 'Automatic Payments', 'Custom Broadcasts']
    },
    { 
      name: 'Business', 
      icon: Crown, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      features: ['Everything in Pro', 'Whitelabel Bot', 'Dedicated Manager', 'API Access', 'Custom Integrations']
    }
  ];

  const currentPlan = bot?.plan_name?.toLowerCase() || 'free';
  const expiryDate = bot?.plan_expiry ? new Date(bot.plan_expiry) : null;
  const daysRemaining = expiryDate ? differenceInDays(expiryDate, new Date()) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
      </div>

      {isLoading ? (
        <LoadingSkeleton className="h-48" />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8"
        >
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center ${
            currentPlan === 'business' ? 'bg-amber-100 text-amber-600' :
            currentPlan === 'pro' ? 'bg-blue-100 text-blue-600' :
            'bg-gray-100 text-gray-400'
          }`}>
            {currentPlan === 'business' ? <Crown className="w-12 h-12" /> :
             currentPlan === 'pro' ? <Star className="w-12 h-12" /> :
             <Zap className="w-12 h-12" />}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{currentPlan} Plan</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-center md:self-auto ${
                daysRemaining > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {daysRemaining > 0 ? 'Active' : 'Expired'}
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              {expiryDate 
                ? `Your subscription expires on ${format(expiryDate, 'MMMM d, yyyy')}` 
                : 'No active subscription found.'}
            </p>
          </div>

          <div className="bg-gray-50 px-6 py-4 rounded-2xl text-center border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Days Remaining</p>
            <p className="text-3xl font-bold text-indigo-600">{Math.max(0, daysRemaining)}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`bg-white p-6 rounded-3xl shadow-sm border ${currentPlan === plan.name.toLowerCase() ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-gray-100'}`}>
            <div className={`w-12 h-12 rounded-2xl ${plan.bg} ${plan.color} flex items-center justify-center mb-4`}>
              <plan.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{plan.name}</h3>
            <ul className="space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-100 text-white">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
              <Key className="w-6 h-6" />
              Redeem Subscription Key
            </h3>
            <p className="text-indigo-100 text-sm">
              Purchased a subscription key? Enter it below to upgrade your bot instantly.
            </p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Enter your key here..."
              className="px-6 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/50 outline-none w-full sm:w-64"
            />
            <button className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all active:scale-95 whitespace-nowrap">
              Redeem Key
            </button>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-indigo-200">
          Subscription keys can be purchased through our official <a href="#" className="text-white font-bold hover:underline">TeleShop Support Bot</a>.
        </div>
      </div>
    </div>
  );
}
