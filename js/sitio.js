// ============================================
//  FC AUTOS — funciones generales del sitio
//  Se usa en todas las páginas.
// ============================================

document.documentElement.classList.add('js');

const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hayGsap = typeof gsap !== 'undefined';

let lenis = null;
const BASE = document.documentElement.dataset.base || '';


// ---------- WhatsApp ----------
// Cualquier enlace con data-whatsapp="mensaje" abre WhatsApp con ese mensaje.
function linkWhatsapp(mensaje) {
  return 'https://wa.me/' + CONTACTO.whatsapp + '?text=' + encodeURIComponent(mensaje);
}

function activarWhatsapp() {
  document.querySelectorAll('[data-whatsapp]').forEach(function (enlace) {
    enlace.href = linkWhatsapp(enlace.dataset.whatsapp || 'Hola FC Autos.');
    enlace.target = '_blank';
    enlace.rel = 'noopener';
  });
}


// ---------- Datos de contacto en el pie de página ----------
function llenarContacto() {
  const telefono = '+' + CONTACTO.whatsapp.replace(/^(\d{3})(\d{4})(\d+)/, '$1 $2 $3');

  document.querySelectorAll('[data-contacto="telefono"]').forEach(el => el.textContent = telefono);
  document.querySelectorAll('[data-contacto="correo"]').forEach(el => el.textContent = CONTACTO.correo);
  document.querySelectorAll('[data-contacto="ubicacion"]').forEach(el => el.textContent = CONTACTO.ubicacion);
  document.querySelectorAll('[data-correo]').forEach(el => el.href = 'mailto:' + CONTACTO.correo);

  document.querySelectorAll('[data-red]').forEach(function (el) {
    el.href = CONTACTO[el.dataset.red] || '#';
  });

  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
}


// ---------- Menú ----------
function iniciarMenu() {
  const menu = document.getElementById('encabezado');
  const boton = document.getElementById('boton-menu');
  const menuMovil = document.getElementById('menu-movil');
  const botonFlotante = document.getElementById('whatsapp-flotante');

  // Fondo del menú al bajar
  function posicion() {
    return Math.max(window.scrollY || 0, window.pageYOffset || 0,
      document.documentElement.scrollTop || 0, document.body.scrollTop || 0);
  }
  function alBajar() {
    const y = posicion();
    menu.classList.toggle('con-fondo', y > 10 || !menuMovil.classList.contains('hidden'));
    if (botonFlotante) botonFlotante.classList.toggle('translate-y-24', y < 400);
  }
  window.alBajarMenu = alBajar;
  ['scroll', 'touchmove', 'resize', 'orientationchange'].forEach(function (ev) {
    window.addEventListener(ev, alBajar, { passive: true });
  });
  document.addEventListener('scroll', alBajar, { passive: true, capture: true });
  alBajar();

  // Marcar la página actual
  const ruta = document.body.dataset.actual || '/';
  document.querySelectorAll('[data-pagina]').forEach(function (link) {
    if (link.dataset.pagina === ruta) link.classList.add('actual');
  });

  // Menú en celular
  boton.addEventListener('click', function () {
    const abierto = menuMovil.classList.toggle('hidden') === false;
    boton.setAttribute('aria-expanded', abierto);
    menu.classList.toggle('con-fondo', abierto || window.scrollY > 10);
    boton.querySelector('use').setAttribute('href', abierto ? '#cerrar' : '#menu');
  });
}


// ---------- Logos de marcas (solo en inicio) ----------
const MARCAS = [
  'toyota', 'honda', 'nissan', 'hyundai', 'kia', 'mazda', 'mitsubishi', 'subaru',
  'ford', 'chevrolet', 'jeep', 'ram', 'volkswagen', 'bmw', 'mercedes', 'audi',
  'porsche', 'landrover', 'cadillac', 'acura', 'infiniti', 'tesla'
];

function crearCintaDeMarcas() {
  const cinta = document.getElementById('cinta-marcas');
  if (!cinta) return;

  let logos = '';
  MARCAS.forEach(function (marca) {
    const alto = marca === 'landrover' ? 'h-12' : 'h-8 sm:h-10';
    logos += `
      <div class="flex h-16 shrink-0 items-center px-8 sm:px-12">
        <img src="${BASE}assets/logos/${marca}.svg" alt="${marca}" class="logo-blanco ${alto} w-auto opacity-60" loading="lazy">
      </div>`;
  });

  // Se repite dos veces para que el movimiento no tenga cortes
  cinta.innerHTML = logos + logos;
}


// ---------- Preguntas frecuentes ----------
function iniciarPreguntas() {
  document.querySelectorAll('.pregunta button').forEach(function (boton) {
    boton.addEventListener('click', function () {
      const pregunta = boton.parentElement;
      const estabaAbierta = pregunta.classList.contains('abierta');

      document.querySelectorAll('.pregunta').forEach(p => p.classList.remove('abierta'));
      if (!estabaAbierta) pregunta.classList.add('abierta');
    });
  });
}


// ---------- Animaciones ----------
function iniciarAnimaciones() {
  if (!hayGsap || reducirMovimiento) {
    document.querySelectorAll('.aparecer').forEach(el => el.style.opacity = 1);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Scroll suave
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    if (window.alBajarMenu) lenis.on('scroll', window.alBajarMenu);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Elementos que aparecen al bajar
  ScrollTrigger.batch('.aparecer', {
    start: 'top 88%',
    onEnter: elementos => gsap.to(elementos, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' })
  });

  // Portada de inicio
  if (document.getElementById('portada')) {
    gsap.from('.portada-fondo', { scale: 1.08, opacity: 0, duration: 1.6, ease: 'power3.out' });
    gsap.from('.portada-linea > span', { yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'power4.out', delay: 0.15 });
    gsap.from('.portada-aparece', { opacity: 0, y: 24, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.45 });
    gsap.to('.portada-fondo', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '#portada', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  // Pasos en horizontal (solo computadora)
  const pasos = document.getElementById('pasos');
  if (pasos) {
    gsap.matchMedia().add('(min-width: 1024px)', function () {
      const distancia = () => pasos.scrollWidth - window.innerWidth + 56;
      gsap.to(pasos, {
        x: () => -distancia(),
        ease: 'none',
        scrollTrigger: {
          trigger: '#seccion-pasos',
          start: 'top top',
          end: () => '+=' + distancia(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    });
  }
}


// ---------- Arranque ----------
document.addEventListener('DOMContentLoaded', function () {
  crearCintaDeMarcas();
  llenarContacto();
  activarWhatsapp();
  iniciarMenu();
  iniciarPreguntas();

  // Las animaciones empiezan cuando termina la pantalla de carga
  if (window.FC_CARGADO) iniciarAnimaciones();
  else document.addEventListener('fc:cargado', iniciarAnimaciones, { once: true });
});
