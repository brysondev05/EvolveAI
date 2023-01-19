export const average = (array: number[]) => {
  return array.reduce((acc, current) => acc + current, 0) / array.length
}
