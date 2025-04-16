export function countScore(sentenceLength: number, timeSpent: number): number {
   return Math.floor(sentenceLength / Math.max(timeSpent, 0.9) * 60)
}
export function countAccuracy(sentenceLength: number, mistakesAmount: number) {
   return Math.max(+(100 - ((mistakesAmount / sentenceLength) * 100)).toFixed(2), 0)

}