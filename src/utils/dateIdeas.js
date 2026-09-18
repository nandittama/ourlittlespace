export const DATE_IDEAS = [
  'Movie night + favorite snacks',
  'Try a new cafe',
  'Sunset walk',
  'Cook together',
  'Take random photos',
  'Late night talk',
  'Explore a new place',
  'Play games together',
  'Make a playlist',
  "Order each other's favorite food",
]

export function pickRandomIdea(exclude = null) {
  const pool = exclude ? DATE_IDEAS.filter((i) => i !== exclude) : DATE_IDEAS
  const list = pool.length ? pool : DATE_IDEAS
  return list[Math.floor(Math.random() * list.length)]
}
