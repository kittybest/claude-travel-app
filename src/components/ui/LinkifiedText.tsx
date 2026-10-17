import { ReactNode } from 'react';

// Matches [label](http(s)://...) or a bare http(s):// URL
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
const TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;

function renderLink(href: string, label: string, key: number) {
  return (
    <a
      key={key}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-700 hover:underline break-all"
      onClick={e => e.stopPropagation()}
    >
      {label}
    </a>
  );
}

export default function LinkifiedText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));

    if (match[2]) {
      parts.push(renderLink(match[2], match[1], index));
      lastIndex = index + match[0].length;
    } else {
      // Keep punctuation at the end of a bare URL as plain text
      const url = match[3].replace(TRAILING_PUNCTUATION, '');
      parts.push(renderLink(url, url, index));
      lastIndex = index + url.length;
    }
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}
