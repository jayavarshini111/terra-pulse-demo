// script.js — GPS + load advisory.json + UI behavior
const FIELD_EL = document.getElementById('fieldId');
const GPS_EL = document.getElementById('gps');
const LOADER = document.getElementById('loader');
const ADVISORY = document.getElementById('advisory');
const MSG = document.getElementById('message');
const CROP = document.getElementById('crop');
const SOW = document.getElementById('sow');
const WATER = document.getElementById('water');
const FERT = document.getElementById('fert');
const CONF = document.getElementById('conf');
const PLAY = document.getElementById('playBtn');
const PDFBTN = document.getElementById('pdfBtn');
const VOICE = document.getElementById('voice');

function showLoader() { LOADER.classList.remove('hidden'); ADVISORY.classList.add('hidden'); MSG.innerText=''; }
function hideLoader() { LOADER.classList.add('hidden'); }

const params = new URLSearchParams(location.search);
const fieldID = params.get('fieldID') || 'DEMO-01';
FIELD_EL.innerText = fieldID;

// start the demo flow
showLoader();
if (!('geolocation' in navigator)) {
  GPS_EL.innerText = 'GPS not available';
  hideLoader();
  MSG.innerText = 'Location is required. Use a device with GPS.';
} else {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    GPS_EL.innerText = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
    // simulate fetching advisory data
    try {
      const res = await fetch('advisory.json');
      const db = await res.json();
      // find matching field in advisory.json or fallback to first
      const record = (db.fields || []).find(f => f.field_id === fieldID) || (db.fields && db.fields[0]);
      if (!record) {
        MSG.innerText = 'No advisory data found.';
        hideLoader();
        return;
      }
      // small "verification" check: show distance message if far (demo logic)
      // (skip rigorous haversine for now)
      // display advisory
      CROP.innerText = record.recommendation.crop;
      SOW.innerText = record.recommendation.sow_window.join(' to ');
      WATER.innerText = record.operations.watering;
      FERT.innerText = record.operations.fertilizer;
      CONF.innerText = Math.round((record.confidence||0)*100) + '%';
      hideLoader();
      ADVISORY.classList.remove('hidden');
    } catch (err) {
      hideLoader();
      MSG.innerText = 'Failed to load advisory.json. Make sure file is uploaded.';
    }
  }, (err) => {
    hideLoader();
    GPS_EL.innerText = 'GPS denied';
    MSG.innerText = 'Allow location permission and reload the page.';
  }, { enableHighAccuracy: true, timeout: 12000 });
}

PLAY.onclick = () => {
  VOICE.play();
};

// PDF generation: uses browser print as simple fallback
PDFBTN.onclick = () => {
  window.print();
};
