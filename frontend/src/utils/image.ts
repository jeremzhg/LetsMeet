const API_BASE = "http://localhost:3000";

export const toAbsoluteImageUrl = (imagePath?: string | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (imagePath.startsWith("/")) {
    return `${API_BASE}${imagePath}`;
  }
  return `${API_BASE}/${imagePath}`;
};

export const getInitials = (text?: string, max = 2): string => {
  if (!text) return "NA";
  return text
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, max)
    .toUpperCase();
};
