// src/components/Home.tsx
import React, {useState} from "react";
import io, {Socket} from "socket.io-client";
import type {Player, SessionData} from "../types/game";

interface HomeProps {
  setCurrentView: (view: "home" | "game") => void;
  setSessionData: (data: SessionData) => void;
}

const Home: React.FC<HomeProps> = ({setCurrentView, setSessionData}) => {
  const [username, setUsername] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const initializeSocket = (): Socket => {
    const newSocket = io("https://subdued-stretch.pipeops.net", {
      withCredentials: true
    });
    setSocket(newSocket);
    return newSocket;
  };

  const createSession = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    setIsCreating(true);
    const socketConnection = socket || initializeSocket();

    socketConnection.emit("create-session", {username});

    socketConnection.on(
      "session-created",
      (data: {sessionId: string; player: Player}) => {
        setSessionData({...data, socket: socketConnection, isMaster: true});
        setCurrentView("game");
      }
    );

    socketConnection.on("error", (error: {message: string}) => {
      alert(error.message);
      setIsCreating(false);
    });
  };

  const joinSession = () => {
    if (!username.trim() || !sessionId.trim()) {
      alert("Please fill all fields");
      return;
    }

    const socketConnection = socket || initializeSocket();
    socketConnection.emit("join-session", {sessionId, username});

    socketConnection.on(
      "joined-session",
      (data: {sessionId: string; player: Player}) => {
        setSessionData({...data, socket: socketConnection, isMaster: false});
        setCurrentView("game");
      }
    );

    socketConnection.on("error", (error: {message: string}) => {
      alert(error.message);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Guessing Game
        </h1>

        <div className="mb-6">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="space-y-6">
          <button
            onClick={createSession}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 disabled:scale-100"
          >
            {isCreating ? "Creating Game..." : "Create New Game"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or join existing game
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="sessionId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Session ID
              </label>
              <input
                id="sessionId"
                type="text"
                placeholder="Enter session ID"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              onClick={joinSession}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
