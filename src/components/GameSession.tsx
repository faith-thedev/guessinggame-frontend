// src/components/GameSession.tsx
import React, {useState, useEffect} from "react";
import type {Message, Player, ScoreItem, SessionData} from "../types/game";
import PlayerList from "./PlayerList";
import Scoreboard from "./Scoreboard";
import QuestionDisplay from "./QuestionDisplay";
import Timer from "./Timer";
import GuessInput from "./GuessInput";
import ChatInterface from "./ChatInterface";

interface GameSessionProps {
  sessionData: SessionData;
  setCurrentView: (view: "home" | "game") => void;
}

const GameSession: React.FC<GameSessionProps> = ({
  sessionData,
  setCurrentView,
}) => {
  const {socket, sessionId, isMaster, player} = sessionData;
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<
    "waiting" | "in-progress" | "finished"
  >("waiting");
  const [question, setQuestion] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMaster, setCurrentMaster] = useState<Player | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [scores, setScores] = useState<ScoreItem[]>([]);

  useEffect(() => {
    socket.on("player-joined", (data: {players: Player[]}) => {
      setPlayers(data.players);
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          message: "A new player joined the game",
          timestamp: new Date(),
        },
      ]);
    });

    socket.on("player-left", (data: {players: Player[]}) => {
      setPlayers(data.players);
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          message: "A player left the game",
          timestamp: new Date(),
        },
      ]);
    });

    socket.on(
      "game-started",
      (data: {question: string; timeLeft: number; attempts: number}) => {
        setGameState("in-progress");
        setQuestion(data.question);
        setTimeLeft(data.timeLeft);
        setAttemptsLeft(data.attempts);

        setMessages((prev) => [
          ...prev,
          {
            type: "system",
            message: "Game started!",
            timestamp: new Date(),
          },
        ]);
      }
    );

    socket.on("timer-update", (data: {timeLeft: number}) => {
      setTimeLeft(data.timeLeft);
    });

    socket.on("incorrect-guess", (data: {attemptsLeft: number}) => {
      setAttemptsLeft(data.attemptsLeft);
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          message: `Incorrect! ${data.attemptsLeft} attempts left.`,
          timestamp: new Date(),
        },
      ]);
    });

    socket.on("no-attempts-left", () => {
      setGameState("finished");
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          message: "You are out of attempts!",
          timestamp: new Date(),
        },
      ]);
    });

    socket.on(
      "game-ended",
      (data: {winner: Player | null; answer: string; scores: ScoreItem[]}) => {
        setGameState("finished");
        setWinner(data.winner);
        setAnswer(data.answer);
        setScores(data.scores);

        if (data.winner) {
          setMessages((prev) => [
            ...prev,
            {
              type: "system",
              message: `${
                data.winner!.username
              } won the round! The answer was: ${data.answer}`,
              timestamp: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              type: "system",
              message: `Time's up! The answer was: ${data.answer}`,
              timestamp: new Date(),
            },
          ]);
        }
      }
    );

    socket.on("new-game-master", (data: {master: Player}) => {
      setCurrentMaster(data.master);
      setGameState("waiting");
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          message: `${data.master.username} is now the game master`,
          timestamp: new Date(),
        },
      ]);
    });

    socket.on("error", (error: {message: string}) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          message: `Error: ${error.message}`,
          timestamp: new Date(),
        },
      ]);
    });

    return () => {
      socket.off("player-joined");
      socket.off("player-left");
      socket.off("game-started");
      socket.off("timer-update");
      socket.off("incorrect-guess");
      socket.off("no-attempts-left");
      socket.off("game-ended");
      socket.off("new-game-master");
      socket.off("error");
    };
  }, [socket]);

  const startGame = (question: string, answer: string) => {
    socket.emit("start-game", {sessionId, question, answer});
  };

  const submitGuess = (guess: string) => {
    socket.emit("submit-guess", {sessionId, guess});
    setMessages((prev) => [
      ...prev,
      {
        type: "player",
        message: `You guessed: ${guess}`,
        timestamp: new Date(),
      },
    ]);
  };

  const leaveGame = () => {
    socket.disconnect();
    setCurrentView("home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold">Guessing Game</h1>
            <span className="bg-blue-800 px-3 py-1 rounded-full text-sm">
              Room: {sessionId}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Welcome, {player.username}!</span>
              {isMaster && (
                <span className="bg-yellow-500 px-2 py-1 rounded text-xs font-bold">
                  Game Master
                </span>
              )}
            </div>
            <button
              onClick={leaveGame}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition duration-200"
            >
              Leave Game
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left Panel */}
          <div className="lg:w-1/4 bg-gray-50 p-6 border-r border-gray-200">
            <PlayerList players={players} master={currentMaster} />
            <Scoreboard scores={scores} />
          </div>

          {/* Main Panel */}
          <div className="lg:w-3/4 p-6">
            {gameState === "waiting" && isMaster && (
              <QuestionDisplay onStartGame={startGame} />
            )}

            {gameState === "waiting" && !isMaster && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center mb-6">
                <div className="animate-pulse text-blue-600 mb-4">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Waiting for the game to start
                </h3>
                <p className="text-gray-600">
                  {currentMaster
                    ? `Game Master: ${currentMaster.username}`
                    : "The game master will start the game soon"}
                </p>
              </div>
            )}

            {gameState === "in-progress" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Question:
                  </h2>
                  <p className="text-xl text-green-800 font-semibold bg-white p-4 rounded-lg shadow-sm">
                    {question}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Timer timeLeft={timeLeft} />
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <span className="block text-sm text-yellow-700 font-semibold mb-1">
                      Attempts Left
                    </span>
                    <span className="text-2xl font-bold text-yellow-800">
                      {attemptsLeft}
                    </span>
                  </div>
                </div>

                <GuessInput
                  onSubmitGuess={submitGuess}
                  disabled={gameState !== "in-progress"}
                />
              </div>
            )}

            {gameState === "finished" && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  {winner ? (
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-purple-800 mb-2">
                        Winner!
                      </h3>
                      <p className="text-xl text-purple-700">
                        {winner.username}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-2">
                        Time's Up!
                      </h3>
                      <p className="text-lg text-gray-600">
                        No winner this round
                      </p>
                    </div>
                  )}

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <span className="block text-sm text-gray-500 mb-1">
                      The answer was:
                    </span>
                    <span className="text-xl font-bold text-gray-800">
                      {answer}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <ChatInterface messages={messages} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSession;
