#!/usr/bin/env node
/**
 * check-supabase-abstraction — garde-fou ADR-025 / T28.
 *
 * Interdit tout accès direct au client Supabase depuis la couche présentation.
 * Seuls les adapters (src/lib/adapters/supabase/) et le client lui-même
 * (src/integrations/supabase/) ont le droit d'importer `supabase`.
 *
 * Pourquoi : la migration future vers un backend custom (ADR-025, phase 3) ne
 * doit toucher que les adapters. Un seul import orphelin dans un composant et
 * la migration redevient un chantier de refonte.
 *
 * Usage : node scripts/check-supabase-abstraction.mjs
 * Sortie : code 0 si conforme, 1 sinon (utilisable en pre-commit et en CI).
 *
 * Écrit en Node plutôt qu'en shell : le poste de travail est sous Windows,
 * un .sh n'y est pas exécutable nativement hors Git Bash.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');

/** Répertoires surveillés : la couche présentation et ses hooks. */
const WATCHED = ['src/components', 'src/pages', 'src/hooks', 'src/contexts'];

/** Seuls chemins autorisés à importer le client Supabase. */
const ALLOWED = ['src/lib/adapters/supabase', 'src/integrations/supabase'];

/**
 * Fichiers tolérés malgré une violation, avec la raison.
 * Toute entrée ici est une dette assumée : elle doit citer une tâche.
 */
const ALLOWLIST = new Map([
  [
    'src/pages/LeadDetailWithProtonANK.example.tsx',
    'Fichier d\'exemple non routé dans App.tsx — à supprimer ou à porter (voir backlog).',
  ],
]);

/** Motifs révélant un accès direct au backend depuis la présentation. */
const PATTERNS = [
  { re: /from\s+['"]@\/integrations\/supabase/, label: 'import du client Supabase' },
  { re: /from\s+['"].*\/adapters\/supabase\//, label: 'import direct d\'un adapter' },
  { re: /\bsupabase\s*\.\s*(from|auth|storage|functions|channel|rpc)\b/, label: 'appel supabase.* direct' },
];

const EXTENSIONS = ['.ts', '.tsx'];

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc; // répertoire absent : rien à vérifier
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, acc);
    } else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      acc.push(full);
    }
  }
  return acc;
}

function toPosix(p) {
  return p.split(sep).join('/');
}

const violations = [];
const tolerated = [];

for (const watched of WATCHED) {
  for (const file of walk(join(ROOT, watched))) {
    const rel = toPosix(relative(ROOT, file));
    if (ALLOWED.some((allowed) => rel.startsWith(allowed))) continue;

    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) return;
      for (const { re, label } of PATTERNS) {
        if (!re.test(line)) continue;
        const hit = { file: rel, line: index + 1, label, code: line.trim() };
        if (ALLOWLIST.has(rel)) tolerated.push({ ...hit, reason: ALLOWLIST.get(rel) });
        else violations.push(hit);
      }
    });
  }
}

if (tolerated.length > 0) {
  console.log('\nDette tolérée (allowlist explicite) :');
  for (const t of tolerated) {
    console.log(`  ~ ${t.file}:${t.line} — ${t.label}`);
    console.log(`    ${t.reason}`);
  }
}

if (violations.length > 0) {
  console.error('\nViolation de la règle d\'abstraction (ADR-025 / code-standards.md) :\n');
  for (const v of violations) {
    console.error(`  x ${v.file}:${v.line} — ${v.label}`);
    console.error(`    ${v.code}`);
  }
  console.error(
    `\n${violations.length} violation(s). La couche présentation doit passer par ` +
      'src/lib/services/. Si le service manque, on l\'ajoute — on ne contourne pas.\n'
  );
  process.exit(1);
}

console.log('\nAbstraction conforme : aucun accès direct à Supabase depuis components / pages / hooks / contexts.\n');
