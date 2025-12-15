#!/bin/bash

# Define paths relative to repo root
SOURCE="CHANGELOG.md"
DEST_DIR="apps/docs/src/routes/docs/changelog"
DEST="$DEST_DIR/+page.svx"

# Ensure destination directory exists
mkdir -p "$DEST_DIR"

# Copy the file
echo "Syncing Changelog from $SOURCE to $DEST..."
cp "$SOURCE" "$DEST"

# Add the new file to git staging area so it's included in the commit
git add "$DEST"
