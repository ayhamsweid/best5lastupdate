export function decodeRouteSegment(value: string) {
  let decoded = value;

  for (let index = 0; index < 3; index += 1) {
    try {
      const nextValue = decodeURIComponent(decoded);
      if (nextValue === decoded) {
        break;
      }
      decoded = nextValue;
    } catch {
      break;
    }
  }

  return decoded;
}
