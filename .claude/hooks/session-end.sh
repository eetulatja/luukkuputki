#!/bin/bash
# Session end hook - captures session metadata for the wiki

SESSION_DIR=".claude/sessions"
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
SESSION_FILE="$SESSION_DIR/$TIMESTAMP-summary.md"

# Create sessions directory if it doesn't exist
mkdir -p "$SESSION_DIR"

# Capture git information about this session
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Create a placeholder file - actual summary will be written by Claude
cat > "$SESSION_FILE.tmp" <<EOF
# Session Summary — $TIMESTAMP

**Branch:** $CURRENT_BRANCH
**Latest commit:** $CURRENT_COMMIT

*(Detailed summary to be completed)*
EOF

echo "Session metadata captured to: $SESSION_FILE.tmp"
