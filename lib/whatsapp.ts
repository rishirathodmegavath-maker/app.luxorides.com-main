export function getWhatsAppLink(message: string) {
  const phone = "919506090609";
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${phone}?text=${encodedMessage}`;
}
