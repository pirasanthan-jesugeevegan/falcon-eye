// Formatting utilities
export function dateFormat(date: string | Date) {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getRatingInfo(rating: string) {
  const ratingNum = parseInt(rating);
  switch (ratingNum) {
    case 1:
      return { text: 'A', color: 'bg-green-500' };
    case 2:
      return { text: 'B', color: 'bg-yellow-500' };
    case 3:
      return { text: 'C', color: 'bg-orange-500' };
    case 4:
      return { text: 'D', color: 'bg-red-400' };
    case 5:
      return { text: 'E', color: 'bg-red-600' };
    default:
      return { text: '?', color: 'bg-gray-500' };
  }
}
