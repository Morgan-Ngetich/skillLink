#!/usr/bin/env python3
"""
Convert TanStack Router routes to lazy loading pattern.
Splits route files into config (.tsx) and lazy component (.lazy.tsx) files.
"""

import os
import re
import shutil
from pathlib import Path

def extract_route_path(content: str) -> str:
    """Extract route path from createFileRoute call."""
    match = re.search(r'createFileRoute\(["\']([^"\']+)["\']\)', content)
    return match.group(1) if match else None

def extract_imports(content: str) -> list[str]:
    """Extract all import statements except createFileRoute."""
    lines = content.split('\n')
    imports = []
    for line in lines:
        if line.strip().startswith('import') and 'createFileRoute' not in line:
            imports.append(line)
    return imports

def extract_component_name(content: str) -> str:
    """Extract component name from Route export."""
    # Try to find component: ComponentName
    match = re.search(r'component:\s*(\w+)', content)
    if match:
        return match.group(1)
    
    # Try to find component: () => ...
    if 'component: ()' in content or 'component:()' in content:
        return 'RouteComponent'
    
    return 'Component'

def extract_component_code(content: str) -> str:
    """Extract component definition and helper code."""
    lines = content.split('\n')
    component_lines = []
    in_component = False
    skip_import = True
    
    for i, line in enumerate(lines):
        # Skip imports at the start
        if skip_import:
            if line.strip().startswith('import') or not line.strip():
                continue
            skip_import = False
        
        # Stop at export const Route
        if 'export const Route' in line:
            break
        
        # Capture everything else (component definitions, functions, etc.)
        if line.strip():
            component_lines.append(line)
    
    return '\n'.join(component_lines)

def convert_route_file(file_path: Path) -> bool:
    """Convert a single route file to lazy loading pattern."""
    lazy_path = file_path.with_suffix('.lazy.tsx')
    
    # Skip if .lazy.tsx already exists
    if lazy_path.exists():
        print(f"⏭️  Skipping (lazy exists): {file_path}")
        return False
    
    # Read original file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if no component property
    if 'component:' not in content:
        print(f"⏭️  Skipping (no component): {file_path}")
        return False
    
    # Extract route path
    route_path = extract_route_path(content)
    if not route_path:
        print(f"⚠️  Could not extract route path: {file_path}")
        return False
    
    print(f"🔄 Converting: {file_path}")
    print(f"   📍 Route: {route_path}")
    
    # Create backup
    backup_path = file_path.with_suffix('.tsx.backup')
    shutil.copy2(file_path, backup_path)
    
    # Extract components
    imports = extract_imports(content)
    component_name = extract_component_name(content)
    component_code = extract_component_code(content)
    
    # Create .lazy.tsx file
    lazy_content = [
        'import { createLazyFileRoute } from "@tanstack/react-router";',
        *imports,
        '',
        component_code,
        '',
        f"export const Route = createLazyFileRoute('{route_path}')({{",
        f"  component: {component_name},",
        '});',
    ]
    
    with open(lazy_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lazy_content))
    
    # Update original file (config only)
    config_content = [
        'import { createFileRoute } from "@tanstack/react-router";',
        '',
        f"export const Route = createFileRoute('{route_path}')({{",
        '  // Add loader, searchParams, etc. here if needed',
        '});',
    ]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(config_content))
    
    print(f"   ✅ Created: {lazy_path.name}")
    print(f"   ✅ Updated: {file_path.name}")
    print()
    
    return True

def main():
    """Main conversion function."""
    print("🚀 Converting crackmode routes to lazy loading pattern...\n")
    
    # Get script directory and navigate to project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent  # Go up one level from scripts/
    routes_dir = project_root / 'src' / 'routes' / 'crackmode'
    
    # Change to project root for consistent paths
    os.chdir(project_root)
    
    if not routes_dir.exists():
        print(f"❌ Directory not found: {routes_dir}")
        return
    
    # Find all .tsx files (excluding .lazy.tsx)
    tsx_files = [
        f for f in routes_dir.rglob('*.tsx')
        if not f.name.endswith('.lazy.tsx')
    ]
    
    converted = 0
    skipped = 0
    
    for file_path in sorted(tsx_files):
        if convert_route_file(file_path):
            converted += 1
        else:
            skipped += 1
    
    print("\n" + "="*60)
    print("📊 Conversion Summary:")
    print(f"   ✅ Converted: {converted} files")
    print(f"   ⏭️  Skipped: {skipped} files")
    print("\n⚠️  IMPORTANT: Review all converted files manually!")
    print("   - Verify component exports are correct")
    print("   - Check that imports are complete")
    print("   - Backups saved as *.tsx.backup")
    print("\n🔧 Next steps:")
    print("   1. Review the converted files")
    print("   2. Run: npm run generate")
    print("   3. Run: npm run build")
    print("   4. If everything works:")
    print("      find src/routes/crackmode -name '*.backup' -delete")
    print("="*60)

if __name__ == '__main__':
    main()