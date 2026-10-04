#!/usr/bin/env python3
"""
Unified Word to Markdown converter.
Automatically handles both .doc and .docx formats with full image preservation.

Usage:
    python scripts/convert_doc/word_to_md/convert_word_to_markdown.py document.doc
    python scripts/convert_doc/word_to_md/convert_word_to_markdown.py document.docx
    python scripts/convert_doc/word_to_md/convert_word_to_markdown.py --check
"""

import sys
import os
import subprocess
import tempfile
import shutil
from pathlib import Path

# Import functions from other scripts
import convert_doc_to_docx
import convert_with_images

def check_environment():
    """Print a quick environment/dependency check."""
    print("=" * 70, flush=True)
    print("Dependency Check", flush=True)
    print("=" * 70, flush=True)
    print(f"Python: {sys.executable} ({sys.version.split()[0]})", flush=True)
    print(f"uvx: {shutil.which('uvx') or 'not found'}", flush=True)
    print(f"markitdown: {shutil.which('markitdown') or 'not found'}", flush=True)

    local_venv = Path(__file__).resolve().parent / ".venv"
    local_markitdown = local_venv / ("Scripts/markitdown.exe" if os.name == "nt" else "bin/markitdown")
    print(f"local .venv markitdown: {local_markitdown if local_markitdown.exists() else 'not found'}", flush=True)

    soffice = convert_doc_to_docx.find_libreoffice()
    print(f"LibreOffice (soffice): {soffice or 'not found'}", flush=True)

    try:
        cmd = convert_with_images.get_markitdown_cmd()
        print(f"markitdown cmd: {' '.join(cmd)}", flush=True)
    except Exception as e:
        print(f"markitdown cmd: ERROR ({e})", flush=True)

    try:
        result = convert_with_images.run_markitdown(['--version'], timeout=60)
        if result.returncode == 0:
            version_text = (result.stdout or result.stderr).strip()
            if version_text:
                print(version_text, flush=True)
        else:
            print(f"markitdown --version failed: {result.stderr.strip()}", flush=True)
    except Exception as e:
        print(f"markitdown --version failed: {e}", flush=True)

def convert_word_to_markdown(input_file, embed_base64=False):
    """
    Convert Word document (.doc or .docx) to Markdown with images.

    Args:
        input_file: Path to .doc or .docx file
        embed_base64: If True, embed images as base64 instead of external files

    Returns:
        Tuple of (markdown_path, images_dir or None)
    """
    input_path = os.path.abspath(input_file)

    try:
        sys.stdout.reconfigure(line_buffering=True)
    except Exception:
        pass

    if not os.path.exists(input_path):
        raise FileNotFoundError(f"File not found: {input_path}")

    file_ext = os.path.splitext(input_path)[1].lower()

    if file_ext not in ['.doc', '.docx']:
        raise ValueError(f"Unsupported file type: {file_ext}. Only .doc and .docx are supported.")

    print("=" * 70)
    print("Word to Markdown Converter with Image Extraction", flush=True)
    print("=" * 70)
    print()

    # Handle .doc files - convert to .docx first
    if file_ext == '.doc':
        if not os.access(Path.home(), os.W_OK):
            raise RuntimeError(
                "Cannot convert .doc in this environment (HOME is not writable; LibreOffice headless may crash).\n"
                "Workaround: convert .doc → .docx outside the sandbox, then convert the .docx to Markdown."
            )
        print("📄 Detected legacy .doc format", flush=True)
        print("   Converting to .docx to preserve images and formatting...", flush=True)
        print()

        try:
            docx_path = convert_doc_to_docx.convert_doc_to_docx(input_path)
            print()
            print("✓ .doc → .docx conversion complete", flush=True)
            print()
        except Exception as e:
            print(f"\n✗ Failed to convert .doc to .docx: {e}", file=sys.stderr, flush=True)
            print("\nNote: .doc format requires LibreOffice.", file=sys.stderr, flush=True)
            print("Install: https://www.libreoffice.org/download/ (Windows) | brew install --cask libreoffice (macOS)", file=sys.stderr, flush=True)
            raise
    else:
        docx_path = input_path
        print("📄 Detected .docx format", flush=True)
        print()

    # Convert .docx to Markdown
    print("🔄 Converting to Markdown and extracting images...", flush=True)
    print("=" * 70)
    print()

    # Determine output paths
    base_name = os.path.splitext(docx_path)[0]
    md_path = f"{base_name}.md"
    images_dir = f"{base_name}_images"

    # Call the convert_with_images main function via subprocess
    # This ensures proper output formatting
    cmd = [
        sys.executable,
        os.path.join(os.path.dirname(__file__), 'convert_with_images.py'),
        docx_path
    ]

    if embed_base64:
        cmd.append('--embedded')

    result = subprocess.run(cmd)

    if result.returncode != 0:
        raise RuntimeError("Markdown conversion failed")

    print()
    print("=" * 70)

    # Check if we created a temporary .docx from .doc
    if file_ext == '.doc' and docx_path != input_path:
        # Auto-remove temporary .docx file by default
        print(f"\n🗑️  Removing temporary .docx file: {os.path.basename(docx_path)}", flush=True)
        os.remove(docx_path)
        print("   ✓ Removed", flush=True)

    print()
    print("=" * 70)
    print("✅ ALL DONE!", flush=True)
    print("=" * 70)
    print()
    print(f"📝 Markdown: {md_path}", flush=True)
    if embed_base64:
        print("🖼️  Images: embedded as base64", flush=True)
    elif os.path.exists(images_dir):
        image_count = len([f for f in os.listdir(images_dir) if os.path.isfile(os.path.join(images_dir, f))])
        print(f"🖼️  Images: {images_dir}/ ({image_count} files)", flush=True)
    print()

    return md_path, images_dir if not embed_base64 else None

def main():
    import argparse

    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

    parser = argparse.ArgumentParser(
        description='Convert Word documents (.doc or .docx) to Markdown with images.'
    )
    parser.add_argument('word_file', nargs='?', help='Path to the Word document')
    parser.add_argument('--embedded', action='store_true',
                        help='Embed images as base64 instead of external files')
    parser.add_argument('--check', action='store_true',
                        help='Print dependency check and exit')

    args = parser.parse_args()

    try:
        if args.check:
            check_environment()
            sys.exit(0)

        if not args.word_file:
            parser.error("word_file is required unless --check is used")

        convert_word_to_markdown(args.word_file, embed_base64=args.embedded)
        sys.exit(0)
    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr, flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
