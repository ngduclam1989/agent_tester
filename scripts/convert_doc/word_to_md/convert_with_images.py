#!/usr/bin/env python3
"""
Convert Word documents to Markdown with images extracted to a separate folder.
This ensures the Markdown file is readable and images are properly referenced.
"""

import sys
import os
import re
import subprocess
import hashlib
import base64
import shlex
import tempfile
from pathlib import Path
from zipfile import ZipFile
import shutil

import clean_markdown
from convert_doc_to_docx import find_libreoffice

_LIBREOFFICE_HEADLESS_DISABLED = False
_LIBREOFFICE_HEADLESS_WARNING_PRINTED = False

def natural_sort_key(filename):
    """
    Sort key for natural sorting of filenames with numbers.
    e.g., image1, image2, image10 instead of image1, image10, image2
    """
    return [int(c) if c.isdigit() else c.lower() for c in re.split(r'(\d+)', filename)]

def convert_wmf_emf_to_png(image_path, output_dir):
    """
    Convert WMF/EMF files to PNG using LibreOffice.
    Returns the new filename if converted, or original filename if not needed.
    """
    filename = os.path.basename(image_path)
    name, ext = os.path.splitext(filename)

    # Only convert WMF and EMF files
    if ext.lower() not in ['.wmf', '.emf']:
        return filename

    global _LIBREOFFICE_HEADLESS_DISABLED, _LIBREOFFICE_HEADLESS_WARNING_PRINTED
    if _LIBREOFFICE_HEADLESS_DISABLED:
        return filename

    # In sandboxed tool runners, HOME may be read-only; LibreOffice headless often aborts.
    if not os.access(Path.home(), os.W_OK):
        _LIBREOFFICE_HEADLESS_DISABLED = True
        if not _LIBREOFFICE_HEADLESS_WARNING_PRINTED:
            print(
                "  ⚠ Skipping WMF/EMF → PNG conversion (HOME is not writable in this environment)",
                file=sys.stderr,
            )
            _LIBREOFFICE_HEADLESS_WARNING_PRINTED = True
        return filename

    soffice = find_libreoffice()
    if not soffice:
        if not _LIBREOFFICE_HEADLESS_WARNING_PRINTED:
            print("  ⚠ LibreOffice not found; keeping WMF/EMF images as-is", file=sys.stderr)
            _LIBREOFFICE_HEADLESS_WARNING_PRINTED = True
        return filename

    try:
        # Use LibreOffice to convert to PNG
        cmd = [
            soffice,
            '--headless',
            '--convert-to', 'png',
            '--outdir', output_dir,
            image_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=60)

        new_filename = f"{name}.png"
        new_path = os.path.join(output_dir, new_filename)

        if result.returncode != 0:
            stderr = (result.stderr or "").strip()
            if stderr:
                print(f"  ⚠ LibreOffice failed converting {filename}: {stderr}", file=sys.stderr)
            else:
                print(f"  ⚠ LibreOffice failed converting {filename} (exit {result.returncode})", file=sys.stderr)
            if result.returncode < 0:
                _LIBREOFFICE_HEADLESS_DISABLED = True

        if os.path.exists(new_path):
            # Remove original WMF/EMF file
            os.remove(image_path)
            return new_filename
        else:
            print(f"  ⚠ Failed to convert {filename}", file=sys.stderr)
            return filename

    except Exception as e:
        print(f"  ⚠ Error converting {filename}: {e}", file=sys.stderr)
        return filename

def get_markitdown_cmd():
    """
    Return the base command to run `markitdown` (either via uvx or directly).

    Environment overrides:
    - MARKITDOWN_CMD: full command to run (e.g. "markitdown" or "uvx ... markitdown")
    - MARKITDOWN_UVX_PYTHON: uvx Python version to use (default: 3.11)
    - MARKITDOWN_UVX_OFFLINE: if set to 0/false/no, allow uvx to use network (default: offline)
    """
    override = os.environ.get("MARKITDOWN_CMD")
    if override:
        return shlex.split(override)

    local_venv = Path(__file__).resolve().parent / ".venv"
    local_markitdown = local_venv / ("Scripts/markitdown.exe" if os.name == "nt" else "bin/markitdown")
    if local_markitdown.exists():
        return [str(local_markitdown)]

    markitdown = shutil.which("markitdown")
    if markitdown:
        return [markitdown]

    # pip install vào user site (Windows) thường không đưa markitdown.exe vào PATH
    import importlib.util
    if importlib.util.find_spec("markitdown") is not None:
        return [sys.executable, "-m", "markitdown"]

    uvx = shutil.which("uvx")
    if uvx:
        python_version = os.environ.get("MARKITDOWN_UVX_PYTHON", "3.11")
        offline = os.environ.get("MARKITDOWN_UVX_OFFLINE", "1").strip().lower() not in {
            "0",
            "false",
            "no",
        }
        return [
            uvx,
            "-q",
            *(["--offline"] if offline else []),
            "--python",
            python_version,
            "--from",
            "markitdown[all]",
            "markitdown",
        ]

    raise RuntimeError(
        "markitdown not found. Cài bằng: python -m pip install \"markitdown[all]\" (hoặc cài `uv` để dùng `uvx`)."
    )

def run_markitdown(args, timeout):
    """
    Run markitdown reliably.

    Uses a workspace-local uv cache by default when running via uvx.
    If uvx can't write to the cache location, re-run with UV_CACHE_DIR in /tmp.
    """
    base_cmd = get_markitdown_cmd()
    cmd = base_cmd + list(args)

    env = os.environ.copy()
    # Windows: buộc markitdown ghi stdout bằng UTF-8, tránh lỗi/vỡ dấu tiếng Việt với codepage mặc định
    env.setdefault("PYTHONUTF8", "1")
    env.setdefault("PYTHONIOENCODING", "utf-8")
    uses_uvx = os.path.basename(base_cmd[0]) == "uvx"
    if uses_uvx and "UV_CACHE_DIR" not in env:
        default_cache = Path(__file__).resolve().parent / ".uv-cache"
        default_cache.mkdir(parents=True, exist_ok=True)
        env["UV_CACHE_DIR"] = str(default_cache)

    result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=timeout, env=env)
    if (
        uses_uvx
        and result.returncode != 0
        and (
            "Failed to initialize cache at" in (result.stderr or "")
            or "failed to initialize cache" in (result.stderr or "").lower()
        )
    ):
        fallback_cache = os.path.join(tempfile.gettempdir(), "uv-cache")
        os.makedirs(fallback_cache, exist_ok=True)
        if env.get("UV_CACHE_DIR") != fallback_cache:
            env["UV_CACHE_DIR"] = fallback_cache
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=timeout, env=env)

    return result

def get_markitdown_image_hashes(docx_path):
    """
    Run markitdown with --keep-data-uris to get full base64 images,
    then extract their hashes in order. This tells us which images
    markitdown actually converted and in what order.
    """
    try:
        result = run_markitdown(['--keep-data-uris', docx_path], timeout=300)

        if result.returncode != 0:
            return None

        # Find all base64 images
        pattern = r'!\[\]\(data:image/([^;]+);base64,([A-Za-z0-9+/=]+)\)'
        matches = re.findall(pattern, result.stdout)

        hashes = []
        for img_type, b64_data in matches:
            try:
                img_data = base64.b64decode(b64_data)
                img_hash = hashlib.md5(img_data).hexdigest()
                hashes.append(img_hash)
            except:
                hashes.append(None)

        return hashes
    except Exception as e:
        print(f"Warning: Could not get markitdown image hashes: {e}", file=sys.stderr)
        return None


def get_docx_image_hashes(docx_path, excluded_images):
    """
    Get MD5 hashes of all images in docx (excluding header/footer).
    Returns dict mapping hash -> filename.
    """
    hash_to_filename = {}
    try:
        with ZipFile(docx_path, 'r') as z:
            for name in z.namelist():
                if name.startswith('word/media/'):
                    filename = name.split('/')[-1]
                    if filename and filename not in excluded_images:
                        img_data = z.read(name)
                        img_hash = hashlib.md5(img_data).hexdigest()
                        hash_to_filename[img_hash] = filename
    except Exception as e:
        print(f"Warning: Could not get docx image hashes: {e}", file=sys.stderr)
    return hash_to_filename


def get_header_footer_images(docx_path):
    """
    Get list of images used in headers/footers (typically watermarks/logos).
    These should be excluded from document content images.
    """
    header_footer_images = set()
    try:
        with ZipFile(docx_path, 'r') as z:
            # Check all header and footer relationship files
            for name in z.namelist():
                if '_rels/header' in name or '_rels/footer' in name:
                    try:
                        rels_xml = z.read(name).decode('utf-8')
                        for match in re.finditer(r'Target="media/(image[^"]+)"', rels_xml):
                            header_footer_images.add(match.group(1))
                    except:
                        pass
    except Exception as e:
        print(f"Warning: Could not check header/footer images: {e}", file=sys.stderr)
    return header_footer_images


def get_image_order_from_docx(docx_path, exclude_header_footer=True):
    """
    Parse docx XML to get the order in which images appear in the document.
    Returns a list of image filenames in document order.
    Optionally excludes images from headers/footers (watermarks).
    """
    try:
        # Get header/footer images to exclude (watermarks/logos)
        excluded_images = set()
        if exclude_header_footer:
            excluded_images = get_header_footer_images(docx_path)
            if excluded_images:
                print(f"  Excluding {len(excluded_images)} header/footer images (watermarks)")

        with ZipFile(docx_path, 'r') as z:
            # Parse relationships file to map rId -> image filename
            rels_xml = z.read('word/_rels/document.xml.rels').decode('utf-8')

            rid_to_image = {}
            for match in re.finditer(r'Id="(rId\d+)"[^>]*Target="media/(image[^"]+)"', rels_xml):
                rid, img = match.groups()
                rid_to_image[rid] = img

            # Parse document.xml to get image references in order
            doc_xml = z.read('word/document.xml').decode('utf-8')

            # Find all rId references (both r:embed and r:id) in document order
            all_refs = re.findall(r'r:(?:embed|id)="(rId\d+)"', doc_xml)

            # Get images in document order (deduplicated, excluding header/footer images)
            doc_order_images = []
            seen = set()
            for rid in all_refs:
                if rid in rid_to_image and rid not in seen:
                    img = rid_to_image[rid]
                    # Skip header/footer images
                    if img not in excluded_images:
                        seen.add(rid)
                        doc_order_images.append(img)

            return doc_order_images, excluded_images
    except Exception as e:
        print(f"Warning: Could not parse docx structure: {e}", file=sys.stderr)
        return None, set()


def extract_images_from_docx(docx_path, output_dir):
    """Extract images from a .docx file to a directory and convert WMF/EMF to PNG.
    Excludes header/footer images (watermarks/logos).
    Uses content hash matching to ensure correct image order."""
    images_extracted = []

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    try:
        # Get excluded images (header/footer)
        excluded_images = get_header_footer_images(docx_path)
        if excluded_images:
            print(f"  Excluding {len(excluded_images)} header/footer images (watermarks)")

        # Get hash -> filename mapping from docx
        hash_to_filename = get_docx_image_hashes(docx_path, excluded_images)

        # Extract all non-excluded images
        with ZipFile(docx_path, 'r') as zip_ref:
            for file in zip_ref.namelist():
                if file.startswith('word/media/'):
                    filename = os.path.basename(file)
                    if filename and filename not in excluded_images:
                        source = zip_ref.open(file)
                        target_path = os.path.join(output_dir, filename)
                        with open(target_path, 'wb') as target:
                            shutil.copyfileobj(source, target)
                        images_extracted.append(filename)

        # Convert WMF/EMF to PNG and update mappings
        wmf_emf_count = sum(1 for f in images_extracted if f.lower().endswith(('.wmf', '.emf')))
        conversion_map = {}
        if wmf_emf_count > 0:
            if not os.access(Path.home(), os.W_OK):
                print("  WMF/EMF detected, but HOME is not writable; keeping vector images as-is")
            elif not find_libreoffice():
                print("  WMF/EMF detected, but LibreOffice not found; keeping vector images as-is")
            else:
                print(f"  Converting {wmf_emf_count} WMF/EMF files to PNG...")

            for img in images_extracted:
                img_path = os.path.join(output_dir, img)
                new_name = convert_wmf_emf_to_png(img_path, output_dir)
                conversion_map[img] = new_name
            images_extracted = [conversion_map.get(img, img) for img in images_extracted]

        # Update hash_to_filename with converted filenames
        updated_hash_to_filename = {}
        for h, fname in hash_to_filename.items():
            updated_hash_to_filename[h] = conversion_map.get(fname, fname)

        # Try content-based matching using markitdown hashes
        print("  Analyzing markitdown image order...")
        markitdown_hashes = get_markitdown_image_hashes(docx_path)

        if markitdown_hashes:
            # Build list of images in markitdown order
            markitdown_order = []
            for h in markitdown_hashes:
                if h and h in updated_hash_to_filename:
                    markitdown_order.append(updated_hash_to_filename[h])
                else:
                    markitdown_order.append(None)

            valid_count = sum(1 for img in markitdown_order if img is not None)
            print(f"  Matched {valid_count}/{len(markitdown_hashes)} images via content hash")

            if valid_count == len(markitdown_hashes) and valid_count > 0:
                print(f"  Using content-hash matched order for {valid_count} images")
                return markitdown_order

        # Fall back to document XML order
        doc_order, _ = get_image_order_from_docx(docx_path, exclude_header_footer=True)
        if doc_order:
            doc_order = [conversion_map.get(img, img) for img in doc_order]
            if len(doc_order) == len(images_extracted):
                print(f"  Using document XML order for {len(doc_order)} images")
                return doc_order

        # Final fallback: natural sort
        print(f"  Falling back to natural sort order")
        return sorted(images_extracted, key=natural_sort_key)

    except Exception as e:
        print(f"Error extracting images: {e}", file=sys.stderr)
        return []

def convert_to_markdown(docx_path, md_path):
    """Convert Word document to Markdown using markitdown (without embedded images)"""
    try:
        result = run_markitdown([docx_path, '-o', md_path], timeout=180)

        if result.returncode != 0:
            print(f"Error converting to markdown: {result.stderr}", file=sys.stderr)
            return False

        return True
    except subprocess.TimeoutExpired:
        print("Error: Conversion timed out after 180 seconds", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return False

def replace_image_references(md_path, images_dir_name, images, images_dir=None, embed_base64=False):
    """Replace base64 image placeholders with relative file paths or full base64 data.

    Args:
        md_path: Path to the markdown file
        images_dir_name: Name of the images directory (for path mode)
        images: List of image filenames in order
        images_dir: Full path to images directory (required for embed mode)
        embed_base64: If True, embed full base64 data instead of file paths
    """

    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    data_uri_pattern = re.compile(
        r'!\[\]\(data:image/[^;]+;base64(?:\.\.\.|,[A-Za-z0-9+/=]+)\)'
    )
    matches = list(data_uri_pattern.finditer(content))

    if not matches:
        print("Warning: No base64 image references found in Markdown", file=sys.stderr)
        return content

    print(f"Found {len(matches)} image references in Markdown")
    print(f"Prepared {len(images)} images for Markdown references")

    index = 0

    def replacement(match):
        nonlocal index, content
        if index >= len(images):
            print("Warning: More image references than extracted images", file=sys.stderr)
            return match.group(0)

        img_filename = images[index]
        index += 1

        if embed_base64 and images_dir:
            img_path = os.path.join(images_dir, img_filename)
            try:
                with open(img_path, 'rb') as img_file:
                    img_data = img_file.read()
                b64_data = base64.b64encode(img_data).decode('utf-8')

                ext = os.path.splitext(img_filename)[1].lower()
                mime_types = {
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.bmp': 'image/bmp',
                    '.webp': 'image/webp',
                }
                mime_type = mime_types.get(ext, 'image/png')

                print(f"  Embedded image {index}: {img_filename} ({len(b64_data)} chars)")
                return f"![](data:{mime_type};base64,{b64_data})"
            except Exception as e:
                print(f"  Warning: Could not embed {img_filename}: {e}", file=sys.stderr)

        img_path_ref = f"{images_dir_name}/{img_filename}"
        print(f"  Replaced image {index}: {img_filename}")
        return f"![]({img_path_ref})"

    content, _ = data_uri_pattern.subn(replacement, content)

    # Write back
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(content)

    return content

def main():
    import argparse

    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

    parser = argparse.ArgumentParser(
        description='Convert Word documents to Markdown with images'
    )
    parser.add_argument('docx_file', help='Path to the Word document')
    parser.add_argument('--embedded', action='store_true',
                        help='Embed images as base64 instead of external files')

    args = parser.parse_args()

    docx_path = args.docx_file
    embed_base64 = args.embedded

    if not os.path.exists(docx_path):
        print(f"Error: File not found: {docx_path}", file=sys.stderr)
        sys.exit(1)

    docx_path_lower = docx_path.lower()

    if not docx_path_lower.endswith(('.docx', '.doc')):
        print(f"Error: Not a Word document: {docx_path}", file=sys.stderr)
        sys.exit(1)

    if docx_path_lower.endswith('.doc'):
        print(
            "Error: convert_with_images.py only supports .docx.\n"
            "Use convert_word_to_markdown.py to convert .doc → .docx first.",
            file=sys.stderr,
        )
        sys.exit(1)

    # Determine output paths
    base_name = os.path.splitext(docx_path)[0]
    md_path = f"{base_name}.md"
    images_dir = f"{base_name}_images"
    images_dir_name = os.path.basename(images_dir)

    mode_str = "embedded base64" if embed_base64 else "external files"
    print(f"Converting: {docx_path}")
    print(f"Output MD: {md_path}")
    print(f"Image mode: {mode_str}")
    if not embed_base64:
        print(f"Images dir: {images_dir}")
    print()

    # Step 1: Extract images
    print("Step 1: Extracting images...")
    images = extract_images_from_docx(docx_path, images_dir)

    if images:
        extracted_files = [
            f
            for f in os.listdir(images_dir)
            if os.path.isfile(os.path.join(images_dir, f))
        ]
        extracted_count = len(extracted_files)
        print(f"✓ Extracted {extracted_count} images to {images_dir}/")
        if extracted_count != len(images):
            print(
                f"  (markitdown referenced {len(images)} images; keeping {extracted_count - len(images)} extra extracted files)"
            )
        for img in images:
            img_path = os.path.join(images_dir, img)
            img_size = os.path.getsize(img_path)
            print(f"  - {img} ({img_size:,} bytes)")
    else:
        print("⚠ No images found in document")

    print()

    # Step 2: Convert to Markdown
    print("Step 2: Converting to Markdown...")
    if not convert_to_markdown(docx_path, md_path):
        print("✗ Conversion failed", file=sys.stderr)
        sys.exit(1)

    md_size = os.path.getsize(md_path)
    print(f"✓ Created {md_path} ({md_size:,} bytes)")
    print()

    # Step 3: Replace image references
    if images:
        print("Step 3: Replacing image references...")
        replace_image_references(md_path, images_dir_name, images,
                                 images_dir=images_dir, embed_base64=embed_base64)

        final_size = os.path.getsize(md_path)
        print(f"✓ Updated {md_path} ({final_size:,} bytes)")
    else:
        print("Step 3: Skipped (no images to reference)")

    print()

    # Step 4: Clean up redundant content
    print("Step 4: Cleaning up redundant content...")
    with open(md_path, 'r', encoding='utf-8') as f:
        original_content = f.read()

    original_lines = len(original_content.splitlines())
    cleaned_content = clean_markdown.clean_markdown(
        original_content,
        remove_strikethrough=True,
        remove_toc_links=True,
    )
    cleaned_lines = len(cleaned_content.splitlines())

    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)

    final_size = os.path.getsize(md_path)
    removed_lines = original_lines - cleaned_lines

    print(f"✓ Removed {removed_lines} redundant lines")
    print(f"  - Word comment markers ([///txt], [/***], etc.)")
    print(f"  - Revision history (strikethrough text)")
    print(f"  - Word TOC links")
    print(f"✓ Final {md_path} ({final_size:,} bytes, {cleaned_lines} lines)")

    # Step 5: Clean up images folder if embedded mode
    if embed_base64 and images and os.path.exists(images_dir):
        print()
        print("Step 5: Cleaning up temporary images folder...")
        shutil.rmtree(images_dir)
        print(f"✓ Removed {images_dir}/")

    print()
    print("=" * 60)
    print("✓ Conversion complete!")
    print(f"  Markdown: {md_path} ({cleaned_lines} lines, {final_size:,} bytes)")
    if images and not embed_base64:
        image_file_count = len(
            [
                f
                for f in os.listdir(images_dir)
                if os.path.isfile(os.path.join(images_dir, f))
            ]
        )
        print(f"  Images: {images_dir}/ ({image_file_count} files)")
    elif images and embed_base64:
        print(f"  Images: {len(images)} embedded as base64")
    print("=" * 60)

if __name__ == "__main__":
    main()
