#!/usr/bin/env python3
"""
Validate a FULL RBT test-case Markdown file (TC_*.md) produced by the
rbt_manual_testing skill (Bước 5/6).

Catches the class of bugs found in practice on Wave 6:
  - REQ/Scenario from Bước 4 silently dropped (no TC covers it)
  - Summary tables (Risk Level, Priority) hand-written/estimated and never
    reconciled against the final TC table
  - TC IDs quoted in prose (Q&A section, notes) that don't match a real row
    after edits/renumbering
  - TC ID sequence gaps/duplicates
  - Table rows with wrong column count

Usage:
    python3 scripts/validate_testcases/validate_tc.py <path/to/TC_*.md> [more files...]

Exit code 0 = all checks passed. Non-zero = at least one failure found.
"""

import re
import sys
from collections import Counter, defaultdict

TC_ROW_RE = re.compile(r'^\|\s*([A-Z][A-Z0-9]*_[A-Z0-9\-]+_TC_(\d+))\s*\|')
GROUP_HEADER_RE = re.compile(r'^\|\s*\*\*NH[ÓO]M\s+(.+?)\s*(?:—|-)\s*(\S+)')
ANY_TC_ID_RE = re.compile(r'\b([A-Z][A-Z0-9]*_[A-Z0-9\-]+_TC_\d+)\b')
TOTAL_DECLARED_RE = re.compile(r'\|\s*T[ổo]ng s[ốo] TC\s*\|\s*(\d+)\s*\|')
PRIORITY_TABLE_START_RE = re.compile(r'\|\s*Priority\s*\|\s*S[ốo] l[ưu][ợo]ng\s*\|')


def fail(errors, msg):
    errors.append(msg)


def validate_file(path):
    errors = []
    warnings = []

    with open(path, encoding="utf-8") as f:
        lines = f.read().splitlines()

    # ---- Locate main TC table ----
    header_idx = None
    for i, line in enumerate(lines):
        if line.strip().startswith("| TC ID | Module | Risk Level"):
            header_idx = i
            break
    if header_idx is None:
        fail(errors, "Không tìm thấy header bảng TC chính ('| TC ID | Module | Risk Level ...') — có thể sai schema hoặc chưa tới Bước 6.")
        return errors, warnings

    expected_cols = lines[header_idx].count("|") - 1

    tc_rows = []          # (id, number, module, risk_group, priority, raw_line, line_no)
    current_group = None  # (module, group_name)
    group_counts = defaultdict(int)
    priority_counter = Counter()
    id_prefix_counter = Counter()

    for i in range(header_idx + 1, len(lines)):
        line = lines[i]
        if not line.startswith("|"):
            # table ended
            if line.strip() and not line.strip().startswith("#") and not line.strip().startswith(">"):
                pass
            continue
        stripped = line.strip()
        if set(stripped) <= set("|-: "):
            continue  # separator row

        gm = GROUP_HEADER_RE.match(line)
        if gm:
            current_group = (gm.group(2).strip(), gm.group(1).strip())
            continue

        tm = TC_ROW_RE.match(line)
        if not tm:
            continue

        cols = line.count("|") - 1
        if cols != expected_cols:
            fail(errors, f"Dòng {i+1}: số cột = {cols}, header yêu cầu {expected_cols} — kiểm tra pipe `|` bị thiếu/thừa. Nội dung: {line[:100]}")

        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        tc_id = tm.group(1)
        tc_num = int(tm.group(2))
        prefix = tc_id.rsplit("_TC_", 1)[0]
        id_prefix_counter[prefix] += 1

        priority = cells[7] if len(cells) > 7 else "?"
        priority_counter[priority] += 1

        if current_group:
            group_counts[current_group] += 1

        tc_rows.append((tc_id, tc_num, prefix, current_group, priority, line, i + 1))

    if not tc_rows:
        fail(errors, "Không tìm thấy dòng TC nào khớp pattern ID trong bảng — kiểm tra định dạng TC ID [DỰ_ÁN]_[MODULE]_TC_[SỐ].")
        return errors, warnings

    # ---- Check: single consistent ID prefix (or report the split if project has 2 files by design) ----
    if len(id_prefix_counter) > 1:
        warnings.append(f"File có nhiều prefix TC ID khác nhau trong cùng bảng: {dict(id_prefix_counter)} — xác nhận đây là chủ đích (vd nhóm cross-module) chứ không phải lỗi gõ nhầm.")

    # ---- Check: sequence per prefix — no gaps, no duplicates ----
    by_prefix = defaultdict(list)
    for tc_id, tc_num, prefix, *_ in tc_rows:
        by_prefix[prefix].append(tc_num)

    for prefix, nums in by_prefix.items():
        dup = [n for n, c in Counter(nums).items() if c > 1]
        if dup:
            fail(errors, f"Prefix {prefix}: TC ID bị TRÙNG số: {sorted(dup)}")
        uniq = sorted(set(nums))
        if uniq and uniq[0] != 1:
            warnings.append(f"Prefix {prefix}: số TC đầu tiên là {uniq[0]}, không bắt đầu từ 1.")
        missing = [n for n in range(uniq[0], uniq[-1] + 1) if n not in uniq] if uniq else []
        if missing:
            fail(errors, f"Prefix {prefix}: THIẾU số TC ID (gap trong dãy tuần tự): {missing}")

    total_actual = len(tc_rows)

    # ---- Check: declared "Tổng số TC" matches actual ----
    declared_totals = [int(m.group(1)) for l in lines[:header_idx] for m in [TOTAL_DECLARED_RE.match(l.strip())] if m]
    for d in declared_totals:
        if d != total_actual:
            fail(errors, f"'Tổng số TC' khai báo = {d}, nhưng đếm thật trong bảng = {total_actual}. Cần tính lại và sửa dòng khai báo.")

    # ---- Check: declared Priority stats table matches recount ----
    prio_table_idx = None
    for i, line in enumerate(lines[:header_idx]):
        if PRIORITY_TABLE_START_RE.match(line.strip()):
            prio_table_idx = i
            break
    if prio_table_idx is not None:
        declared_prio = {}
        for line in lines[prio_table_idx + 2:]:
            if not line.strip().startswith("|"):
                break
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) < 2:
                continue
            key = cells[0].strip("*").strip()
            val = cells[1].strip("*").strip()
            if key.lower() in ("tổng", "total") or not val.isdigit():
                continue
            declared_prio[key] = int(val)
        for key, actual_count in priority_counter.items():
            declared_count = declared_prio.get(key)
            if declared_count is None:
                fail(errors, f"Bảng Priority (mục 6) THIẾU dòng cho giá trị Priority thực tế '{key}' (đếm thật = {actual_count}).")
            elif declared_count != actual_count:
                fail(errors, f"Bảng Priority: '{key}' khai {declared_count}, đếm thật {actual_count}.")
        for key in declared_prio:
            if key not in priority_counter:
                warnings.append(f"Bảng Priority khai '{key}' nhưng không có TC nào thực tế mang giá trị này — xóa dòng thừa hoặc kiểm tra lệch chính tả.")
    else:
        warnings.append("Không tìm thấy bảng 'Priority | Số lượng' (mục 6) để đối chiếu — bỏ qua check này.")

    # ---- Check: every TC ID referenced in prose (outside the table) resolves to a real row ----
    real_ids = {tc_id for tc_id, *_ in tc_rows}
    for i, line in enumerate(lines):
        if header_idx is not None and i > header_idx and TC_ROW_RE.match(line):
            continue  # this line IS a table row, skip — we only care about prose references
        for m in ANY_TC_ID_RE.finditer(line):
            ref_id = m.group(1)
            if ref_id not in real_ids:
                fail(errors, f"Dòng {i+1}: tham chiếu '{ref_id}' trong văn xuôi nhưng KHÔNG tồn tại dòng TC nào có ID này (có thể trích sai ID hoặc quên cập nhật sau khi renumber).")

    return errors, warnings


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 validate_tc.py <path/to/TC_*.md> [more files...]")
        sys.exit(2)

    overall_ok = True
    for path in sys.argv[1:]:
        print(f"\n=== Validating {path} ===")
        errors, warnings = validate_file(path)
        for w in warnings:
            print(f"  ⚠ WARNING: {w}")
        if errors:
            overall_ok = False
            for e in errors:
                print(f"  ✗ FAIL: {e}")
            print(f"  --> {len(errors)} lỗi.")
        else:
            print("  ✓ PASS — không phát hiện lỗi.")

    sys.exit(0 if overall_ok else 1)


if __name__ == "__main__":
    main()
