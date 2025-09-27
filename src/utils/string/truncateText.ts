export const truncateText = (text: string, length: number = 150) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};
