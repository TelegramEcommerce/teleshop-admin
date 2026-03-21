import React from 'react';
import { useBotStore } from '../../store/botStore';
import { useAuthStore } from '../../store/authStore';
import { ChevronDown, Bot } from 'lucide-react';

export default function BotSwitcher() {
  const { bots, selectedBotId, setSelectedBot } = useBotStore();
  const { isSuperadmin } = useAuthStore();
  
  React.useEffect(() => {
    if (!selectedBotId && bots.length > 0) {
      setSelectedBot(bots[0].id);
    }
  }, [bots, selectedBotId, setSelectedBot]);

  const selectedBot = bots.find(b => b.id.toString() === selectedBotId?.toString());

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors border border-white/20">
        <Bot className="w-4 h-4 text-white" />
        <select 
          value={selectedBotId || ''} 
          onChange={(e) => setSelectedBot(e.target.value)}
          className="bg-transparent text-white text-sm font-medium focus:outline-none appearance-none pr-6 cursor-pointer"
        >
          {!selectedBotId && <option value="" disabled>Select Bot</option>}
          {bots.map(bot => (
            <option key={bot.id} value={bot.id} className="text-gray-900">
              {bot.bot_username || bot.bot_full_name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-white absolute right-3 pointer-events-none" />
      </div>
    </div>
  );
}
