import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'

export function FaqList({
  items,
  prefix = 'faq',
}: {
  items: readonly { question: string; answer: string; items?: readonly string[] }[]
  prefix?: string
}) {
  const [openItem, setOpenItem] = useState('')
  return (
    <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem} className="public-faq-list">
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`${prefix}-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent
            forceMount
            aria-hidden={openItem !== `${prefix}-${index}`}
            inert={openItem !== `${prefix}-${index}`}
          >
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
      ))}
    </Accordion>
  )
}

