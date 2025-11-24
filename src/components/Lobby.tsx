import React, { useEffect, useState } from 'react';
import type { Room, Player } from '../types/entry-type';
import { Button } from './Button';
import { Users, Copy, Check, Sparkles, Gamepad2, LogOut } from 'lucide-react';
import { geminiService } from '../features/geminiService/api';
import { roomService } from '../features/room/api';

interface LobbyProps {
  room: Room;
  currentPlayerId: string;
  onLeave: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ room, currentPlayerId, onLeave }) => {
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(room.passcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAi = async () => {
    setAiLoading(true);
    const scenario = await geminiService.generateGameScenario(room.passcode, room.players.length);
    roomService.updateGameContext(room.passcode, scenario);
    setAiLoading(false);
  };

  const isHost = room.players.find(p => p.id === currentPlayerId)?.isHost;

  return (
    <div className="max-w-md w-full mx-auto p-4 space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Gamepad2 className="w-6 h-6" />
            <span className="font-bold tracking-wider text-sm uppercase">Lobby</span>
          </div>
          <div className="bg-indigo-900/50 text-indigo-200 px-3 py-1 rounded-full text-xs font-mono border border-indigo-700/50">
            Wait Status
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-slate-400 text-sm">Room Passcode</p>
          <div 
            onClick={handleCopy}
            className="group relative cursor-pointer bg-slate-900/50 border border-slate-700 rounded-xl py-4 px-6 flex items-center justify-center space-x-3 transition-all hover:border-indigo-500/50 hover:bg-slate-900"
          >
            <span className="text-3xl font-bold text-white tracking-widest font-mono">
              {room.passcode}
            </span>
            {copied ? (
              <Check className="w-5 h-5 text-green-500 absolute right-4" />
            ) : (
              <Copy className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 absolute right-4 transition-colors" />
            )}
          </div>
          <p className="text-xs text-slate-500 h-4">
            {copied ? "Copied to clipboard!" : "Tap to copy passcode"}
          </p>
        </div>
      </div>

      {/* AI Context Card */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-violet-900/20 rounded-2xl p-6 border border-indigo-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 relative z-10">
          <h3 className="text-indigo-200 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Game Master AI
          </h3>
          {isHost && !room.gameContext && (
            <button 
              onClick={handleGenerateAi}
              disabled={aiLoading}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
            >
              {aiLoading ? 'Thinking...' : 'Generate Theme'}
            </button>
          )}
        </div>
        
        <div className="relative z-10 min-h-[60px] text-sm text-slate-300 leading-relaxed">
           {room.gameContext ? (
             <div className="animate-fade-in">
               <span className="text-indigo-300 font-semibold">Theme: </span>
               {room.gameContext}
             </div>
           ) : (
             <span className="text-slate-500 italic">
               {isHost 
                 ? "Ask the AI to generate a theme for your session." 
                 : "Waiting for host to generate theme..."}
             </span>
           )}
        </div>
      </div>

      {/* Player List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-slate-300 font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Players ({room.players.length})
          </h3>
        </div>
        
        <div className="grid gap-2">
          {room.players.map((player) => (
            <div 
              key={player.id}
              className={`
                flex items-center justify-between p-3 rounded-xl border transition-all
                ${player.id === currentPlayerId 
                  ? 'bg-indigo-900/20 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                  : 'bg-slate-800/30 border-slate-700/50'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${player.isHost ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50' : 'bg-slate-700 text-slate-300'}
                `}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${player.id === currentPlayerId ? 'text-white' : 'text-slate-300'}`}>
                    {player.name} {player.id === currentPlayerId && '(You)'}
                  </span>
                  {player.isHost && (
                    <span className="text-[10px] text-amber-500 uppercase tracking-wider font-bold">Host</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 space-y-3">
        {isHost && (
            <Button fullWidth className="bg-green-600 hover:bg-green-500 shadow-green-900/20">
              Start Game
            </Button>
        )}
        <Button variant="secondary" fullWidth onClick={onLeave} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-900/30">
          <LogOut className="w-4 h-4 mr-2" />
          Leave Room
        </Button>
      </div>
    </div>
  );
};