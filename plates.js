// ── Plate Generator ───────────────────────────────────────────
const PLATE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generatePlate() {
  const length = Math.random() < 0.5 ? 6 : 7;
  let plate = '';
  for (let i = 0; i < length; i++) {
    plate += PLATE_CHARS[Math.floor(Math.random() * PLATE_CHARS.length)];
  }
  return plate;
}

function generateAllPlates(count) {
  return Array.from({ length: count }, generatePlate);
}
