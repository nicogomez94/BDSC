const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/549XXXXXXXXXX"
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        style={{ width: '50px', height: '50px' }}
      />
    </a>
  );
};

export default WhatsAppButton;
