import React, { useState, useEffect } from 'react';
import type { ViewState, Room } from './types/entry-type';
import { roomService, getPlayerId } from './features/room/api';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Lobby } from './components/Lobby';
import { Hash, UserCircle2, ArrowLeft, Gamepad } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [playerName, setPlayerName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  // Sync logic for multi-tab support
  useEffect(() => {
    const handleStorageChange = () => {
      if (currentRoom) {
        const updatedRoom = roomService.getRoom(currentRoom.passcode);
        if (updatedRoom) {
          setCurrentRoom(updatedRoom);
        } else {
          // Room was deleted or invalid
          setView('HOME');
          setCurrentRoom(null);
          setError('Room closed.');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange); // Cross-tab
    window.addEventListener('local-storage-update', handleStorageChange); // Same-tab custom event

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-update', handleStorageChange);
    };
  }, [currentRoom]);

  const handleCreateRoom = async () => {
    if (passcode.length < 4) {
      setError('合言葉は4文字以上に設定してください。');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const room = await roomService.createRoom(passcode, playerName);
      setCurrentRoom(room);
      setView('LOBBY');
    } catch (err: any) {
      setError(err.message || 'Error creating room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!passcode) {
      setError('合言葉を入力してください。');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const room = await roomService.joinRoom(passcode, playerName);
      setCurrentRoom(room);
      setView('LOBBY');
    } catch (err: any) {
      setError(err.message || 'Error joining room');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      roomService.leaveRoom(currentRoom.passcode);
      setCurrentRoom(null);
      setView('HOME');
      setPasscode('');
      setError('');
    }
  };

  const goHome = () => {
    setView('HOME');
    setError('');
    setPasscode('');
  };

  // --------------------------------------------------------------------------
  // Render: Home Screen
  // --------------------------------------------------------------------------
  if (view === 'HOME') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-radial-top from-slate-900 via-slate-950 to-black">
        <div className="max-w-md w-full space-y-8 animate-fade-in-up">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20 mb-4">
              <Gamepad className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
              LinkPlay
            </h1>
            <p className="text-slate-400 text-sm">Real-time board game matching</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-4">
            <Input
              label="ニックネーム (Nickname)"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              icon={<UserCircle2 className="w-5 h-5" />}
            />
            
            <div className="grid grid-cols-1 gap-4 pt-2">
              <Button onClick={() => setView('CREATE')} fullWidth>
                部屋を作成 (Create)
              </Button>
              <Button onClick={() => setView('JOIN')} variant="secondary" fullWidth>
                部屋に参加 (Join)
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render: Create or Join Form
  // --------------------------------------------------------------------------
  if (view === 'CREATE' || view === 'JOIN') {
    const isCreate = view === 'CREATE';
    return (
      <div className="min-h-screen flex flex-col p-6 bg-slate-950">
        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center space-y-6">
          <button 
            onClick={goHome}
            className="self-start text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">
              {isCreate ? 'Create Room' : 'Join Room'}
            </h2>
            <p className="text-slate-400">
              {isCreate 
                ? 'Set a secret passcode for your friends.' 
                : 'Enter the passcode to find your room.'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <Input
              label="部屋の合言葉 (Passcode)"
              placeholder={isCreate ? "Minimum 4 characters" : "Enter passcode"}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.trim())}
              icon={<Hash className="w-5 h-5" />}
              error={error}
              autoFocus
            />

            <Button 
              onClick={isCreate ? handleCreateRoom : handleJoinRoom} 
              isLoading={loading}
              fullWidth
            >
              {isCreate ? 'Create & Enter' : 'Find & Join'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render: Lobby
  // --------------------------------------------------------------------------
  if (view === 'LOBBY' && currentRoom) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Lobby 
          room={currentRoom} 
          currentPlayerId={getPlayerId()} 
          onLeave={handleLeaveRoom} 
        />
      </div>
    );
  }

  return null;
}