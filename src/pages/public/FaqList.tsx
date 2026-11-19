import { useEffect, useRef, useState } from 'react'
import type { faqs, FaqTopic } from '../../../shared/catalog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Button } from '../../components/ui/button'

const filters: readonly { id: FaqTopic | 'all'; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'prix', label: 'Prix' },
  { id: 'deroulement', label: 'Déroulement' },
  { id: 'livraison', label: 'Livraison' },
  { id: 'suivi', label: 'Suivi' },
]

export function FaqList({
  items,
  prefix = 'faq',
  filterable = false,
  anchor,
}: {
  items: typeof faqs
  prefix?: string
  filterable?: boolean
  anchor?: string
}) {
  const [topic, setTopic] = useState<FaqTopic | 'all'>('all')
  const [openItem, setOpenItem] = useState('')
  const linkedTrigger = useRef<HTMLButtonElement>(null)
  const linkedAnchor = items.find(item => item.anchor && item.anchor === anchor)?.anchor
  const visibleItems = topic === 'all' ? items : items.filter(item => item.topics.includes(topic))
  const listId = `${prefix}-questions`

  useEffect(() => {
    if (!linkedAnchor) return
    setTopic('all')
    setOpenItem(linkedAnchor)
    const frame = window.requestAnimationFrame(() => {
      const trigger = linkedTrigger.current
      trigger?.focus({ preventScroll: true })
      trigger?.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [linkedAnchor])

  return (
    <>
      {filterable ? (
        <div className="public-faq-filters" role="group" aria-label="Filtrer les questions par thème">
          {filters.map(filter => (
            <Button
              key={filter.id}
              size="sm"
              variant={topic === filter.id ? 'default' : 'outline'}
              aria-pressed={topic === filter.id}
              aria-controls={listId}
              onClick={() => {
                if (topic === filter.id) return
                setOpenItem('')
                setTopic(filter.id)
              }}
            >
              {filter.label}
            </Button>
          ))}
          <span className="public-sr-only" role="status">{visibleItems.length} questions</span>
        </div>
      ) : null}
      <Accordion id={listId} type="single" collapsible value={openItem} onValueChange={setOpenItem} className="public-faq-list">
        {visibleItems.map((item, index) => {
          const value = item.anchor ?? `${prefix}-${index}`
          return (
            <AccordionItem id={item.anchor} key={item.question} value={value}>
              <AccordionTrigger ref={item.anchor && item.anchor === linkedAnchor ? linkedTrigger : undefined}>
                {item.question}
              </AccordionTrigger>
              <AccordionContent forceMount aria-hidden={openItem !== value} inert={openItem !== value}>
                <div className="public-faq-answer">
                  <p>{item.answer}</p>
                  {item.items ? (
                    <ul>
                      {item.items.map((text) => <li key={text}>{text}</li>)}
                    </ul>
                  ) : null}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </>
  )
}

