#!/bin/bash
cd "$CLAUDE_PROJECT_DIR" || exit 0
if ! git rev-parse --git-dir > /dev/null 2>&1; then exit 0; fi
CHANGES=$(git status --porcelain | wc -l)
if [ "$CHANGES" -eq 0 ]; then exit 0; fi
CURRENT_BRANCH=$(git branch --show-current)
git stash push -u -m "auto-stash before snapshot $(date -u +%s)" > /dev/null 2>&1
git checkout -B "claude-snapshots" > /dev/null 2>&1
git stash pop > /dev/null 2>&1
git add -A
git commit -m "snapshot: $(date -u +%Y-%m-%dT%H:%M:%SZ) end-of-turn" --no-verify > /dev/null 2>&1
git checkout "$CURRENT_BRANCH" > /dev/null 2>&1
exit 0
