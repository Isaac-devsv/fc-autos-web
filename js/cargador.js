// ============================================
//  FC AUTOS — pantalla de carga entre secciones
//  Tacómetro de 0 a 120 km/h. Cuando la página termina
//  de cargar, la aguja llega a 120 y aparece el sitio.
// ============================================

(function () {
  const cargador = document.getElementById('cargador');
  const raiz = document.documentElement;

  window.FC_CARGADO = false;
  if (!cargador) { window.FC_CARGADO = true; return; }

  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAXIMO = 120;          // velocidad final
  const ZONA_ROJA = 100;       // desde aquí los segmentos son rojos
  const DURACION_MINIMA = reducir ? 300 : 1300; // tiempo mínimo antes de llegar a 120
  const ACELERACION_FINAL = reducir ? 150 : 450; // tramo final hasta 120
  const SALIDA = reducir ? 0 : 340;              // tiempo para cubrir la página al salir

  // ---------- Dibujo del tacómetro ----------
  const svg = cargador.querySelector('.cargador__svg');
  const lectura = cargador.querySelector('.cargador__vel');
  const NS = 'http://www.w3.org/2000/svg';
  const C = 150;                      // centro del dibujo (viewBox 300 × 300)
  const INICIO = 120, BARRIDO = 240;  // grados: de abajo a la izquierda, por la derecha, hasta arriba

  function angulo(kmh) { return (INICIO - BARRIDO * (kmh / MAXIMO)) * Math.PI / 180; }
  function punto(r, kmh) { const a = angulo(kmh); return [C + r * Math.cos(a), C + r * Math.sin(a)]; }
  function arco(r, desde, hasta) {
    const [x1, y1] = punto(r, desde), [x2, y2] = punto(r, hasta);
    const grande = BARRIDO * (hasta - desde) / MAXIMO > 180 ? 1 : 0;
    return 'M' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + grande + ' 0 ' + x2.toFixed(2) + ' ' + y2.toFixed(2);
  }
  function crear(tag, attrs, padre) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    (padre || svg).appendChild(el);
    return el;
  }

  // Pista exterior, avance blanco y zona roja
  crear('path', { d: arco(136, 0, MAXIMO), class: 'cg-pista' });
  const avance = crear('path', { d: arco(136, 0, ZONA_ROJA), class: 'cg-avance', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
  const roja = crear('path', { d: arco(136, ZONA_ROJA, MAXIMO), class: 'cg-roja', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });

  // Marcas cada 10 km/h y números cada 20
  for (let v = 0; v <= MAXIMO; v += 10) {
    const mayor = v % 20 === 0;
    const [x1, y1] = punto(mayor ? 128 : 131, v), [x2, y2] = punto(141, v);
    crear('line', { x1: x1, y1: y1, x2: x2, y2: y2, class: 'cg-marca' + (mayor ? ' mayor' : '') });
    if (mayor) {
      const [tx, ty] = punto(154, v);
      const t = crear('text', { x: tx.toFixed(1), y: (ty + 3).toFixed(1), 'text-anchor': 'middle', class: 'cg-numero' });
      t.textContent = v;
    }
  }

  // Segmentos (uno cada 5 km/h)
  const segmentos = [];
  const PASO = 5;
  for (let v = PASO / 2; v < MAXIMO; v += PASO) {
    const [x, y] = punto(110, v);
    const giro = angulo(v) * 180 / Math.PI;
    const seg = crear('rect', {
      x: (x - 6).toFixed(2), y: (y - 4.5).toFixed(2), width: 12, height: 9, rx: 1.6,
      transform: 'rotate(' + giro.toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ')',
      class: 'cg-seg' + (v > ZONA_ROJA ? ' roja' : '')
    });
    seg.dataset.v = v;
    segmentos.push(seg);
  }

  function mostrarVelocidad(kmh) {
    const v = Math.max(0, Math.min(MAXIMO, kmh));
    lectura.textContent = Math.round(v);
    lectura.classList.toggle('meta', Math.round(v) >= MAXIMO);
    avance.setAttribute('stroke-dashoffset', 1 - Math.min(v, ZONA_ROJA) / ZONA_ROJA);
    roja.setAttribute('stroke-dashoffset', 1 - Math.max(0, v - ZONA_ROJA) / (MAXIMO - ZONA_ROJA));
    segmentos.forEach(function (s) { s.classList.toggle('on', v >= +s.dataset.v); });
  }

  // ---------- Carga ----------
  const facil = t => 1 - Math.pow(1 - t, 3);
  const inicio = performance.now();
  let paginaLista = false, finalDesde = null, velFinalDesde = 0, velocidad = 0, terminado = false;

  raiz.classList.add('cargando');
  mostrarVelocidad(0);

  function cuadro(ahora) {
    const t = ahora - inicio;

    if (finalDesde === null) {
      // Mientras carga, sube hasta 108 km/h como máximo
      velocidad = 108 * facil(Math.min(1, t / (DURACION_MINIMA + 250)));
      if (paginaLista && t >= DURACION_MINIMA) { finalDesde = ahora; velFinalDesde = velocidad; }
    } else {
      // Página lista: acelera hasta 120
      const p = Math.min(1, (ahora - finalDesde) / ACELERACION_FINAL);
      velocidad = velFinalDesde + (MAXIMO - velFinalDesde) * (p * p);
      if (p >= 1) { mostrarVelocidad(MAXIMO); terminar(); return; }
    }
    mostrarVelocidad(velocidad);
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);

  function terminar() {
    if (terminado) return;
    terminado = true;
    setTimeout(function () {
      cargador.classList.add('listo');
      raiz.classList.remove('cargando');
      window.FC_CARGADO = true;
      document.dispatchEvent(new Event('fc:cargado'));
    }, reducir ? 0 : 220);
  }

  function alCargar() { paginaLista = true; }
  if (document.readyState === 'complete') alCargar();
  else window.addEventListener('load', alCargar);
  setTimeout(alCargar, 6000); // por si algún archivo tarda demasiado

  // ---------- Al ir a otra sección del sitio ----------
  document.addEventListener('click', function (e) {
    const enlace = e.target.closest('a[href]');
    if (!enlace || e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (enlace.target === '_blank' || enlace.hasAttribute('download')) return;

    const destino = new URL(enlace.href, window.location.href);
    if (destino.origin !== window.location.origin) return;
    if (destino.pathname === window.location.pathname && destino.hash) return;

    e.preventDefault();
    mostrarVelocidad(0);
    cargador.classList.remove('listo');
    cargador.classList.add('saliendo');
    raiz.classList.add('cargando');
    setTimeout(function () { window.location.href = destino.href; }, SALIDA);
  });

  // Si el navegador regresa con el botón "atrás"
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    cargador.classList.remove('saliendo');
    cargador.classList.add('listo');
    raiz.classList.remove('cargando');
  });
})();
