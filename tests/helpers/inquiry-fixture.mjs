import { randomUUID } from 'node:crypto';
import { getBriefSections, isBriefQuestionVisible } from '../../shared/brief.ts';

/** A sample from the shared question model; validation remains the server's job. */
export function validInquiry(requestType = 'vitrine', extra = {}) {
  const brief = {};
  for (const section of getBriefSections(requestType)) {
    for (const question of section.questions) {
      if (!question.required || !isBriefQuestionVisible(question, brief)) continue;
      brief[question.id] = question.type === 'select' ? question.options[0].value
        : question.type === 'multiselect' ? [question.options[0].value]
          : question.type === 'url' ? 'https://example.test/site'
            : 'À définir ensemble avec le studio.';
    }
  }
  return {
    schemaVersion: 2,
    requestId: randomUUID(),
    requestType,
    firstName: 'Client',
    lastName: 'Test',
    email: 'client@example.test',
    phone: '+33 1 23 45 67 89',
    company: 'Atelier test',
    configuration: ['vitrine', 'connecte', 'immersif', 'sur-mesure'].includes(requestType) ? { offerId: requestType } : null,
    brief,
    website: '',
    ...extra,
  };
}
