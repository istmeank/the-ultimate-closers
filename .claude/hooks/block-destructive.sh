#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')
if echo "$COMMAND" | grep -qE '\brm\s+(-[a-zA-Z]*r[a-zA-Z]*\s|-r\s|--recursive)'; then
  jq -n '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Commande destructrice rm -rf bloquee par hook gouvernance TUC."}}'
  exit 0
fi
if echo "$COMMAND" | grep -qE 'git\s+push\s+(--force|-f)\b'; then
  jq -n '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"git push --force bloque par hook gouvernance TUC."}}'
  exit 0
fi
exit 0
