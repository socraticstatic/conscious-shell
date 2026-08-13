// Pure text scanner. No filesystem, no AST. Deliberately regex-based:
// the codebase puts colours inside className attributes, bare string
// literals, template strings and CSS text alike, and a JSX-only AST walk
// would miss the ternary class builders in GitArchaeology.

const TW_ALPHA = /-\[(#[0-9a-fA-F]{6})\]\/([0-9.]+)/g;
const TW_PLAIN = /-\[(#[0-9a-fA-F]{6})\]/g;
const RGBA = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([0-9.]+)\s*)?\)/g;
const BARE_HEX = /#[0-9a-fA-F]{6}\b/g;

function lineColOf(source, index) {
  const before = source.slice(0, index);
  const line = before.split('\n').length;
  const lastNewline = before.lastIndexOf('\n');
  return { line, column: index - lastNewline - 1 };
}

export function extractColors(source) {
  const hits = [];
  const claimed = [];

  const claim = (start, end) => claimed.push([start, end]);
  const isClaimed = (i) => claimed.some(([s, e]) => i >= s && i < e);

  const scan = (re, build) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(source)) !== null) {
      if (isClaimed(m.index)) continue;
      claim(m.index, m.index + m[0].length);
      hits.push({ ...build(m), ...lineColOf(source, m.index) });
    }
  };

  // Order matters. The alpha form is a superset of the plain form, and the
  // plain form contains a bare hex, so the most specific pattern claims its
  // span first and the looser ones skip anything already claimed.
  scan(TW_ALPHA, (m) => ({
    kind: 'tw-class-alpha',
    value: m[1].toLowerCase(),
    alpha: m[2],
  }));
  scan(TW_PLAIN, (m) => ({
    kind: 'tw-class',
    value: m[1].toLowerCase(),
    alpha: null,
  }));
  scan(RGBA, (m) => ({
    kind: 'rgba',
    value: `${m[1]},${m[2]},${m[3]}`,
    alpha: m[4] ?? null,
  }));
  scan(BARE_HEX, (m) => ({
    kind: 'hex',
    value: m[0].toLowerCase(),
    alpha: null,
  }));

  return hits.sort((a, b) => a.line - b.line || a.column - b.column);
}
