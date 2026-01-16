export const sanitizeText = (value: string | null | undefined, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
};
