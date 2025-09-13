// src/components/Timer.tsx
import React from "react";

interface TimerProps {
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({timeLeft}) => {
  const getTimerColor = () => {
    if (timeLeft > 30) return "text-green-600";
    if (timeLeft > 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
      <div className="text-sm text-gray-600 font-semibold mb-2">Time Left</div>
      <div className={`text-3xl font-bold ${getTimerColor()}`}>{timeLeft}s</div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${
            timeLeft > 30
              ? "bg-green-500"
              : timeLeft > 10
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{width: `${(timeLeft / 60) * 100}%`}}
        ></div>
      </div>
    </div>
  );
};

export default Timer;
