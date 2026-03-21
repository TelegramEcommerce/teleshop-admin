import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useBotStore } from '../store/botStore';
import { useToastStore } from '../store/toastStore';
import { updateBot, getBot, getAiSettings, updateAiSettings, getBots, deleteBot } from '../api/bots';
import { getContentBlocks, updateContentBlock } from '../api/contentBlocks';
import { getUsers, updateUser } from '../api/customers';
import { 
  getGlobalSettings, 
  updateGlobalSetting, 
  getPlanPayments, 
  createPlanPayment, 
  updatePlanPayment, 
  deletePlanPayment 
} from '../api/superadmin';
import { getStats } from '../api/stats';
import { uploadImage } from '../api/products';
import LoadingSkeleton from '../components/shared/LoadingSkeleton';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Mail, 
  MessageSquare, 
  Bot, 
  Users, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Edit2, 
  QrCode, 
  Save, 
  Loader2,
  CheckCircle2,
  Zap,
  Star,
  Crown,
  Key,
  Calendar,
  TrendingUp,
  Power,
  CreditCard
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const { isSuperadmin, user } = useAuthStore();
  const { selectedBotId } = useBotStore();
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState('shop');
  const queryClient = useQueryClient();

  // Tab 1: Shop Settings
  const { data: bot, isLoading: botLoading } = useQuery({
    queryKey: ['bots', selectedBotId],
    queryFn: () => getBot(selectedBotId),
    enabled: !!selectedBotId,
  });

  const { data: contentBlocks } = useQuery({
    queryKey: ['content-blocks', selectedBotId],
    queryFn: () => getContentBlocks({ bot_id: selectedBotId }),
    enabled: !!selectedBotId,
  });

  const { data: admins } = useQuery({
    queryKey: ['users', 'admins', selectedBotId],
    queryFn: () => getUsers({ bot_id: selectedBotId, is_admin: true }),
    enabled: !!selectedBotId,
  });

  const { data: aiSettings } = useQuery({
    queryKey: ['ai-settings', selectedBotId],
    queryFn: () => getAiSettings(selectedBotId),
    enabled: !!selectedBotId,
  });

  // Tab 3: Superadmin
  const { data: globalSettings } = useQuery({
    queryKey: ['global-settings'],
    queryFn: getGlobalSettings,
    enabled: isSuperadmin,
  });

  const { data: allBots } = useQuery({
    queryKey: ['all-bots'],
    queryFn: getBots,
    enabled: isSuperadmin,
  });

  const { data: planPayments } = useQuery({
    queryKey: ['plan-payments'],
    queryFn: getPlanPayments,
    enabled: isSuperadmin,
  });

  const { data: globalStats } = useQuery({
    queryKey: ['global-stats'],
    queryFn: () => getStats({ bot_id: null }),
    enabled: isSuperadmin,
  });

  // Mutations
  const updateBotMutation = useMutation({
    mutationFn: (data) => updateBot(selectedBotId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['bots', selectedBotId]);
      addToast('Settings updated successfully');
    },
    onError: () => addToast('Failed to update settings', 'error'),
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ key, data }) => updateContentBlock(selectedBotId, key, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['content-blocks', selectedBotId]);
      addToast('Content updated successfully');
    },
    onError: () => addToast('Failed to update content', 'error'),
  });

  const removeAdminMutation = useMutation({
    mutationFn: (id) => updateUser(id, { is_admin: false }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users', 'admins', selectedBotId]);
      addToast('Admin removed');
    },
  });

  const updateAiMutation = useMutation({
    mutationFn: (data) => updateAiSettings(selectedBotId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ai-settings', selectedBotId]);
      addToast('AI settings updated');
    },
  });

  const updateGlobalMutation = useMutation({
    mutationFn: ({ key, value }) => updateGlobalSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries(['global-settings']);
      addToast('Global setting updated');
    },
  });

  // Local state for forms
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiContext, setAiContext] = useState('');

  React.useEffect(() => {
    if (bot) setEmail(bot.notification_email || '');
    if (contentBlocks) {
      const web = contentBlocks.find(b => b.key === 'website_url');
      if (web) setWebsiteUrl(web.content_data?.url || '');
    }
    if (aiSettings) {
      setAiApiKey(aiSettings.api_key || '');
      setAiContext(aiSettings.system_context || '');
    }
  }, [bot, contentBlocks, aiSettings]);

  const websiteBlock = contentBlocks?.find(b => b.key === 'website_url');
  const newsfeedBlock = contentBlocks?.find(b => b.key === 'newsfeed_settings');

  const tabs = [
    { id: 'shop', label: 'Shop Settings', icon: SettingsIcon },
    { id: 'subscription', label: 'Subscription', icon: ShieldCheck },
    ...(isSuperadmin ? [{ id: 'superadmin', label: 'Super Admin', icon: ShieldAlert }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 self-start">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'shop' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shop Status */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bot?.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    <Power className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Shop Status</h3>
                    <p className="text-xs text-gray-500">Control your bot's availability</p>
                  </div>
                </div>
                <button 
                  onClick={() => updateBotMutation.mutate({ is_active: !bot?.is_active })}
                  className={`w-14 h-7 rounded-full transition-colors relative ${bot?.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${bot?.is_active ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
              <p className={`text-sm font-bold text-center py-2 rounded-xl ${bot?.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {bot?.is_active ? 'SHOP OPEN' : 'SHOP CLOSED'}
              </p>
            </section>

            {/* Email Notifications */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Email Notifications</h3>
                  <p className="text-xs text-gray-500">Receive order alerts via email</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="email@example.com"
                />
                <button 
                  onClick={() => updateBotMutation.mutate({ notification_email: email })}
                  className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Save
                </button>
              </div>
            </section>

            {/* Website Link */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Website Link</h3>
                  <p className="text-xs text-gray-500">Link to your external website</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://..."
                />
                <button 
                  onClick={() => updateContentMutation.mutate({ key: 'website_url', data: { url: websiteUrl } })}
                  className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Save
                </button>
              </div>
            </section>

            {/* Newsfeed Toggle */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${newsfeedBlock?.content_data?.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Newsfeed</h3>
                    <p className="text-xs text-gray-500">Enable/disable newsfeed in bot</p>
                  </div>
                </div>
                <button 
                  onClick={() => updateContentMutation.mutate({ 
                    key: 'newsfeed_settings', 
                    data: { enabled: !newsfeedBlock?.content_data?.enabled } 
                  })}
                  className={`w-14 h-7 rounded-full transition-colors relative ${newsfeedBlock?.content_data?.enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${newsfeedBlock?.content_data?.enabled ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
              <p className={`text-sm font-bold text-center py-2 rounded-xl ${newsfeedBlock?.content_data?.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                {newsfeedBlock?.content_data?.enabled ? 'NEWSFEED ENABLED' : 'NEWSFEED DISABLED'}
              </p>
            </section>

            {/* Manage Admins */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Manage Admins</h3>
                  <p className="text-xs text-gray-500">Users with administrative access to this bot</p>
                </div>
              </div>
              <div className="space-y-3">
                {admins?.map(admin => (
                  <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-indigo-600">
                        {admin.first_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{admin.first_name}</p>
                        <p className="text-xs text-gray-500">@{admin.username || 'no_username'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm('Remove admin access?')) removeAdminMutation.mutate(admin.id);
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-center text-[10px] text-gray-400 italic">Add admins via the Telegram bot directly.</p>
              </div>
            </section>

            {/* AI Agent Settings */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${aiSettings?.is_enabled ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">AI Agent Settings</h3>
                    <p className="text-xs text-gray-500">Configure your bot's AI assistant</p>
                  </div>
                </div>
                <button 
                  onClick={() => updateAiMutation.mutate({ is_enabled: !aiSettings?.is_enabled })}
                  className={`w-14 h-7 rounded-full transition-colors relative ${aiSettings?.is_enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${aiSettings?.is_enabled ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Gemini API Key</label>
                  <input 
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="••••••••••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">System Context / Instructions</label>
                  <textarea 
                    rows={4}
                    value={aiContext}
                    onChange={(e) => setAiContext(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="You are a helpful assistant for TeleShop..."
                  />
                </div>
                <button 
                  onClick={() => updateAiMutation.mutate({ api_key: aiApiKey, system_context: aiContext })}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save AI Settings
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center ${
                bot?.plan_name === 'Business' ? 'bg-amber-100 text-amber-600' :
                bot?.plan_name === 'Pro' ? 'bg-purple-100 text-purple-600' :
                bot?.plan_name === 'Standard' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {bot?.plan_name === 'Business' ? <Crown className="w-12 h-12" /> :
                 bot?.plan_name === 'Pro' ? <Star className="w-12 h-12" /> :
                 <Zap className="w-12 h-12" />}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 capitalize">{bot?.plan_name || 'Free'} Plan</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-center md:self-auto ${
                    differenceInDays(new Date(bot?.plan_expiry), new Date()) > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {differenceInDays(new Date(bot?.plan_expiry), new Date()) > 0 ? 'Active' : 'Expired'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  {bot?.plan_expiry 
                    ? `Expires on ${format(new Date(bot.plan_expiry), 'MMMM d, yyyy')}` 
                    : 'No active subscription.'}
                </p>
              </div>

              <div className="bg-gray-50 px-6 py-4 rounded-2xl text-center border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Days Remaining</p>
                <p className="text-3xl font-bold text-indigo-600">{Math.max(0, differenceInDays(new Date(bot?.plan_expiry), new Date()))}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: 'Free', features: ['Basic features', '1 bot'], color: 'gray' },
                { name: 'Standard', features: ['Web panel access', 'Custom commands'], color: 'blue' },
                { name: 'Pro', features: ['AI Agent', 'Advanced analytics'], color: 'purple' },
                { name: 'Business', features: ['All features', 'Priority support'], color: 'amber' }
              ].map(plan => (
                <div key={plan.name} className={`bg-white p-5 rounded-2xl border ${bot?.plan_name === plan.name ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-gray-100'}`}>
                  <h4 className="font-bold text-gray-900 mb-3">{plan.name}</h4>
                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-100 text-white">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                    <Key className="w-6 h-6" />
                    Redeem Subscription Key
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    Enter your key below to upgrade instantly.
                  </p>
                </div>
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="Enter key..."
                    className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none w-full sm:w-64"
                  />
                  <button className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl">
                    Redeem
                  </button>
                </div>
              </div>
              <p className="mt-6 text-center text-[10px] text-indigo-200">
                To redeem a subscription key, send the key to your bot on Telegram.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'superadmin' && isSuperadmin && (
          <div className="space-y-8">
            {/* Maintenance Mode */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${globalSettings?.maintenance_mode === 'true' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Global Maintenance Mode</h3>
                    <p className="text-xs text-rose-500 font-medium">Warning: This will disable ALL bots for all users</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (confirm('CRITICAL: Toggle maintenance mode for ALL bots?')) {
                      updateGlobalMutation.mutate({ key: 'maintenance_mode', value: globalSettings?.maintenance_mode === 'true' ? 'false' : 'true' });
                    }
                  }}
                  className={`w-16 h-8 rounded-full transition-colors relative ${globalSettings?.maintenance_mode === 'true' ? 'bg-rose-600' : 'bg-emerald-500'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${globalSettings?.maintenance_mode === 'true' ? 'left-9' : 'left-1'}`} />
                </button>
              </div>
            </section>

            {/* Manage Cloned Bots */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                Manage Cloned Bots
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                      <th className="pb-4">Bot Username</th>
                      <th className="pb-4">Owner ID</th>
                      <th className="pb-4">Plan</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allBots?.map(b => (
                      <tr key={b.id} className="text-sm">
                        <td className="py-4 font-bold text-gray-900">@{b.bot_username}</td>
                        <td className="py-4 text-gray-500">{b.owner_telegram_id}</td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-bold uppercase">{b.plan_name}</span>
                        </td>
                        <td className="py-4">
                          <button 
                            onClick={() => updateBotMutation.mutate({ id: b.id, is_active: !b.is_active })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${b.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${b.is_active ? 'left-5.5' : 'left-0.5'}`} />
                          </button>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => {
                              if (confirm(`Delete bot @${b.bot_username}?`)) deleteBot(b.id).then(() => queryClient.invalidateQueries(['all-bots']));
                            }}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Plan Payments */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  Plan Payments Management
                </h3>
                <button className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {planPayments?.map(p => (
                  <div key={p.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-gray-100">
                      {p.qr_code_url ? <img src={p.qr_code_url} className="w-full h-full object-cover rounded-xl" /> : <QrCode className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.payment_name}</p>
                      <p className="text-xs text-gray-500 truncate">{p.account_number}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Revenue Report */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                All Bots Revenue Report
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{globalStats?.total_revenue?.toLocaleString()} MMK</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{globalStats?.total_orders}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">Total Users</p>
                  <p className="text-xl font-bold text-gray-900">{globalStats?.total_users}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                      <th className="pb-4">Bot</th>
                      <th className="pb-4">Plan</th>
                      <th className="pb-4">Orders</th>
                      <th className="pb-4 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allBots?.map(b => (
                      <tr key={b.id} className="text-sm">
                        <td className="py-4 font-bold text-gray-900">@{b.bot_username}</td>
                        <td className="py-4 text-gray-500">{b.plan_name}</td>
                        <td className="py-4 text-gray-500">{b.total_orders || 0}</td>
                        <td className="py-4 text-right font-bold text-emerald-600">{b.total_revenue?.toLocaleString() || 0} MMK</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
