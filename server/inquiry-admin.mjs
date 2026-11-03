import { Router } from 'express';
import { requireAuth, requireAdmin } from './auth.mjs';
import { initializeInquiries } from './inquiries.mjs';
import { parseJson } from './db.mjs';
import { summarizeBrief } from '../shared/brief.ts';

const basePath = id => `/api/admin/inquiries/${encodeURIComponent(id)}`;

function imageDto(row) {
  const base = `${basePath(row.inquiry_id)}/files/${encodeURIComponent(row.id)}`;
  return {
    id: row.id, originalName: row.original_name, mime: row.mime,
    size: row.size, width: row.width, height: row.height,
    previewUrl: `${base}/preview`, downloadUrl: `${base}/download`,
  };
}

/** Public requests are visible only to the studio, including their images. */
export function createInquiryAdminRouter() {
  const router = Router();
  router.use('/admin/inquiries', requireAuth, requireAdmin);
  router.get('/admin/inquiries/:inquiryId', (req, res) => {
    const db = initializeInquiries();
    const row = db.prepare('SELECT * FROM inquiries WHERE id=?').get(req.params.inquiryId);
    if (!row) return res.status(404).json({ error: 'Cette demande est introuvable.' });
    const details = db.prepare('SELECT * FROM inquiry_details WHERE inquiry_id=?').get(row.id);
    const brief = db.prepare('SELECT * FROM inquiry_briefs WHERE inquiry_id=?').get(row.id);
    const notification = db.prepare('SELECT status,attempts,updated_at FROM inquiry_outbox WHERE inquiry_id=?').get(row.id);
    const files = db.prepare('SELECT id,inquiry_id,original_name,mime,size,width,height FROM inquiry_attachments WHERE inquiry_id=? ORDER BY position').all(row.id).map(imageDto);
    const answers = brief ? parseJson(brief.brief_snapshot) : null;
    res.json({ inquiry: {
      id: row.id, name: row.name, email: row.email, subject: row.subject,
      message: row.message, createdAt: row.created_at,
      schemaVersion: brief?.schema_version ?? null, requestType: brief?.request_type ?? null,
      firstName: brief?.first_name ?? null, lastName: brief?.last_name ?? null,
      phone: details?.phone ?? null, company: details?.company ?? null,
      brief: answers, sections: brief ? summarizeBrief(brief.request_type, answers) : [],
      configuration: details ? parseJson(details.configuration_snapshot) : null,
      quote: details ? parseJson(details.quote_snapshot) : null,
      files, notification: notification ? { status: notification.status, attempts: notification.attempts, updatedAt: notification.updated_at } : null,
    } });
  });
  for (const mode of ['preview', 'download']) {
    router.get(`/admin/inquiries/:inquiryId/files/:fileId/${mode}`, (req, res) => {
      const row = initializeInquiries().prepare('SELECT * FROM inquiry_attachments WHERE id=? AND inquiry_id=?').get(req.params.fileId, req.params.inquiryId);
      if (!row) return res.status(404).json({ error: 'Cette image est introuvable.' });
      res.set({
        'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "sandbox; default-src 'none'",
        'Content-Type': row.mime,
        'Content-Disposition': `${mode === 'preview' ? 'inline' : 'attachment'}; filename="image.${row.mime === 'image/jpeg' ? 'jpg' : row.mime.split('/')[1]}"; filename*=UTF-8''${encodeURIComponent(row.original_name).replace(/['()*]/g, char => `%${char.charCodeAt(0).toString(16)}`)}`,
      });
      res.send(Buffer.from(row.bytes));
    });
  }
  return router;
}
