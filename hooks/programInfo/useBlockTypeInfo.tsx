const getBlockName = (blockLetter) => {
  switch (blockLetter) {
    case 'H':
      return 'hypertrophy'
    case 'S':
      return 'strength'
    case 'P':
      return 'peaking'
    case 'B':
      return 'bridge'
    case 'R':
      return 'preparatory'
    case 'F':
      return 'peaking'
    default:
      return ''
  }
}
export const useBlockTypeInfo = (blockType: string) => {
  return {
    blockPeriodization: blockType?.[0],
    blockLength: blockType?.[1],
    blockWeek: blockType?.[2] === 'T' ? blockType?.[3] : blockType?.[2],
    blockVersion: blockType?.[blockType?.length - 1],
    fullName: getBlockName(blockType?.[0]),
  }
}

export default useBlockTypeInfo
