const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

const modoBtn = document.getElementById('modoBtn');
const modoIndicador = document.getElementById('modoIndicador');

const MAX_USER_CHARS = 500;
const MAX_TOKENS = 300;

let modoSuper = false; // false = básico, true = superinteligente
const messageHistory = [];

const systemPrompt = 
  "Tu nombre es NEO. Eres un tutor nerd, amigable, curioso y muy atento. " +
  "Habla siempre en español, de forma clara, cercana y relajada, como un amigo inteligente que quiere enseñar. " +
  "No uses emojis ni palabras en inglés, evita adornos innecesarios y ve directo al punto.";

// cambiar modo
modoBtn.addEventListener('click', () => {
  modoSuper = !modoSuper;
  modoIndicador.textContent = modoSuper ? "Superinteligente" : "Básico";
});

// render Markdown
function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
    .replace(/(?:<li>.*<\/li>)/gs, m => `<ul>${m}</ul>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/(#{1,6})\s*(.*)/g, (_, h, t) => `<h${h.length}>${t}</h${h.length}>`);
}

// agregar mensaje
function addMessage(text, sender = 'user') {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.innerHTML = parseMarkdown(text);
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// enviar mensaje
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  let text = chatInput.value.trim();
  if (!text) return;

  if (text.length > MAX_USER_CHARS) {
    text = text.slice(0, MAX_USER_CHARS) + "...";
  }

  addMessage(text, 'user');
  chatInput.value = '';

  messageHistory.push({ role: "user", content: text });
  if (messageHistory.length > 3) messageHistory.shift();

  const thinkingMsg = document.createElement('div');
  thinkingMsg.className = 'message bot';
  thinkingMsg.textContent = 'NEO está pensando...';
  chatMessages.appendChild(thinkingMsg);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const modelo = modoSuper ? "gpt-4.1" : "gpt-3.5-turbo";

  try {
    const response = await fetch("/netfily/functions/neo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modelo,
        messages: [
          { role: "system", content: systemPrompt },
          ...messageHistory
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.4
      })
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "No hubo respuesta.";

    chatMessages.removeChild(thinkingMsg);
    addMessage(aiResponse, 'bot');

    messageHistory.push({ role: "assistant", content: aiResponse });
    if (messageHistory.length > 3) messageHistory.shift();

  } catch (err) {
    console.error(err);
    chatMessages.removeChild(thinkingMsg);
    addMessage("Error al conectar con NEO.", 'bot');
  }
});

// tema claro/oscuro
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
function setTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeIcon.innerHTML = dark ? '&#9788;' : '&#9790;';
  localStorage.setItem('chatbot-theme', dark ? 'dark' : 'light');
}
themeToggle.onclick = () => setTheme(!document.body.classList.contains('dark'));
setTheme(localStorage.getItem('chatbot-theme') === 'dark');

// menú (placeholder)
document.querySelector('.menu-btn').onclick = () => {
  alert('Próximamente: menú de funcionalidades.');
};
