import { useCallback } from 'react'
import { useBeforeUnload, useBlocker } from 'react-router-dom'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'

/** Keep unfinished briefs in memory until the visitor chooses to leave. */
export function BriefNavigationGuard({ active, pending }: { active: boolean; pending: boolean }) {
  const blocker = useBlocker(active)
  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => {
    if (!active) return
    event.preventDefault()
    event.returnValue = ''
  }, [active]))

  return (
    <Dialog open={blocker.state === 'blocked'} onOpenChange={open => {
      if (!open && blocker.state === 'blocked') blocker.reset()
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quitter le formulaire ?</DialogTitle>
          <DialogDescription>
            {pending
              ? 'L’envoi est en cours. Restez sur cette page pour recevoir la confirmation.'
              : 'Vos réponses ne sont pas encore envoyées. Quitter cette page effacera la saisie.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => { if (blocker.state === 'blocked') blocker.reset() }}>Rester sur le formulaire</Button>
          <Button onClick={() => { if (blocker.state === 'blocked') blocker.proceed() }}>Quitter la page</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
