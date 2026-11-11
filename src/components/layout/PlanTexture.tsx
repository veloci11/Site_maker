import './plan-texture.css'

/** A single image plane shared by thumbnails, comparison buttons and plans. */
export function PlanTexture({ className = '', preview = false, extend = true }: { className?: string; preview?: boolean; extend?: boolean }) {
  return (
    <span className={`plan-texture ${preview ? 'plan-texture--preview' : ''} ${className}`} aria-hidden="true">
      <span className="plan-texture__paint">
        <span className="plan-texture__master" />
        {extend ? <span className="plan-texture__continuation" /> : null}
      </span>
    </span>
  )
}
