import sanitizeHtml from 'sanitize-html';

const hasHtmlTags = (value) => /<\/?[a-z][\s\S]*>/i.test(String(value || ''));

const escapeHtml = (value) =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const toLegacyHtml = (value) => {
  const normalized = String(value || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return '';

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
};

const sanitizeOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'blockquote',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'hr',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
    p: ['style'],
    h1: ['style'],
    h2: ['style'],
    h3: ['style'],
    h4: ['style'],
    h5: ['style'],
    h6: ['style'],
  },
  allowedStyles: {
    p: {
      'text-align': [/^(left|right|center|justify)$/],
    },
    h1: {
      'text-align': [/^(left|right|center|justify)$/],
    },
    h2: {
      'text-align': [/^(left|right|center|justify)$/],
    },
    h3: {
      'text-align': [/^(left|right|center|justify)$/],
    },
    h4: {
      'text-align': [/^(left|right|center|justify)$/],
    },
    h5: {
      'text-align': [/^(left|right|center|justify)$/],
    },
    h6: {
      'text-align': [/^(left|right|center|justify)$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
};

export const sanitizeSitePageContent = (rawValue) => {
  if (rawValue === undefined || rawValue === null) return null;

  const input = String(rawValue).trim();
  if (!input) return null;

  const html = hasHtmlTags(input) ? input : toLegacyHtml(input);
  const sanitized = sanitizeHtml(html, sanitizeOptions).trim();

  return sanitized || null;
};
