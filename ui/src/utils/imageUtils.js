export const getImgurDirectUrl = (url) => {
  if (!url) {
    console.warn('Image URL is undefined');
    return '/fallback-image.jpg';
  }
  const imgurRegex = /https?:\/\/(?:i\.)?imgur\.com\/(\w+)(?:\.\w+)?/;
  const match = url.match(imgurRegex);
  if (match && match[1]) {
    return `https://i.imgur.com/${match[1]}.jpg`;
  }
  console.warn('Invalid Imgur URL:', url);
  return url;
}; 