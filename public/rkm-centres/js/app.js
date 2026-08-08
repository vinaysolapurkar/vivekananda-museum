/* ─── RKM Centres Map — app.js ─────────────────────────────────────── */

'use strict';

const CENTRES = window.CENTRES_DATA || [];

// ── State ────────────────────────────────────────────────────────────
let viewer        = null;
let filteredCentres = CENTRES.filter(c => c.lat !== null);
let selectedCountry = "all";
let searchQuery   = "";
let selectedId    = null;
let pinEntities   = {};

// Build lookup map
const CENTRES_MAP = {};
CENTRES.forEach(c => { CENTRES_MAP[c.id] = c; });

// ── Zoom constants (identical to Travels map) ─────────────────────────
const ZOOM_MIN = 400;
const ZOOM_MAX = 20000000;

function altToSlider(alt) {
  const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, alt));
  const logMin = Math.log(ZOOM_MIN), logMax = Math.log(ZOOM_MAX);
  return Math.round(100 * (1 - (Math.log(clamped) - logMin) / (logMax - logMin)));
}
function sliderToAlt(val) {
  const logMin = Math.log(ZOOM_MIN), logMax = Math.log(ZOOM_MAX);
  return Math.exp(logMin + (1 - val / 100) * (logMax - logMin));
}
function formatAlt(metres) {
  if (metres >= 1000000) return (metres / 1000000).toFixed(0) + ' Mm';
  if (metres >= 1000)    return (metres / 1000).toFixed(0) + ' km';
  return metres.toFixed(0) + ' m';
}

// ── Pin colours: Math = saffron, Mission = blue ───────────────────────
const PIN_COLORS = { math: '#E07B2E', mission: '#4A90D9' };

// ── Build/refresh all entity pins on the globe ────────────────────────
// Refined circular dot markers: saffron = Math, blue = Mission.
// Soft halo comes from a wide translucent same-hue outline.
function buildPins() {
  if (!viewer) return;
  viewer.entities.removeAll();
  pinEntities = {};

  filteredCentres.forEach(c => {
    if (c.lat === null) return;
    const isSelected = c.id === selectedId;
    const color = PIN_COLORS[c.type] || PIN_COLORS.math;
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(c.lng, c.lat),
      point: {
        pixelSize:      isSelected ? 15 : 10,
        color:          Cesium.Color.fromCssColorString(isSelected ? '#E8B45C' : color),
        outlineColor:   isSelected
                          ? Cesium.Color.fromCssColorString('#F5EDE0').withAlpha(0.9)
                          : Cesium.Color.fromCssColorString(color).withAlpha(0.25),
        outlineWidth:   isSelected ? 2 : 5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(2e6, 1.0, 1.2e7, 0.55),
        translucencyByDistance: new Cesium.NearFarScalar(1e5, 1.0, 2.5e7, 0.6),
      },
      label: {
        text: c.name.replace(/^Ramakrishna (Math|Mission|Ashrama),\s*/i, '').replace(/\s*-\s*a sub-centre.*/i, '').trim(),
        font:            '12px "DM Sans", sans-serif',
        fillColor:       Cesium.Color.fromCssColorString('#F5EDE0'),
        outlineColor:    Cesium.Color.fromCssColorString('#14100D'),
        outlineWidth:    3,
        style:           Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset:     new Cesium.Cartesian2(0, -16),
        verticalOrigin:  Cesium.VerticalOrigin.BOTTOM,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        translucencyByDistance: new Cesium.NearFarScalar(1.5e6, 1.0, 8e6, 0.0),
        show:            isSelected,
      },
      _centreId: c.id,
    });
    pinEntities[c.id] = entity;
  });
}

// ── Fly helpers ───────────────────────────────────────────────────────
function flyToCentered(c) {
  if (!viewer) return;
  const altitude = 1000000;  // 1 000 km — region zoom, pin clearly visible

  const canvas   = viewer.scene.canvas;
  const canvasW  = canvas.clientWidth;
  const canvasH  = canvas.clientHeight;

  const sidebarEl    = document.getElementById('sidebar');
  const sidebarW     = (sidebarEl && !sidebarEl.classList.contains('collapsed')) ? sidebarEl.offsetWidth : 0;
  const INFO_PANEL_W = 340;  // matches CSS width of #info-panel

  // Centre of the visible strip between sidebar and info panel
  const visibleCX = sidebarW + (canvasW - sidebarW - INFO_PANEL_W) / 2;
  const dxPx      = visibleCX - canvasW / 2;

  // Convert pixel offset → longitude degrees at target altitude
  const vFov  = (viewer.camera.frustum && viewer.camera.frustum.fov)
                  ? viewer.camera.frustum.fov
                  : Cesium.Math.toRadians(60);
  const hFov  = 2 * Math.atan(Math.tan(vFov / 2) * (canvasW / canvasH));
  const spanM = 2 * altitude * Math.tan(hFov / 2);
  const dLng  = -(dxPx / canvasW) * spanM / (111320 * Math.cos(Cesium.Math.toRadians(c.lat)));

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(c.lng + dLng, c.lat, altitude),
    duration: 1.6,
    easingFunction: Cesium.EasingFunction.CUBIC_OUT,
  });
}

function flyHome() {
  if (!viewer) return;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(78, 20, 12000000),
    duration: 1.5,
    easingFunction: Cesium.EasingFunction.CUBIC_OUT,
  });
}

// ── Info panel ────────────────────────────────────────────────────────
function openInfo(c) {
  selectedId = c.id;
  buildPins();

  // Image
  const imgEl = document.getElementById('info-image');
  const imgSrc = (window.CENTRE_IMAGES || {})[String(c.id)];
  if (imgSrc) {
    imgEl.src = imgSrc;
    imgEl.alt = c.name;
    imgEl.style.display = 'block';
  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
  }

  document.getElementById('info-name').textContent = c.name;
  const badge = document.getElementById('info-type-badge');
  badge.textContent  = c.type === 'math' ? 'Ramakrishna Math' : 'Ramakrishna Mission';
  badge.style.borderColor = PIN_COLORS[c.type];
  badge.style.color       = PIN_COLORS[c.type];
  document.getElementById('info-country').textContent =
    `${c.flag}  ${c.country}${c.state ? ' · ' + c.state : ''}`;

  const addrWrap = document.getElementById('info-address-wrap');
  document.getElementById('info-address').textContent = c.address || '';
  addrWrap.style.display = c.address ? '' : 'none';

  const phoneWrap = document.getElementById('info-phone-wrap');
  document.getElementById('info-phone').textContent = c.phone || '';
  phoneWrap.style.display = c.phone ? '' : 'none';

  const emailWrap = document.getElementById('info-email-wrap');
  const emailEl   = document.getElementById('info-email');
  if (c.email) { emailEl.textContent = c.email; emailEl.href = `mailto:${c.email}`; emailWrap.style.display = ''; }
  else          { emailWrap.style.display = 'none'; }

  const details = (window.CENTRE_DETAILS || {})[String(c.id)];
  const yearWrap = document.getElementById('info-year-wrap');
  if (details && details.year) {
    document.getElementById('info-year').textContent = details.year;
    yearWrap.style.display = '';
  } else {
    yearWrap.style.display = 'none';
  }
  const actsWrap = document.getElementById('info-activities-wrap');
  const actsList = document.getElementById('info-activities-list');
  if (details && details.activities && details.activities.length) {
    actsList.innerHTML = details.activities.map(a => `<li>${a}</li>`).join('');
    actsWrap.style.display = '';
  } else {
    actsWrap.style.display = 'none';
  }

  const idx = filteredCentres.findIndex(x => x.id === c.id);
  document.getElementById('info-counter').textContent = `${idx + 1} / ${filteredCentres.length}`;
  document.getElementById('info-panel').classList.add('open');

  document.querySelectorAll('.centre-item').forEach(el =>
    el.classList.toggle('active', parseInt(el.dataset.id) === c.id));

  if (c.lat !== null) flyToCentered(c);
}

function closeInfo() {
  selectedId = null;
  buildPins();
  document.getElementById('info-panel').classList.remove('open');
  document.querySelectorAll('.centre-item').forEach(el => el.classList.remove('active'));
}

function goPrev() {
  const idx = filteredCentres.findIndex(x => x.id === selectedId);
  if (idx > 0) openInfo(filteredCentres[idx - 1]);
}
function goNext() {
  const idx = filteredCentres.findIndex(x => x.id === selectedId);
  if (idx < filteredCentres.length - 1) openInfo(filteredCentres[idx + 1]);
}

// ── Filters & list ────────────────────────────────────────────────────
function applyFilters() {
  const q = searchQuery.toLowerCase();
  filteredCentres = CENTRES.filter(c => {
    if (c.lat === null) return false;
    if (selectedCountry !== 'all' && c.country !== selectedCountry) return false;
    if (q && !c.name.toLowerCase().includes(q) &&
             !(c.state || '').toLowerCase().includes(q) &&
             !(c.address || '').toLowerCase().includes(q)) return false;
    return true;
  });
  buildPins();
  renderList();
  document.getElementById('stat-showing').textContent = filteredCentres.length;
}

function renderList() {
  const el = document.getElementById('centre-list');
  if (!filteredCentres.length) {
    el.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:12px;">No centres match</div>`;
    return;
  }
  const groups = {};
  filteredCentres.forEach(c => { if (!groups[c.country]) groups[c.country] = []; groups[c.country].push(c); });

  let html = '';
  Object.entries(groups).sort(([a],[b]) => a === 'India' ? -1 : b === 'India' ? 1 : a.localeCompare(b))
    .forEach(([country, list]) => {
      html += `<div class="list-group-header">${list[0].flag} ${country}<span class="list-group-count">${list.length}</span></div>`;
      list.forEach(c => {
        const displayName = c.name
          .replace(/^Ramakrishna (Math|Mission|Mission Ashrama|Ashrama|Vedanta Centre|Vedanta Society),\s*/i, '')
          .replace(/\s*-\s*a sub-centre.*/i, '').trim();
        html += `<div class="centre-item${c.id === selectedId ? ' active' : ''}" data-id="${c.id}" onclick="openInfo(CENTRES_MAP[${c.id}])">
          <span class="centre-dot" style="background:${PIN_COLORS[c.type]}"></span>
          <span class="centre-name">${displayName}</span>
        </div>`;
      });
    });
  el.innerHTML = html;
}

// ── Country filter ────────────────────────────────────────────────────
function buildCountryFilter() {
  const counts = {};
  CENTRES.filter(c => c.lat !== null).forEach(c => { counts[c.country] = (counts[c.country] || 0) + 1; });
  const countries = Object.entries(counts).sort(([a],[b]) => a === 'India' ? -1 : b === 'India' ? 1 : a.localeCompare(b));

  let html = `<button class="country-chip active" data-country="all" onclick="selectCountry('all',this)">All <span class="chip-count">${CENTRES.filter(c=>c.lat!==null).length}</span></button>`;
  countries.forEach(([country, count]) => {
    const flag = CENTRES.find(c => c.country === country)?.flag || '';
    html += `<button class="country-chip" data-country="${country}" onclick="selectCountry('${country.replace(/'/g,"\\'")}',this)">${flag} ${country} <span class="chip-count">${count}</span></button>`;
  });
  document.getElementById('country-filter').innerHTML = html;
}

function selectCountry(country, btn) {
  selectedCountry = country;
  document.querySelectorAll('.country-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  closeInfo();
  applyFilters();
  if (country !== 'all') {
    const first = CENTRES.find(c => c.country === country && c.lat !== null);
    if (first) flyToCentered(first);
  } else {
    flyHome();
  }
}

// ── Zoom bar (identical logic to Travels map) ─────────────────────────
function setupZoomBar() {
  const slider  = document.getElementById('zoom-slider');
  const zoomIn  = document.getElementById('zoom-in-btn');
  const zoomOut = document.getElementById('zoom-out-btn');
  const label   = document.getElementById('zoom-label');

  function currentAlt() { return viewer.camera.positionCartographic.height; }

  function updateUI() {
    const alt = currentAlt();
    const v = altToSlider(alt);
    slider.value = v;
    slider.style.setProperty('--val', v);
    label.textContent = formatAlt(alt);
  }

  function flyToAlt(alt) {
    const pos = viewer.camera.positionCartographic;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromRadians(pos.longitude, pos.latitude,
        Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, alt))),
      duration: 0.5,
      easingFunction: Cesium.EasingFunction.CUBIC_OUT,
    });
  }

  viewer.camera.changed.addEventListener(updateUI);

  slider.addEventListener('input', () => {
    const alt = sliderToAlt(parseInt(slider.value, 10));
    const pos = viewer.camera.positionCartographic;
    viewer.camera.cancelFlight();
    viewer.camera.setView({ destination: Cesium.Cartesian3.fromRadians(pos.longitude, pos.latitude, alt) });
    slider.style.setProperty('--val', slider.value);
    label.textContent = formatAlt(alt);
  });

  zoomIn.addEventListener('click',  () => flyToAlt(currentAlt() * 0.4));
  zoomOut.addEventListener('click', () => flyToAlt(currentAlt() * 2.5));

  updateUI();
}

// ── Sidebar toggle ────────────────────────────────────────────────────
function toggleSidebar() {
  const sb  = document.getElementById('sidebar');
  const tog = document.getElementById('sidebar-toggle');
  sb.classList.toggle('collapsed');
  tog.textContent = sb.classList.contains('collapsed') ? '▶' : '◀';
}

// ── Keyboard ──────────────────────────────────────────────────────────
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') goNext();
  if (e.key === 'ArrowLeft')  goPrev();
  if (e.key === 'Escape')     closeInfo();
});

// ── Main async init ───────────────────────────────────────────────────
async function initApp() {
  Cesium.Ion.defaultAccessToken = '';

  viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider:       false,
    baseLayerPicker:       false,
    geocoder:              false,
    homeButton:            false,
    sceneModePicker:       false,
    navigationHelpButton:  false,
    animation:             false,
    timeline:              false,
    fullscreenButton:      false,
    infoBox:               false,
    selectionIndicator:    false,
    skyAtmosphere: new Cesium.SkyAtmosphere(),
    skyBox: new Cesium.SkyBox({
      sources: {
        positiveX: '/cesium/Assets/Textures/SkyBox/tycho2t3_80_px.jpg',
        negativeX: '/cesium/Assets/Textures/SkyBox/tycho2t3_80_mx.jpg',
        positiveY: '/cesium/Assets/Textures/SkyBox/tycho2t3_80_py.jpg',
        negativeY: '/cesium/Assets/Textures/SkyBox/tycho2t3_80_ny.jpg',
        positiveZ: '/cesium/Assets/Textures/SkyBox/tycho2t3_80_pz.jpg',
        negativeZ: '/cesium/Assets/Textures/SkyBox/tycho2t3_80_mz.jpg',
      }
    }),
  });

  // Satellite imagery + place labels (pre-downloaded locally — no internet required)
  viewer.imageryLayers.removeAll();
  const sat = new Cesium.UrlTemplateImageryProvider({
    url: 'tiles/imagery/{z}/{y}/{x}.jpg',
    tilingScheme: new Cesium.WebMercatorTilingScheme(),
    tileWidth: 256,
    tileHeight: 256,
    minimumLevel: 0,
    maximumLevel: 16
  });
  viewer.imageryLayers.addImageryProvider(sat);
  const labels = new Cesium.UrlTemplateImageryProvider({
    url: 'tiles/labels/{z}/{y}/{x}.png',
    tilingScheme: new Cesium.WebMercatorTilingScheme(),
    tileWidth: 256,
    tileHeight: 256,
    minimumLevel: 0,
    maximumLevel: 16
  });
  const labLayer = viewer.imageryLayers.addImageryProvider(labels);
  labLayer.alpha = 0.7;

  viewer.scene.globe.enableLighting = false;
  viewer.scene.sun.show = false;   // hide harsh white sun-glare disc
  viewer.clock.currentTime   = Cesium.JulianDate.fromDate(new Date('2024-03-21T17:45:00Z'));
  viewer.clock.shouldAnimate = false;

  // Hover cursor
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(movement => {
    const picked = viewer.scene.pick(movement.position);
    viewer.scene.canvas.style.cursor =
      (Cesium.defined(picked) && picked.id && picked.id._centreId) ? 'pointer' : 'default';
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // Click handler
  handler.setInputAction(e => {
    const picked = viewer.scene.pick(e.position);
    if (Cesium.defined(picked) && picked.id && picked.id._centreId) {
      openInfo(CENTRES_MAP[picked.id._centreId]);
    } else {
      closeInfo();
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // UI
  document.getElementById('stat-total').textContent     = CENTRES.length;
  document.getElementById('stat-geocoded').textContent  = CENTRES.filter(c => c.lat !== null).length;
  document.getElementById('stat-countries').textContent = new Set(CENTRES.map(c => c.country)).size;

  document.getElementById('search-input').addEventListener('input', e => {
    searchQuery = e.target.value;
    applyFilters();
  });

  buildCountryFilter();
  applyFilters();
  setupZoomBar();
  flyHome();

  document.getElementById('loading-overlay').style.display = 'none';
}

initApp().catch(console.error);
