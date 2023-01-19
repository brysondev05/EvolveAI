export const chunkArray = (array: any[], size: number) => {
  if (array.length <= size) {
    return [array]
  }
  return [array.slice(0, size), ...chunkArray(array.slice(size), size)]
}
