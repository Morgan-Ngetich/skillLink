#!/bin/bash
# scripts/generate-client-interactive.sh
set -e

echo "🚀 Interactive Client Generation (Core Protected)"
echo "================================================="

# Get absolute paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLIENT_DIR="$PROJECT_ROOT/src/client"
TEMP_DIR="/tmp/client-generation-$(date +%s)"
BACKUP_DIR="/tmp/client-backup-$(date +%s)"

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Client dir: $CLIENT_DIR"

# Check if backend is running
echo ""
echo "🔍 Checking if backend is running..."
if ! curl -s http://localhost:8000/api/v1/openapi.json > /dev/null; then
  echo "❌ Backend is not running at http://localhost:8000"
  echo "   Please start the backend first: cd backend && uvicorn app.main:app --reload"
  exit 1
fi
echo "✅ Backend is running"

# Check if client folder exists
if [ ! -d "$CLIENT_DIR" ]; then
  echo ""
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

# Backup entire client folder
echo ""
echo "📦 Creating full backup..."
cp -r "$CLIENT_DIR" "$BACKUP_DIR"
echo "   Backup saved to: $BACKUP_DIR"

# Generate new client to temp directory
echo ""
echo "⚙️ Generating new client to temp directory..."

# Save OpenAPI spec locally first
OPENAPI_FILE="/tmp/openapi-$(date +%s).json"
curl -s http://localhost:8000/api/v1/openapi.json > "$OPENAPI_FILE"

npx openapi-typescript-codegen \
  --input "$OPENAPI_FILE" \
  --output "$TEMP_DIR" \
  --client axios \
  --useOptions \
  --useUnionTypes \
  --exportSchemas true \
  --exportServices true \
  --exportModels true

# Clean up OpenAPI spec file
rm "$OPENAPI_FILE"

# 🔒 Delete generated core, preserve user's version
echo ""
echo "🔒 Protecting your custom files..."
rm -rf "$TEMP_DIR/core"

if [ -d "$CLIENT_DIR/core" ]; then
  echo "   ✓ Preserving core folder (unchanged)"
  cp -r "$CLIENT_DIR/core" "$TEMP_DIR/"
else
  echo "   ⚠️  No existing core folder found"
fi

# Preserve user files
USER_FILES=(
  "CancelablePromise.ts"
  ".gitignore"
  "README.md"
)

for file in "${USER_FILES[@]}"; do
  if [ -f "$CLIENT_DIR/$file" ]; then
    echo "   ✓ Preserving $file"
    cp "$CLIENT_DIR/$file" "$TEMP_DIR/"
  fi
done

# Show detailed diff
echo ""
echo "📊 Changes Summary:"
echo "==================="

# Services diff
if [ -d "$TEMP_DIR/services" ] && [ -d "$CLIENT_DIR/services" ]; then
  OLD_SERVICES=$(ls "$CLIENT_DIR/services" 2>/dev/null || echo "")
  NEW_SERVICES=$(ls "$TEMP_DIR/services" 2>/dev/null || echo "")
  
  # Find added services
  ADDED=$(comm -13 <(echo "$OLD_SERVICES" | sort) <(echo "$NEW_SERVICES" | sort))
  # Find removed services
  REMOVED=$(comm -23 <(echo "$OLD_SERVICES" | sort) <(echo "$NEW_SERVICES" | sort))
  
  if [ -n "$ADDED" ]; then
    echo "  ➕ New services:"
    echo "$ADDED" | sed 's/^/     - /'
  fi
  
  if [ -n "$REMOVED" ]; then
    echo "  ➖ Removed services:"
    echo "$REMOVED" | sed 's/^/     - /'
  fi
  
  if [ -z "$ADDED" ] && [ -z "$REMOVED" ]; then
    echo "  ✓ Services unchanged"
  fi
fi

# Models diff
if [ -d "$TEMP_DIR/models" ] && [ -d "$CLIENT_DIR/models" ]; then
  OLD_MODELS_COUNT=$(ls "$CLIENT_DIR/models" 2>/dev/null | wc -l)
  NEW_MODELS_COUNT=$(ls "$TEMP_DIR/models" 2>/dev/null | wc -l)
  
  if [ "$OLD_MODELS_COUNT" -ne "$NEW_MODELS_COUNT" ]; then
    echo "  📦 Models: $OLD_MODELS_COUNT → $NEW_MODELS_COUNT"
  else
    echo "  ✓ Models unchanged ($NEW_MODELS_COUNT files)"
  fi
fi

# Protected files
echo ""
echo "🔒 Protected Files (will NOT be overwritten):"
echo "   - core/ (entire folder)"
for file in "${USER_FILES[@]}"; do
  if [ -f "$CLIENT_DIR/$file" ]; then
    echo "   - $file"
  fi
done

# Ask for confirmation
echo ""
echo "⚠️  This will replace the client folder (except protected files)"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled. Cleaning up temp files..."
  rm -rf "$TEMP_DIR"
  rm -rf "$BACKUP_DIR"
  echo "✅ Nothing was changed"
  exit 0
fi

# Replace client folder
echo ""
echo "🔄 Replacing client folder..."
rm -rf "$CLIENT_DIR"
mv "$TEMP_DIR" "$CLIENT_DIR"

# Verify core folder
if [ -d "$CLIENT_DIR/core" ]; then
  echo "✅ Core folder preserved successfully!"
  
  # Count files in core
  CORE_FILES=$(find "$CLIENT_DIR/core" -type f | wc -l)
  echo "   ($CORE_FILES files in core/)"
else
  echo "⚠️  Warning: Core folder missing!"
  echo "   Restore from backup: cp -r \"$BACKUP_DIR/core\" \"$CLIENT_DIR/\""
fi

# Final summary
echo ""
echo "════════════════════════════════════════"
echo "✅ Client Generation Complete!"
echo "════════════════════════════════════════"
echo ""
echo "📝 What happened:"
echo "   ✓ Generated new client from OpenAPI spec"
echo "   ✓ Preserved core/ folder (unchanged)"
echo "   ✓ Preserved user-modified files"
echo "   ✓ Created backup at: $BACKUP_DIR"
echo ""
echo "📝 Next steps:"
echo "   1. Check changes: git diff src/client"
echo "   2. Test your app: npm run dev"
echo "   3. If satisfied, remove backup: rm -rf \"$BACKUP_DIR\""
echo "   4. If issues, restore: cp -r \"$BACKUP_DIR\"/* \"$CLIENT_DIR/\""
echo ""