/* Reproducible, version- and SHA256-guarded backport. Uses only Node built-ins. */
const fs = require('node:fs');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');

const digest = value => createHash('sha256').update(value).digest('hex');
const projectRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'patches/baileys-newsletter-rc14.json'), 'utf8'));

function atomicWrite(file, content) {
  const temp = file + '.newsletter-' + randomUUID();
  try {
    fs.writeFileSync(temp, content, { mode: fs.statSync(file).mode });
    fs.renameSync(temp, file); // Also avoids changing another project's Bun hard-linked cache.
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}

function applyPatch(packageRoot, mode = 'apply') {
  const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  if (pkg.name !== manifest.package || pkg.version !== manifest.version) {
    throw new Error(`Expected ${manifest.package}@${manifest.version}; found ${pkg.name}@${pkg.version}. No files changed.`);
  }
  const pending = [];
  for (const spec of manifest.files) {
    const file = path.join(packageRoot, spec.path);
    const original = fs.readFileSync(file, 'utf8');
    const current = digest(original);
    if (mode === 'check') {
      if (current !== spec.afterSha256) throw new Error(`Newsletter patch missing or altered: ${spec.path}`);
      continue;
    }
    const reverse = mode === 'revert';
    const wanted = reverse ? spec.beforeSha256 : spec.afterSha256;
    const allowed = reverse ? spec.afterSha256 : spec.beforeSha256;
    if (current === wanted) continue;
    if (current !== allowed) throw new Error(`Unexpected contents in ${spec.path}. No files changed; inspect existing package modifications.`);
    let replacement = original;
    const edits = reverse ? [...spec.edits].reverse() : spec.edits;
    for (const edit of edits) {
      const before = reverse ? edit.after : edit.before;
      const after = reverse ? edit.before : edit.after;
      if (replacement.split(before).length !== 2) throw new Error(`Ambiguous patch anchor: ${spec.path}`);
      replacement = replacement.replace(before, after);
    }
    if (digest(replacement) !== wanted) throw new Error(`Patch checksum mismatch: ${spec.path}`);
    pending.push({ file, original, replacement });
  }
  const completed = [];
  try {
    for (const change of pending) {
      atomicWrite(change.file, change.replacement);
      completed.push(change);
    }
  } catch (error) {
    for (const change of completed.reverse()) atomicWrite(change.file, change.original);
    throw error;
  }
  return { patchId: manifest.patchId, changed: pending.length, mode };
}

function patchLibsignal() {
  try {
    const sessionCipherPath = require.resolve('libsignal/src/session_cipher.js', { paths: [projectRoot] });
    if (fs.existsSync(sessionCipherPath)) {
      let content = fs.readFileSync(sessionCipherPath, 'utf8');
      if (content.includes('console.error("Failed to decrypt message with any known session...");')) {
        content = content.replace(
          /console\.error\("Failed to decrypt message with any known session\.\.\."\);/g,
          '/* sanitized Bad MAC log */'
        );
        content = content.replace(
          /console\.error\("Session error:" \+ e, e\.stack\);/g,
          '/* sanitized session error */'
        );
        fs.writeFileSync(sessionCipherPath, content, 'utf8');
        console.log('[libsignal] Suppressed noisy Bad MAC / failed to decrypt console.error');
      }
    }
  } catch (e) {
    // Ignore if libsignal not resolvable
  }
}

module.exports = { applyPatch, patchLibsignal };
if (require.main === module) {
  try {
    patchLibsignal();
    const mode = process.argv.includes('--check') ? 'check' : process.argv.includes('--revert') ? 'revert' : 'apply';
    const packageRoot = path.dirname(require.resolve('@whiskeysockets/baileys/package.json', { paths: [projectRoot] }));
    const result = applyPatch(packageRoot, mode);
    console.log(`[Baileys] ${result.patchId}: ${mode} OK (${result.changed} files changed)`);
  } catch (error) {
    console.error(`[Baileys newsletter patch] ${error.message}`);
    process.exitCode = 1;
  }
}
