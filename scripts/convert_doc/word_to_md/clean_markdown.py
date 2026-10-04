#!/usr/bin/env python3
"""
Clean up redundant content from converted Markdown files.
Removes Word document artifacts, comment markers, and optionally revision history.
"""

import sys
import re
import argparse
from pathlib import Path

def clean_markdown(content, remove_strikethrough=False, remove_toc_links=True):
    """
    Clean up Markdown content by removing redundant markers and content.

    Args:
        content: Original Markdown content
        remove_strikethrough: If True, remove lines with strikethrough text (revision history)
        remove_toc_links: If True, clean up Word-generated TOC links

    Returns:
        Cleaned Markdown content
    """
    lines = content.split('\n')
    cleaned_lines = []

    word_comment_markers = {
        '[///txt]',
        '[/***]',
        '[***/]',
        '[txt///]',
    }

    skip_next_empty = False

    for i, line in enumerate(lines):
        # Skip Word comment markers
        if line.strip() in word_comment_markers:
            skip_next_empty = True
            continue

        # Optionally remove strikethrough lines (revision history)
        if remove_strikethrough:
            # Remove lines that are entirely strikethrough or marked as removed
            if line.strip().startswith('~~') or '(removed)' in line.lower():
                # Also check if this is a list item with strikethrough content
                if re.match(r'^\s*\d+\.\s+\(removed\)', line.strip()):
                    continue
                if re.match(r'^~~.*~~$', line.strip()):
                    continue

        # Clean up Word TOC links if requested
        if remove_toc_links and re.match(r'^\[.*\]\(#_Toc\d+\)$', line.strip()):
            continue

        # Skip consecutive empty lines after removing markers
        if skip_next_empty and not line.strip():
            skip_next_empty = False
            # Only skip one empty line
            continue

        skip_next_empty = False
        cleaned_lines.append(line)

    # Remove excessive blank lines (more than 2 consecutive)
    result = []
    blank_count = 0
    for line in cleaned_lines:
        if not line.strip():
            blank_count += 1
            if blank_count <= 2:
                result.append(line)
        else:
            blank_count = 0
            result.append(line)

    return '\n'.join(result)

def main():
    parser = argparse.ArgumentParser(
        description='Clean up redundant content from converted Markdown files'
    )
    parser.add_argument('input_file', help='Input Markdown file')
    parser.add_argument('-o', '--output', help='Output file (default: overwrite input)')
    parser.add_argument(
        '--remove-strikethrough',
        action='store_true',
        help='Remove strikethrough text (revision history)'
    )
    parser.add_argument(
        '--keep-toc-links',
        action='store_true',
        help='Keep Word-generated TOC links (default: remove them)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be cleaned without modifying files'
    )

    args = parser.parse_args()

    input_path = Path(args.input_file)

    if not input_path.exists():
        print(f"Error: File not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    # Read input file
    with open(input_path, 'r', encoding='utf-8') as f:
        original_content = f.read()

    print(f"Cleaning: {input_path}")
    print(f"Original size: {len(original_content)} bytes, {len(original_content.splitlines())} lines")
    print()

    # Clean content
    cleaned_content = clean_markdown(
        original_content,
        remove_strikethrough=args.remove_strikethrough,
        remove_toc_links=not args.keep_toc_links
    )

    # Show statistics
    original_lines = original_content.splitlines()
    cleaned_lines = cleaned_content.splitlines()

    print(f"Cleaned size: {len(cleaned_content)} bytes, {len(cleaned_lines)} lines")
    print(f"Removed: {len(original_content) - len(cleaned_content)} bytes, {len(original_lines) - len(cleaned_lines)} lines")
    print()

    # Show what was removed (sample)
    if args.dry_run:
        print("=== DRY RUN MODE ===")
        print("Would remove the following patterns:")
        print("- Word comment markers: [///txt], [/***], [***/], [txt///]")
        if args.remove_strikethrough:
            print("- Strikethrough text (~~text~~)")
            print("- Lines marked as (removed)")
        if not args.keep_toc_links:
            print("- Word TOC links: [1 Arc 4](#_Toc200457262)")
        print()
        print("No files were modified.")
        return

    # Write output
    output_path = Path(args.output) if args.output else input_path

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)

    print(f"✓ Saved to: {output_path}")

    if args.remove_strikethrough:
        print("\n⚠ Note: Removed revision history (strikethrough text)")

    print("\nCleaning complete!")

if __name__ == "__main__":
    main()
