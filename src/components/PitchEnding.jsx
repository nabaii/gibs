export default function PitchEnding({ onReset }) {
  return (
    <div id="pitch-ending" onClick={onReset}>
      <div className="pe-bg-indigo" />
      <div className="pe-bg-coral" />
      <div className="pe-text">
        What you just experienced is not a presentation about what we <em>could</em> do.<br /><br />
        It's proof of what we <em>will</em> do.
      </div>
      <div className="pe-divider" />
      <div className="pe-agency">IBORO IGE-EDABA &amp; ASSOCIATES</div>
      <div className="pe-hint">Click anywhere to return to the beginning</div>
    </div>
  )
}
