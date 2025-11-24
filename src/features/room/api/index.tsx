import type { Room, Player } from '../../../types/entry-type';
import { RoomStatus } from '../../../types/entry-type';

const STORAGE_KEY = 'linkplay_rooms';
const PLAYER_ID_KEY = 'linkplay_player_id';

// Helper to get or create a persistent player ID for this browser session
export const getPlayerId = (): string => {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
};

// Simulate a database read
const getRooms = (): Record<string, Room> => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// Simulate a database write and trigger update for other tabs
const saveRooms = (rooms: Record<string, Room>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  // Dispatch a custom event for the current tab to update
  window.dispatchEvent(new Event('local-storage-update'));
};

export const roomService = {
  createRoom: (passcode: string, playerName: string): Promise<Room> => {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        const rooms = getRooms();
        if (rooms[passcode]) {
          // Cleanup old rooms (optional logic for demo: if room is > 24h old, overwrite)
          const now = Date.now();
          if (now - rooms[passcode].createdAt < 86400000) {
             return reject(new Error('この合言葉の部屋は既に存在します。別の合言葉を試してください。'));
          }
        }

        const host: Player = {
          id: getPlayerId(),
          name: playerName || 'Player 1',
          isHost: true,
          joinedAt: Date.now(),
        };

        const newRoom: Room = {
          passcode,
          createdAt: Date.now(),
          status: RoomStatus.WAITING,
          players: [host],
        };

        rooms[passcode] = newRoom;
        saveRooms(rooms);
        resolve(newRoom);
      }, 600);
    });
  },

  joinRoom: (passcode: string, playerName: string): Promise<Room> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const rooms = getRooms();
        const room = rooms[passcode];

        if (!room) {
          return reject(new Error('その合言葉の部屋は存在しません。'));
        }

        if (room.status === RoomStatus.PLAYING) {
          // Allow rejoin if player ID matches, else reject
          const playerId = getPlayerId();
          const isAlreadyIn = room.players.some(p => p.id === playerId);
          if (!isAlreadyIn) {
            return reject(new Error('この部屋は既にゲーム中です。'));
          }
        }

        const playerId = getPlayerId();
        const existingPlayerIndex = room.players.findIndex(p => p.id === playerId);

        if (existingPlayerIndex === -1) {
          // New player joining
          const newPlayer: Player = {
            id: playerId,
            name: playerName || `Player ${room.players.length + 1}`,
            isHost: false,
            joinedAt: Date.now(),
          };
          room.players.push(newPlayer);
        } else {
          // Update name if rejoining
          room.players[existingPlayerIndex].name = playerName || room.players[existingPlayerIndex].name;
        }

        rooms[passcode] = room;
        saveRooms(rooms);
        resolve(room);
      }, 600);
    });
  },

  getRoom: (passcode: string): Room | null => {
    const rooms = getRooms();
    return rooms[passcode] || null;
  },

  updateGameContext: (passcode: string, context: string) => {
    const rooms = getRooms();
    if (rooms[passcode]) {
      rooms[passcode].gameContext = context;
      saveRooms(rooms);
    }
  },

  leaveRoom: (passcode: string) => {
    const rooms = getRooms();
    const room = rooms[passcode];
    if (room) {
      const playerId = getPlayerId();
      room.players = room.players.filter(p => p.id !== playerId);
      
      // If room empty, delete it
      if (room.players.length === 0) {
        delete rooms[passcode];
      } else {
        // If host left, assign new host
        if (!room.players.some(p => p.isHost)) {
          room.players[0].isHost = true;
        }
      }
      saveRooms(rooms);
    }
  }
};