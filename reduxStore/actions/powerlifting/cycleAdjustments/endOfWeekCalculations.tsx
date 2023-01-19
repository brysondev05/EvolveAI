//** If user reports either of these numbers then default to them, otherwise use average
const MIN_REPORT_TAKEOVER = 1
const MAX_REPORT_TAKEOVER = 5

export const getScore = (report, avg) => {
  let finalScore = avg
  if (report === MIN_REPORT_TAKEOVER) {
    return MIN_REPORT_TAKEOVER
  }
  if (report === MAX_REPORT_TAKEOVER) {
    return MAX_REPORT_TAKEOVER
  }
  if (avg < 3 && report < 4) {
    finalScore -= 1
  }
  const flooredScore = Math.round(finalScore)
  return flooredScore < 1 ? 1 : flooredScore > 5 ? 5 : flooredScore
}

export const finalScores = ({
  squatReport,
  squatAvg,
  benchReport,
  benchAvg,
  deadliftReport,
  deadliftAvg,
  upperPullReport,
  upperPullAvg,
}) => {
  return {
    squat: getScore(squatReport, squatAvg),
    bench: getScore(benchReport, benchAvg),
    deadlift: getScore(deadliftReport, deadliftAvg),
    upperPull: getScore(upperPullReport, upperPullAvg),
  }
}

export const findAverageReadiness = ({
  squatReadiness,
  benchReadiness,
  deadliftReadiness,
  upperPullReadiness,
}) => {
  const findAverage = (readiness) =>
    readiness.reduce((total, score) => total + score) / readiness?.length
  return {
    squat: findAverage(squatReadiness),
    bench: findAverage(benchReadiness),
    deadlift: findAverage(deadliftReadiness),
    upperPull: findAverage(upperPullReadiness),
  }
}

export const createWeeklyReadiness = ({
  squatReadiness,
  benchReadiness,
  deadliftReadiness,
  upperPullReadiness,
  squatReport,
  benchReport,
  deadliftReport,
  upperPullReport,
}) => {
  const {
    squat: squatAvg,
    bench: benchAvg,
    deadlift: deadliftAvg,
    upperPull: upperPullAvg,
  } = findAverageReadiness({
    squatReadiness,
    benchReadiness,
    deadliftReadiness,
    upperPullReadiness,
  })

  const {
    squat: finalSquat,
    bench: finalBench,
    deadlift: finalDeadlift,
    upperPull: finalUpperPull,
  } = finalScores({
    squatReport,
    squatAvg,
    benchReport,
    benchAvg,
    deadliftReport,
    deadliftAvg,
    upperPullReport,
    upperPullAvg,
  })

  return {
    squat: finalSquat,
    bench: finalBench,
    deadlift: finalDeadlift,
    upperPull: finalUpperPull,
  }
}

export const isCheckinNeeded = ({
  blockLength,
  blockWeek,
  currentWeekCycleID,
  nextWeekCycleID,
}) => {
  if (blockLength !== blockWeek && currentWeekCycleID !== nextWeekCycleID) {
    return false
  }
  return true
}

export const isEndOfBlock = ({ blockLength, blockWeek }) => {
  if (blockLength === blockWeek) {
    return true
  }
  return false
}
