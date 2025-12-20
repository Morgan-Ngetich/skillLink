#!/bin/bash
# scripts/generate-client-safe.sh
set -e

echo "🚀 Smart Client Generation"
echo "=========================="

# Get absolute paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLIENT_DIR="$PROJECT_ROOT/src/client"
BACKUP_DIR="/tmp/client-full-backup-$(date +%s)"

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Client dir: $CLIENT_DIR"

# Check if client folder exists
if [ ! -d "$CLIENT_DIR" ]; then
  echo "📁 No client folder found. Generating fresh..."
  npx openapi-typescript-codegen \
    --input http://localhost:8000/api/v1/openapi.json \
    --output "$CLIENT_DIR" \
    --client axios \
    --useOptions \
    --useUnionTypes \
    --exportSchemas true \
    --exportServices true \
    --exportModels true
  echo "✅ Fresh client generated!"
  exit 0
fi

# Backup ALL files (not just core)
echo "📦 Backing up entire client folder..."
cp -r "$CLIENT_DIR" "$BACKUP_DIR"

# Generate new version
echo "⚙️ Generating new client..."
npx openapi-typescript-codegen \
  --input http://localhost:8000/api/v1/openapi.json \
  --output "$CLIENT_DIR-new" \
  --client axios \
  --useOptions \
  --useUnionTypes \
  --exportSchemas true \
  --exportServices true \
  --exportModels true

# Smart merge: Keep user files, add new generated files
echo "🔄 Merging changes..."
# Copy user-modified core files back if they exist
if [ -d "$BACKUP_DIR/core" ]; then
  cp -r "$BACKUP_DIR/core" "$CLIENT_DIR-new/"
fi

# Copy any other non-generated files (index.ts, etc.)
for file in "$BACKUP_DIR"/*; do
  filename=$(basename "$file")
  # Keep these specific files if they exist in backup
  if [[ -f "$file" && ( "$filename" == "index.ts" || "$filename" == "CancelablePromise.ts" ) ]]; then
    cp "$file" "$CLIENT_DIR-new/"
  fi
done

# Replace old with new
rm -rf "$CLIENT_DIR"
mv "$CLIENT_DIR-new" "$CLIENT_DIR"

echo "✅ Client updated successfully!"
echo "💡 If any files are missing, they're in: $BACKUP_DIR"
echo "   Restore with: cp \"$BACKUP_DIR/path/to/file\" \"$CLIENT_DIR/\""