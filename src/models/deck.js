const KEY = "codesquad-deck";

export function readDeck() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function rememberPattern(problem) {
  const deck = readDeck();
  if (deck.some((card) => card.slug === problem.slug)) return deck;
  const next = [
    { slug: problem.slug, title: problem.title, pattern: problem.pattern, at: Date.now() },
    ...deck,
  ].slice(0, 12);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
