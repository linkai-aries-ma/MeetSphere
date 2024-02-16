/**
 * Randomly shuffle an array.
 * This code segment comes from https://stackoverflow.com/a/2450976
 *
 * @param array Array to shuffle
 * @returns Shuffled array
 */
export function shuffle(array: any[]): any[] {
  let currentIndex = array.length,
    randomIndex: number

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;

    // And swap it with the current element.
    [ array[currentIndex], array[randomIndex] ] = [ array[randomIndex], array[currentIndex] ]
  }

  return array
}

/**
 * Toggle the value in the array.
 *
 * @param arr Array to toggle
 * @param value Value to toggle
 * @returns New array with the value toggled
 */
export function toggle(arr: any[], value: any): any[] {
  if (arr.includes(value)) return arr.filter(v => v !== value)
  return [ ...arr, value ]
}

/**
 * Generate a numeric hash of the given string.
 *
 * @param str String to hash
 */
export function hash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

/**
 * Print a debug message of the object without interrupting the flow.
 *
 * @param obj Object to print
 */
export function debug(obj: any) {
  console.log(obj)
  return obj
}