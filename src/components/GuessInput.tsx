// src/components/GuessInput.tsx
import React, {useState} from "react";

interface GuessInputProps {
  onSubmitGuess: (guess: string) => void;
  disabled: boolean;
}

const GuessInput: React.FC<GuessInputProps> = ({onSubmitGuess, disabled}) => {
  const [guess, setGuess] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim() && !disabled) {
      onSubmitGuess(guess);
      setGuess("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-4">
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Enter your guess..."
        disabled={disabled}
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled || !guess.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:scale-100 hover:scale-105"
      >
        Submit
      </button>
    </form>
  );
};

export default GuessInput;
