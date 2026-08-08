import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Configuration de test isolée de `vite.config.ts`.
 *
 * Deux raisons : `vite.config.ts` est un fichier protégé
 * (`.claude/rules/methodology-guard.md`), et le greffon `lovable-tagger`
 * n'a rien à faire dans une exécution de tests.
 *
 * L'alias vers le stub de client Supabase est volontaire : il permet de
 * charger les adapters sans ouvrir de connexion réseau ni toucher au
 * `localStorage`. C'est aussi la démonstration concrète d'ADR-025 —
 * si le client peut être remplacé par un stub, il peut être remplacé
 * par un autre backend.
 */
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\/integrations\/supabase\/client$/,
        replacement: path.resolve(__dirname, './src/test/supabase-client.stub.ts'),
      },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    reporters: 'default',
  },
});
