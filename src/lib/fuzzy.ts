// Forgiving answer checking for "type the answer" questions.

export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9.\-/:° ]/g, ' ')
    .replace(/°/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(the|a|an) /, '');
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function numericValue(s: string): number | null {
  const t = s.replace(/[−–—]/g, '-').replace(/[£$€,\s]/g, '').replace(/°|degrees?|cm|kg|g|ml|n$/gi, '');
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  const f = t.match(/^(-?\d+)\/(\d+)$/);
  if (f) return Number(f[1]) / Number(f[2]);
  return null;
}

/** True if `given` matches any accepted answer, allowing capitals and small typos. */
export function isAcceptable(given: string, accept: string[], numeric = false): boolean {
  const g = normalise(given);
  if (!g) return false;
  for (const a of accept) {
    const n = normalise(a);
    if (g === n) return true;
    if (numeric) {
      // Ratios and fractions must match in form (e.g. 2:3, 3/4), so compare text without spaces.
      if (/[:/]/.test(a)) {
        if (g.replace(/\s/g, '') === n.replace(/\s/g, '')) return true;
        continue;
      }
      const gv = numericValue(given), av = numericValue(a);
      if (gv !== null && av !== null && Math.abs(gv - av) < 1e-9) return true;
      continue;
    }
    const allowed = n.length <= 4 ? 0 : n.length <= 8 ? 1 : 2;
    if (levenshtein(g, n) <= allowed) return true;
  }
  return false;
}
