export default function HangmanDrawing({ wrongCount }: { wrongCount: number }) {
  return (
    <svg viewBox="0 0 120 140" width="120" height="140" className="hangman-svg">
      {/* Gallows */}
      <line x1="10" y1="130" x2="110" y2="130" stroke="#333" strokeWidth="4" />
      <line x1="30" y1="130" x2="30" y2="10" stroke="#333" strokeWidth="4" />
      <line x1="30" y1="10" x2="80" y2="10" stroke="#333" strokeWidth="4" />
      <line x1="80" y1="10" x2="80" y2="30" stroke="#333" strokeWidth="4" />
      {/* Head */}
      {wrongCount >= 1 && <circle cx="80" cy="42" r="12" stroke="#e74c3c" strokeWidth="3" fill="none" />}
      {/* Body */}
      {wrongCount >= 2 && <line x1="80" y1="54" x2="80" y2="95" stroke="#e74c3c" strokeWidth="3" />}
      {/* Left arm */}
      {wrongCount >= 3 && <line x1="80" y1="65" x2="55" y2="80" stroke="#e74c3c" strokeWidth="3" />}
      {/* Right arm */}
      {wrongCount >= 4 && <line x1="80" y1="65" x2="105" y2="80" stroke="#e74c3c" strokeWidth="3" />}
      {/* Left leg */}
      {wrongCount >= 5 && <line x1="80" y1="95" x2="55" y2="120" stroke="#e74c3c" strokeWidth="3" />}
      {/* Right leg */}
      {wrongCount >= 6 && <line x1="80" y1="95" x2="105" y2="120" stroke="#e74c3c" strokeWidth="3" />}
    </svg>
  );
}
