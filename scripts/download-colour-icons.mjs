/**
 * Download remaining colour icons from Figma REST API.
 * Usage: FIGMA_TOKEN=your_token node scripts/download-colour-icons.mjs
 *
 * Get your personal access token at: figma.com/settings → Personal access tokens
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../docs/assets/icons/colour');
const FILE_KEY = 'a7JnfZ0Nd8df1TBPaMQ5Tj';
const TOKEN = process.env.FIGMA_TOKEN;

if (!TOKEN) {
  console.error('Error: set FIGMA_TOKEN environment variable');
  console.error('  export FIGMA_TOKEN=your_personal_access_token');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

// All remaining colour icons that haven't been exported yet
const ICONS = [
  // medical / health
  { id: '3862:165662', file: 'lung.svg' },
  { id: '3862:165677', file: 'poison.svg' },
  { id: '3862:165709', file: 'fire.svg' },
  { id: '3862:165643', file: 'tooth.svg' },
  { id: '3862:165624', file: 'brain.svg' },
  { id: '3862:166121', file: 'bandaid-yellow.svg' },
  { id: '3862:166141', file: 'syringe.svg' },
  { id: '3862:166161', file: 'monitor.svg' },
  { id: '3862:166176', file: 'bottle-medical.svg' },
  { id: '3862:166188', file: 'dropper.svg' },
  { id: '3862:166202', file: 'medical-generic.svg' },
  { id: '3862:166211', file: 'doctor.svg' },
  { id: '3862:166251', file: 'medical-report.svg' },
  { id: '3862:166266', file: 'hospital.svg' },
  { id: '3862:166307', file: 'bandaid-red.svg' },
  // biscuit (special case - complex)
  { id: '3862:164894', file: 'biscuit.svg' },
  // emotions
  { id: '3862:164332', file: 'expired.svg' },
  { id: '3862:164499', file: 'excited.svg' },
  { id: '3862:164545', file: 'awake.svg' },
  { id: '3862:164652', file: 'happy.svg' },
  { id: '3862:164693', file: 'sick.svg' },
  { id: '3862:164723', file: 'exhausted.svg' },
  { id: '3862:164764', file: 'confident.svg' },
  { id: '3862:164798', file: 'proud.svg' },
  // feature / context
  { id: '3862:165066', file: 'ufo.svg' },
  { id: '3862:165079', file: 'rocketliftoff.svg' },
  { id: '3862:165190', file: 'abc.svg' },
  { id: '3862:165203', file: 'after-school.svg' },
  { id: '3862:165212', file: 'before-school.svg' },
  { id: '3862:165221', file: 'vacation.svg' },
  { id: '3862:165262', file: 'cake.svg' },
  { id: '3862:165367', file: 'bus.svg' },
  { id: '3862:165444', file: 'post-observation.svg' },
  { id: '3862:165457', file: 'moment.svg' },
  { id: '3862:165468', file: 'document.svg' },
  { id: '3862:165481', file: 'table.svg' },
  { id: '3862:165484', file: 'plan.svg' },
  { id: '3862:165535', file: 'child.svg' },
  { id: '3862:165772', file: 'playground.svg' },
  { id: '3862:165795', file: 'plane.svg' },
  { id: '3862:165804', file: 'plane-dark.svg' },
  { id: '3862:165813', file: 'moon-dark.svg' },
  { id: '3862:166030', file: 'icons8-moon-rover-1.svg' },
  { id: '3862:166073', file: 'kindergarten.svg' },
  { id: '3862:167056', file: 'icons8-ufo-1.svg' },
  { id: '3862:167089', file: 'expired-2.svg' },
  // rocket documents
  { id: '3862:165093', file: 'rocketdocument.svg' },
  { id: '3862:165108', file: 'rocketdocument-2.svg' },
  { id: '3862:165121', file: 'rocketdocument-dotted.svg' },
  // file / finance
  { id: '3862:165181', file: 'book.svg' },
  { id: '3862:165234', file: 'money-transfer.svg' },
  { id: '3862:165403', file: 'email.svg' },
  { id: '3862:165409', file: 'phone.svg' },
  { id: '3862:165745', file: 'note.svg' },
  { id: '3862:165851', file: 'card.svg' },
  { id: '3862:165879', file: 'piggy-bank.svg' },
  { id: '3862:165899', file: 'money.svg' },
  { id: '3862:165916', file: 'generic.svg' },
  { id: '3862:165937', file: 'generic-1.svg' },
  { id: '3862:165958', file: 'plans.svg' },
  { id: '3862:166061', file: 'column.svg' },
  // content / action
  { id: '3862:165014', file: 'gallery.svg' },
  { id: '3862:165028', file: 'media.svg' },
  { id: '3862:165039', file: 'pencil.svg' },
  { id: '3862:165248', file: 'person.svg' },
  { id: '3862:165291', file: 'add.svg' },
  { id: '3862:165313', file: 'camera.svg' },
  { id: '3862:165422', file: 'camera-1.svg' },
  { id: '3862:165493', file: 'health-event.svg' },
  { id: '3862:165501', file: 'calendar.svg' },
  { id: '3862:165518', file: 'calendar-dark.svg' },
  { id: '3862:165720', file: 'missing.svg' },
  { id: '3862:165739', file: 'time.svg' },
  { id: '3862:165750', file: 'question.svg' },
  { id: '3862:165764', file: 'reject.svg' },
  { id: '3862:165783', file: 'remove.svg' },
  { id: '3862:165823', file: 'time-dark.svg' },
  { id: '3862:165836', file: 'alarm.svg' },
  { id: '3862:165866', file: 'contactcard.svg' },
  { id: '3862:166000', file: 'family.svg' },
  { id: '3862:166048', file: 'visitor.svg' },
  { id: '3862:167290', file: 'payment-icon-scheduled-rejected-1.svg' },
  { id: '3862:167296', file: 'stars.svg' },
  // sign in / out
  { id: '3862:164272', file: 'signout-large.svg' },
  { id: '3862:164280', file: 'signin-large.svg' },
  { id: '3862:165004', file: 'health-outlined.svg' },
  { id: '3862:165006', file: 'signin.svg' },
  { id: '3862:165057', file: 'bookmark.svg' },
  { id: '3862:165134', file: 'babysignin.svg' },
  { id: '3862:165173', file: 'graph-half.svg' },
  { id: '3862:165177', file: 'graph-quarter.svg' },
  { id: '3862:165417', file: 'tick.svg' },
  { id: '3862:165437', file: 'comment.svg' },
  { id: '3862:165550', file: 'thumbs.svg' },
  { id: '3862:165556', file: 'love.svg' },
  { id: '3862:165565', file: 'thank.svg' },
  { id: '3862:165655', file: 'electricity.svg' },
  { id: '3862:165979', file: 'signout.svg' },
  { id: '3862:165986', file: 'bookin.svg' },
  { id: '3862:166097', file: 'location.svg' },
  { id: '3862:166109', file: 'globe.svg' },
  { id: '3862:166119', file: 'health.svg' },
  { id: '3862:166299', file: 'medical-heart.svg' },
  { id: '3862:165328', file: 'emergency.svg' },
  // arrows
  { id: '3862:165286', file: 'arrow-left.svg' },
  { id: '3862:165735', file: 'arrowcurved-left.svg' },
  { id: '3862:165774', file: 'arrowcurved-right.svg' },
  { id: '3862:165778', file: 'arrow-right.svg' },
  { id: '3862:165790', file: 'arrow-top.svg' },
  { id: '3862:165831', file: 'arrow-bottom.svg' },
];

// Figma REST API: export nodes as SVG (returns URLs, then download)
const BATCH = 20; // nodes per API call

async function fetchSvgUrls(nodeIds) {
  const ids = nodeIds.join(',');
  const url = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${ids}&format=svg&svg_include_id=false`;
  const res = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } });
  if (!res.ok) throw new Error(`Figma API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (data.err) throw new Error(`Figma export error: ${data.err}`);
  return data.images; // { nodeId: url }
}

async function downloadSvg(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  return res.text();
}

async function run() {
  console.log(`Downloading ${ICONS.length} colour icons...`);
  let done = 0, failed = 0;

  for (let i = 0; i < ICONS.length; i += BATCH) {
    const batch = ICONS.slice(i, i + BATCH);
    const nodeIds = batch.map(ic => ic.id.replace(':', '-')); // Figma API uses dashes

    let urls;
    try {
      urls = await fetchSvgUrls(nodeIds);
    } catch (e) {
      console.error(`Batch ${i}-${i+BATCH} URL fetch failed:`, e.message);
      failed += batch.length;
      continue;
    }

    await Promise.all(batch.map(async (icon) => {
      const key = icon.id.replace(':', '-');
      const url = urls[key];
      if (!url) { console.warn(`  No URL for ${icon.file}`); failed++; return; }
      try {
        const svg = await downloadSvg(url);
        writeFileSync(join(OUTPUT_DIR, icon.file), svg, 'utf8');
        console.log(`  ✓ ${icon.file}`);
        done++;
      } catch (e) {
        console.error(`  ✗ ${icon.file}:`, e.message);
        failed++;
      }
    }));
  }

  console.log(`\nDone: ${done} written, ${failed} failed.`);
}

run().catch(e => { console.error(e); process.exit(1); });
