import React from "react";
import type {ScoreItem} from "../types/game";

interface ScoreboardProps {
  scores: ScoreItem[];
}

const Scoreboard: React.FC<ScoreboardProps> = ({scores}) => {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Scoreboard
      </h3>
      <div className="space-y-2">
        {sortedScores.map((score, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-xs"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0
                    ? "bg-yellow-500"
                    : index === 1
                    ? "bg-gray-400"
                    : index === 2
                    ? "bg-yellow-700"
                    : "bg-blue-500"
                }`}
              >
                {index + 1}
              </div>
              <span className="font-medium text-gray-800">
                {score.username}
              </span>
            </div>
            <span className="font-semibold text-green-600">
              {score.score} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scoreboard;
