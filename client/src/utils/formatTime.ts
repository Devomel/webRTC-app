export function formatTime(timeInSec: number) {
   const minutes = Math.floor((timeInSec) / 60).toString().padStart(2, "0");
   const seconds = ((timeInSec) % 60).toString().padStart(2, "0");
   return { minutes, seconds }
}