import {useState} from "react";
import type {SessionData} from "./types/game";
import Home from "./components/Home";
import GameSession from "./components/GameSession";

function App() {
  const [currentView, setCurrentView] = useState<"home" | "game">("home");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  return (
    <div className="text-center p-5 min-h-screen bg-[#f5f5f5]">
      {currentView === "home" ? (
        <Home setCurrentView={setCurrentView} setSessionData={setSessionData} />
      ) : (
        <GameSession
          sessionData={sessionData!}
          setCurrentView={setCurrentView}
        />
      )}
    </div>
  );
}

export default App;
