#!/usr/bin/env python3
"""
Convert legacy .doc files to .docx using LibreOffice.
This preserves all images and formatting.
"""

import sys
import os
import subprocess
import tempfile
import shutil
from pathlib import Path

def find_libreoffice():
    """Find LibreOffice executable on the system"""
    possible_paths = [
        '/Applications/LibreOffice.app/Contents/MacOS/soffice',
        '/usr/bin/soffice',
        '/usr/local/bin/soffice',
        r'C:\Program Files\LibreOffice\program\soffice.exe',
        r'C:\Program Files (x86)\LibreOffice\program\soffice.exe',
        shutil.which('soffice'),
        shutil.which('libreoffice'),
    ]

    for path in possible_paths:
        if path and os.path.exists(path):
            return path

    return None

def convert_doc_to_docx(doc_path, output_path=None):
    """
    Convert .doc to .docx using LibreOffice

    Args:
        doc_path: Path to .doc file
        output_path: Optional output path for .docx file

    Returns:
        Path to converted .docx file
    """
    soffice = find_libreoffice()

    if not soffice:
        raise RuntimeError(
            "LibreOffice not found. Please install it:\n"
            "  Windows: winget install TheDocumentFoundation.LibreOffice\n"
            "  macOS:   brew install --cask libreoffice\n"
            "Or download from: https://www.libreoffice.org/download/"
        )

    # In sandboxed tool runners, HOME may be read-only; LibreOffice headless can abort.
    if not os.access(Path.home(), os.W_OK):
        raise RuntimeError(
            "HOME is not writable in this environment; LibreOffice headless .doc conversion may crash.\n"
            "Workaround: convert .doc → .docx outside the sandbox, then convert the .docx to Markdown."
        )

    doc_path = os.path.abspath(doc_path)

    if not os.path.exists(doc_path):
        raise FileNotFoundError(f"File not found: {doc_path}")

    # Determine output directory and filename
    doc_dir = os.path.dirname(doc_path)
    doc_basename = os.path.splitext(os.path.basename(doc_path))[0]

    if output_path:
        output_dir = os.path.dirname(os.path.abspath(output_path))
        expected_docx = output_path
    else:
        output_dir = doc_dir
        expected_docx = os.path.join(doc_dir, f"{doc_basename}.docx")

    # LibreOffice command to convert
    # --headless: Run without GUI
    # --convert-to docx: Convert to .docx format
    # --outdir: Output directory
    cmd = [
        soffice,
        '--headless',
        '--convert-to', 'docx',
        '--outdir', output_dir,
        doc_path
    ]

    print(f"Converting {doc_path} to .docx...")
    print(f"Using: {soffice}")

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            timeout=120
        )

        if result.returncode != 0:
            stderr = (result.stderr or "").strip()
            stdout = (result.stdout or "").strip()
            details = "\n".join([part for part in [stderr, stdout] if part])

            if not details:
                details = f"(no output; exit code {result.returncode})"
                # In sandboxed tool runners, HOME is often read-only and LibreOffice can abort.
                if not os.access(Path.home(), os.W_OK):
                    details += (
                        "\nHOME is not writable in this environment; LibreOffice headless .doc conversion "
                        "may crash under sandbox restrictions. Workaround: convert .doc → .docx outside the "
                        "sandbox, then convert the .docx to Markdown."
                    )

            print(f"Error: {details}", file=sys.stderr)
            raise RuntimeError(f"LibreOffice conversion failed: {details}")

        # LibreOffice creates the file with the same basename
        created_file = os.path.join(output_dir, f"{doc_basename}.docx")

        if not os.path.exists(created_file):
            raise RuntimeError(f"Conversion succeeded but output file not found: {created_file}")

        # Move to desired location if different
        if output_path and created_file != expected_docx:
            shutil.move(created_file, expected_docx)
            created_file = expected_docx

        file_size = os.path.getsize(created_file)
        print(f"✓ Converted to: {created_file} ({file_size:,} bytes)")

        return created_file

    except subprocess.TimeoutExpired:
        raise RuntimeError("Conversion timed out after 120 seconds")

def main():
    if len(sys.argv) < 2:
        print("Usage: convert_doc_to_docx.py <doc_file> [output_docx]")
        print("\nConvert legacy .doc files to .docx preserving images and formatting.")
        print("\nExamples:")
        print("  python3 convert_doc_to_docx.py document.doc")
        print("  python3 convert_doc_to_docx.py document.doc output.docx")
        sys.exit(1)

    doc_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        docx_file = convert_doc_to_docx(doc_file, output_file)
        print(f"\n✓ Success! Created: {docx_file}")

    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
