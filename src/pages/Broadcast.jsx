import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBroadcasts, createBroadcast, getGiveaways, createGiveaway, getGiveawayParticipants } from '../api/broadcasts';
import { useBotStore } from '../store/botStore';
import { useToastStore } from '../store/toastStore';
import LoadingSkeleton from '../components/shared/LoadingSkeleton';
import { 
  Send, 
  Gift, 
  Plus, 
  Search, 
  Users, 
  Calendar, 
  Clock, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  MessageSquare,
  Trophy,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function Broadcast() {
  const { selectedBotId } = useBotStore();
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('broadcasts');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGiveaway, setSelectedGiveaway] = useState(null);

  const { data: broadcasts, isLoading: broadcastsLoading } = useQuery({
    queryKey: ['broadcasts', selectedBotId],
    queryFn: () => getBroadcasts({ bot_id: selectedBotId }),
    enabled: !!selectedBotId,
  });

  const { data: giveaways, isLoading: giveawaysLoading } = useQuery({
    queryKey: ['giveaways', selectedBotId],
    queryFn: () => getGiveaways({ bot_id: selectedBotId }),
    enabled: !!selectedBotId,
  });

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ['giveaway-participants', selectedGiveaway?.id],
    queryFn: () => getGiveawayParticipants(selectedGiveaway.id),
    enabled: !!selectedGiveaway,
  });

  const createBroadcastMutation = useMutation({
    mutationFn: (data) => createBroadcast({ ...data, bot_id: selectedBotId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['broadcasts', selectedBotId]);
      addToast('Broadcast sent successfully');
      setIsModalOpen(false);
    },
    onError: () => addToast('Failed to send broadcast', 'error'),
  });

  const createGiveawayMutation = useMutation({
    mutationFn: (data) => createGiveaway({ ...data, bot_id: selectedBotId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['giveaways', selectedBotId]);
      addToast('Giveaway created successfully');
      setIsModalOpen(false);
    },
    onError: () => addToast('Failed to create giveaway', 'error'),
  });

  if (broadcastsLoading || giveawaysLoading) return <LoadingSkeleton type="list" count={5} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Broadcast & Giveaways</h1>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 self-start">
          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'broadcasts' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Send className="w-4 h-4" />
            Broadcasts
          </button>
          <button
            onClick={() => setActiveTab('giveaways')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'giveaways' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Gift className="w-4 h-4" />
            Giveaways
          </button>
        </div>
      </div>

      <div className="text-center md:hidden">
        <p className="text-[10px] text-gray-400 italic">Pull down to refresh</p>
      </div>

      <div className="grid gap-4">
        {activeTab === 'broadcasts' ? (
          <>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full p-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Broadcast
            </button>
            {broadcasts?.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No broadcasts sent</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                  Send messages to all your customers at once.
                </p>
              </div>
            ) : (
              broadcasts?.map(b => (
                <div key={b.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 line-clamp-2">{b.message}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {format(new Date(b.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{b.target_count || 0} Sent</p>
                      <StatusBadge status="completed" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full p-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Giveaway
            </button>
            {giveaways?.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No giveaways found</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                  Create giveaways to engage your customers and grow your shop.
                </p>
              </div>
            ) : (
              giveaways?.map(g => (
                <div 
                  key={g.id} 
                  onClick={() => setSelectedGiveaway(g)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{g.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {g.participant_count || 0} Participants
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ends on</p>
                      <p className="text-xs font-bold text-gray-900">{format(new Date(g.end_date), 'MMM d')}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Giveaway Detail Modal */}
      <AnimatePresence>
        {selectedGiveaway && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGiveaway(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 max-h-[90vh] overflow-y-auto md:max-w-lg md:mx-auto md:bottom-10 md:rounded-[32px] md:shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Giveaway Details</h2>
                  <button onClick={() => setSelectedGiveaway(null)} className="p-2 bg-gray-100 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4 shadow-sm">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedGiveaway.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedGiveaway.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Participants</p>
                      <p className="text-xl font-bold text-indigo-600">{selectedGiveaway.participant_count || 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                      <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Active</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-3 h-3" /> Participant List
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {participantsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                        </div>
                      ) : participants?.length === 0 ? (
                        <p className="text-center py-8 text-sm text-gray-400 italic">No participants yet.</p>
                      ) : (
                        participants?.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-xs">
                                {p.first_name?.[0]}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900">{p.first_name}</p>
                                <p className="text-[10px] text-gray-500">@{p.username || 'no_username'}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-400">{format(new Date(p.joined_at), 'MMM d')}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New Broadcast/Giveaway Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 max-h-[90vh] overflow-y-auto md:max-w-lg md:mx-auto md:bottom-10 md:rounded-[32px] md:shadow-2xl"
            >
              {activeTab === 'broadcasts' ? (
                <BroadcastForm 
                  onClose={() => setIsModalOpen(false)}
                  onSubmit={(data) => createBroadcastMutation.mutate(data)}
                  isLoading={createBroadcastMutation.isPending}
                />
              ) : (
                <GiveawayForm 
                  onClose={() => setIsModalOpen(false)}
                  onSubmit={(data) => createGiveawayMutation.mutate(data)}
                  isLoading={createGiveawayMutation.isPending}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function BroadcastForm({ onClose, onSubmit, isLoading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ message });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">New Broadcast</h2>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Message</label>
          <textarea 
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Type your message to all customers..."
          />
        </div>
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Send Broadcast
        </button>
      </form>
    </div>
  );
}

function GiveawayForm({ onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    end_date: '',
    winner_count: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">New Giveaway</h2>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Giveaway Title</label>
          <input 
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Weekly Coffee Giveaway"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
          <textarea 
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="What are the prizes and rules?"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">End Date</label>
            <input 
              required
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Winners</label>
            <input 
              required
              type="number"
              min="1"
              value={formData.winner_count}
              onChange={(e) => setFormData({ ...formData, winner_count: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5" />}
          Create Giveaway
        </button>
      </form>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    completed: 'bg-emerald-100 text-emerald-600',
    pending: 'bg-amber-100 text-amber-600',
    failed: 'bg-rose-100 text-rose-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}
