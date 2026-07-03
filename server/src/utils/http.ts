import type { Response } from 'express';
import { randomUUID } from 'node:crypto';

export function nowISO() {
  return new Date().toISOString();
}

export function createId() {
  return randomUUID();
}

export function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function badRequest(res: Response, message: string) {
  return res.status(400).json({ error: 'bad_request', message });
}

export function notFound(res: Response, message = 'Resource not found') {
  return res.status(404).json({ error: 'not_found', message });
}

export function conflict(res: Response, message: string) {
  return res.status(409).json({ error: 'conflict', message });
}
