import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { createLampScene } from './lamp-scene'
import './demo-3d.css'

const colors = [
  { name: 'Sauge', hex: '#89946b' },
  { name: 'Lavande', hex: '#aa98cc' },
  { name: 'Sable', hex: '#c6a283' },
] as const

const turnStep = Math.PI / 12

export function Demo3dPage() {
  const viewport = useRef<HTMLDivElement>(null)
  const scene = useRef<ReturnType<typeof createLampScene> | null>(null)
  const gesture = useRef<{ pointerId: number; x: number } | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const [selected, setSelected] = useState(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!viewport.current) return
    try {
      scene.current = createLampScene(viewport.current, colors[0].hex, () => setState('unavailable'))
      setState('ready')
    } catch {
      setState('unavailable')
    }
    return () => {
      scene.current?.dispose()
      scene.current = null
    }
  }, [])

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (state !== 'ready' || !event.isPrimary || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    gesture.current = { pointerId: event.pointerId, x: event.clientX }
    setDragging(true)
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    const active = gesture.current
    if (active?.pointerId !== event.pointerId) return
    scene.current?.rotate((event.clientX - active.x) * 0.012)
    active.x = event.clientX
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (gesture.current?.pointerId !== event.pointerId) return
    gesture.current = null
    setDragging(false)
  }

  return (
    <section className="container page-section demo-3d" aria-labelledby="demo-3d-title">
      <Link className="demo-3d__back" to="/forfaits/immersif-3d">
        <ArrowLeft size={16} aria-hidden="true" /> Retour à Premium / 3D
      </Link>

      <header className="demo-3d__intro">
        <h1 className="page-heading" id="demo-3d-title">Essayez la 3D</h1>
        <p className="page-subtitle" id="demo-3d-help">Faites glisser la lampe pour la tourner, puis essayez une autre couleur.</p>
      </header>

      <div className="demo-3d__panel">
        <div className="demo-3d__viewer">
          <div
            ref={viewport}
            className="demo-3d__canvas"
            role="img"
            aria-label={`Lampe de bureau 3D, couleur ${colors[selected].name.toLowerCase()}`}
            aria-describedby="demo-3d-help"
            aria-hidden={state !== 'ready'}
            data-ready={state === 'ready'}
            data-dragging={dragging}
            onPointerDown={startDrag}
            onPointerMove={drag}
            onLostPointerCapture={finishDrag}
            onPointerCancel={finishDrag}
          />
          {state !== 'ready' ? (
            <p className="demo-3d__status" role="status">
              {state === 'loading' ? 'Chargement de la lampe…' : 'La démo 3D ne peut pas s’afficher dans ce navigateur.'}
            </p>
          ) : null}
          {state === 'ready' ? (
            <div className="demo-3d__rotation" role="group" aria-label="Tourner la lampe">
              <button type="button" aria-label="Tourner à gauche" onClick={() => scene.current?.rotate(-turnStep)}>
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <button type="button" aria-label="Tourner à droite" onClick={() => scene.current?.rotate(turnStep)}>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>

        {state === 'ready' ? (
          <div className="demo-3d__controls">
            <div className="demo-3d__colors" role="group" aria-label="Couleur de la lampe">
              {colors.map(({ name, hex }, index) => (
                <button key={name} type="button" aria-pressed={index === selected} onClick={() => {
                  setSelected(index)
                  scene.current?.setColor(hex)
                }}>
                  <span aria-hidden="true" style={{ backgroundColor: hex }} />
                  {name}
                </button>
              ))}
            </div>
            <button className="demo-3d__reset button button--primary" type="button" onClick={() => {
              setSelected(0)
              scene.current?.reset()
            }}>
              <RotateCcw size={15} aria-hidden="true" /> Réinitialiser
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
