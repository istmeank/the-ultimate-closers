#!/bin/bash
cd "$CLAUDE_PROJECT_DIR" || exit 0
DATE_NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
LAST_COMMITS=$(git log --pretty=format:"%h %s" -3 2>/dev/null || echo "(pas de git)")
MODIFIED=$(git status --porcelain 2>/dev/null | head -5 || echo "(pas de git)")
cat <<CONTEXT
[Contexte injecté automatiquement — hook UserPromptSubmit — TUC tech]
Date UTC : $DATE_NOW
3 derniers commits : $LAST_COMMITS
Fichiers en cours : $MODIFIED
CONTEXT
exit 0
