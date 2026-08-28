import './SpeechBubble.css';

export default function SpeechBubble({ x, y, text, visible, mode }) {
  if (!text) return null;

  return (
    <div
      className={`speech-bubble ${visible ? 'speech-bubble--visible' : ''} speech-bubble--${mode?.toLowerCase()}`}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {text}
    </div>
  );
}
