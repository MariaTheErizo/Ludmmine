// Atajos para buscar elementos; R = ruta hacia la raíz (cada página la define en data-root)
const R = document.body.dataset.root || '';
const $ = (s, p = document) => p.querySelector(s), $$ = (s, p = document) => [...p.querySelectorAll(s)];
// Guardado seguro: no falla si el navegador bloquea el almacenamiento
const store = { get: k => { try { return localStorage.getItem(k) } catch (e) { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch (e) {} } };

// Tema claro/oscuro recordado entre visitas
document.documentElement.dataset.theme = store.get('ne-theme') || 'dark';

// Barra de navegación (se escribe una sola vez para todo el sitio)
$('#nav').innerHTML = `<nav aria-label="Principal"><a class="logo" href="${R}index.html" aria-label="NE! inicio">NE!</a>
<button class="menu-btn" aria-label="Abrir menú" aria-expanded="false">☰</button>
<div class="links"><a href="${R}index.html#como">Cómo funciona</a><a href="${R}empresa/sobre-nosotros.html">Empresa</a><a href="${R}empresa/accesibilidad.html">Accesibilidad</a>
<button class="icon-btn" id="theme" aria-label="Cambiar entre tema claro y oscuro">◐</button><a class="btn ghost" href="${R}portafolio/portafolio.html">Portafolio</a><a class="btn" href="${R}tienda/store.html">Tienda</a></div></nav>`;

// Pie de página completo (una sola vez para todo el sitio)
$('#foot').innerHTML = `<div class="fcols">
<div><h4>NE!</h4><a href="${R}empresa/sobre-nosotros.html">Sobre nosotros</a><a href="${R}index.html#valores">Misión y valores</a><a href="${R}portafolio/portafolio.html">Portafolio I–V</a><a href="${R}empresa/estrategia.html">Estrategia y FODA</a></div>
<div><h4>Legal</h4><a href="${R}empresa/privacidad.html">Privacidad</a><a href="${R}empresa/terminos.html">Términos de uso</a><a href="${R}empresa/accesibilidad.html">Accesibilidad</a></div>
<div><h4>Tienda</h4><a href="${R}tienda/store.html">Ecosistema NE!</a><a href="${R}index.html#lista">Lista de espera</a></div>
<div><h4>Contacto</h4><a href="mailto:leoreamex5@gmail.com">leoreamex5@gmail.com</a><span>Jalisco, México</span></div></div>
<div class="fine">© 2026 NE! Network Experience. Todos los derechos reservados. Fundado y dirigido por Leonardo Sebastián Rea Camarena (Director Ejecutivo).</div>`;

// Menú móvil y botón de tema
$('.menu-btn').addEventListener('click', e => { const o = $('.links').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); });
$('#theme').addEventListener('click', () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; store.set('ne-theme', t); });

// Resplandor que sigue al mouse (solo en pantallas con mouse)
if (matchMedia('(hover:hover)').matches) {
  const g = document.createElement('div'); g.className = 'glow'; document.body.prepend(g);
  addEventListener('pointermove', e => { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; });
}

// Aparición al hacer scroll + contadores que suben hasta su cifra
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;                       // ignora lo que aún no se ve
  e.target.classList.add('in'); io.unobserve(e.target); // lo muestra una sola vez
  const n = e.target.dataset.count;                    // si es contador...
  if (n) { let v = 0; const t = setInterval(() => { v = Math.min(+n, v + Math.ceil(+n / 40)); e.target.textContent = (e.target.dataset.pre || '') + v + (e.target.dataset.suf || ''); if (v >= +n) clearInterval(t); }, 30); }
}), { threshold: .3 });
$$('.rv,[data-count]').forEach(el => io.observe(el));

// Subtitulado en vivo: escribe frases letra por letra
const cap = $('#cap');
if (cap) {
  const fr = ['Hola, ¿me escuchas bien?', 'La reunión empieza en cinco minutos.', 'Vamos a ganar esta partida juntos.', 'Todos merecen entender la conversación.']; let i = 0;
  const type = () => { const s = fr[i++ % fr.length]; let c = 0; cap.textContent = ''; const t = setInterval(() => { cap.textContent = s.slice(0, ++c); if (c >= s.length) { clearInterval(t); setTimeout(type, 2200); } }, 45); };
  matchMedia('(prefers-reduced-motion:reduce)').matches ? cap.textContent = fr[0] : type();
}

// Lista de espera: pega aquí la URL de tu Apps Script (termina en /exec); vacía = modo demo
const FORM_URL = 'https://script.google.com/macros/s/AKfycbybP0zkhhc0HhjFLP62368aTYb-nmhCvNFAvt8cAj7FFy0a_1KPelquNIRiVC5OjlD-hg/exec';
const wl = $('#wl');
if (wl) wl.addEventListener('submit', async e => {
  e.preventDefault();
  const msg = $('#wl-msg');
  if (!wl.checkValidity()) { msg.textContent = 'Escribe un correo válido.'; return; }  // valida el correo
  if (FORM_URL) {                                      // envío real: el script guarda el correo y manda la confirmación
    try { await fetch(FORM_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ email: wl.querySelector('input').value }) }); }
    catch (err) { msg.textContent = 'No se pudo enviar. Intenta de nuevo.'; return; }
  }
  msg.textContent = '¡Listo! Revisa tu correo: ya estás apartado.'; wl.reset();
});

// Carrito (solo existe en la tienda)
const cart = $('#cart');
if (cart) {
  let items = [];                                      // productos añadidos
  const draw = () => { $('#cart-list').innerHTML = items.map(i => `<li><span>${i.name}</span><span>$${i.price.toFixed(2)}</span></li>`).join(''); $('#cart-count').textContent = items.length; $('#cart-total').textContent = '$' + items.reduce((s, i) => s + i.price, 0).toFixed(2); };
  $$('[data-add]').forEach(b => b.addEventListener('click', () => { items.push({ name: b.dataset.name, price: +b.dataset.price }); draw(); cart.classList.add('open'); }));
  $('#cart-toggle').addEventListener('click', () => cart.classList.toggle('open'));
  $('#cart-close').addEventListener('click', () => cart.classList.remove('open'));
  addEventListener('keydown', e => e.key === 'Escape' && cart.classList.remove('open')); // Esc cierra
}

// Aviso de cookies (aparece una sola vez)
if (!store.get('ne-ck')) {
  const b = document.createElement('div'); b.className = 'ck'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Aviso de cookies');
  b.innerHTML = `<span>Solo usamos almacenamiento esencial (tema y preferencias). <a href="${R}empresa/privacidad.html" style="display:inline;color:var(--accent)">Más info</a></span><button class="btn">Entendido</button>`;
  b.querySelector('button').onclick = () => { store.set('ne-ck', '1'); b.remove(); };
  document.body.append(b);
}