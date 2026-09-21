'use client';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/096666666666"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 cursor-pointer z-50 flex items-center justify-center"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{ width: '60px', height: '60px' }} // Perfect circle size
    >
      <i className="ri-whatsapp-line text-3xl"></i>
    </a>
  );
}