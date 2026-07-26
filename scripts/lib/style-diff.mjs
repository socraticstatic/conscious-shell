// Pure comparison. Baseline is authoritative: anything present in the
// baseline must still be present and identical. Elements that only exist
// in `current` are ignored, so adding markup does not fail the gate.

export function diffSnapshots(baseline, current) {
  const diffs = [];
  for (const [scenario, elements] of Object.entries(baseline)) {
    const currentElements = current[scenario];
    if (!currentElements) {
      diffs.push({ scenario, path: '*', missing: true });
      continue;
    }
    for (const [path, props] of Object.entries(elements)) {
      const currentProps = currentElements[path];
      if (!currentProps) {
        diffs.push({ scenario, path, missing: true });
        continue;
      }
      for (const [prop, from] of Object.entries(props)) {
        const to = currentProps[prop];
        if (to !== from) diffs.push({ scenario, path, prop, from, to });
      }
    }
  }
  return diffs;
}
