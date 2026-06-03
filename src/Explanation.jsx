export default function Explanation({ what, why, onClose }) {
  if (!what) return null

  return (
    <div className="explanation">
      <button
        type="button"
        className="explanation-close"
        onClick={onClose}
        aria-label="Close explanation"
      >
        ×
      </button>
      <p>
        <span className="explanation-tag">What happened</span>
        {what}
      </p>
      <p>
        <span className="explanation-tag">Why</span>
        {why}
      </p>
    </div>
  )
}
