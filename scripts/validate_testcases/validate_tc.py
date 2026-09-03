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

Also supports the "tách file theo sub-module" (multi-file) convention: a
rollup file (`TC_[MODULE].md`) that has no TC table of its own but instead
a "Danh sách file con" table listing sibling `TC_[MODULE]-[SUBMODULE].md`
files. In that case, this script validates every child file and cross-checks
declared totals / TC ID continuity across the whole set.

Usage:
    python3 scripts/validate_testcases/validate_tc.py <path/to/TC_*.md> [more files...]

Exit code 0 = all checks passed. Non-zero = at least one failure found.
"""

import os
import re
import sys
from collections import Counter, defaultdict

# Windows pipes/redirects stdout through the system ANSI codepage (not UTF-8)
# unless told otherwise, which crashes on the ✓/✗/⚠ symbols below — reconfigure
# defensively so this works both interactively and when captured by the
# PostToolUse hook (`output=$(python3 ... 2>&1)`).
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8")

TC_ROW_RE = re.compile(r'^\|\s*([A-Z][A-Z0-9]*_[A-Z0-9\-]+_TC_(\d+))\s*\|')
GROUP_HEADER_RE = re.compile(r'^\|\s*\*\*NH[ÓO]M\s+(.+?)\s*(?:—|-)\s*(\S+)')
ANY_TC_ID_RE = re.compile(r'\b([A-Z][A-Z0-9]*_[A-Z0-9\-]+_TC_\d+)\b')
TOTAL_DECLARED_RE = re.compile(r'\|\s*T[ổo]ng s[ốo] TC\s*\|\s*(\d+)\s*\|')
PRIORITY_TABLE_START_RE = re.compile(r'\|\s*Priority\s*\|\s*S[ốo] l[ưu][ợo]ng\s*\|')
TITLE_PREFIX_RE = re.compile(r'^ki[ểe]m tra\b', re.IGNORECASE)
VAGUE_EXPECTED_RE = re.compile(
    r'need confirmation|ch[uư]a r[oõ]|ch[uư]a quy đ[iị]nh r[oõ]|ghi nh[aậ]n h[aà]nh vi th[uự]c t[eế]|\btbd\b|t[uù]y (?:th[uự]c t[eế]|BE|FE)',
    re.IGNORECASE,
)
PRECOND_SKIP_RE = re.compile(r'^(—|-|n/a)$', re.IGNORECASE)
PRECOND_USER_ANCHOR_RE = re.compile(
    r'@|garage-owner|accountant|admin|đăng nh[aậ]p|user\s*[ab]\b|session|kh[oô]ng c[aầ]n đăng nh[aậ]p|k[eế] th[uừ]a',
    re.IGNORECASE,
)
PRECOND_SCREEN_ANCHOR_RE = re.compile(
    r'm[aà]n |màn hình|screen|route|/inventory|url|trang ',
    re.IGNORECASE,
)
PRECOND_DATA_ANCHOR_RE = re.compile(r'\d|id\s*=')

CHILD_TABLE_HEADER_RE = re.compile(r'^\|\s*File\s*\|\s*Sub-module\s*\|')
CHILD_ROW_ID_NUM_RE = re.compile(r'_TC_(\d+)')


API_HEADER_START = "| Test Case ID | Function | Group Tests | Risk Level"
API_EXPECTED_HEADER = [
    "Test Case ID", "Function", "Group Tests", "Risk Level", "Test Case Title",
    "Pre-conditions", "Test Steps", "Test Data", "Expected result",
    "Environment", "Priority", "Regression", "Automation",
    "Manual Test Results Round 1", "Manual Test Results Round 2",
    "Automation Test Results", "Actual result", "BugID", "Notes",
]
API_TC_ROW_RE = re.compile(r'^\|\s*([A-Z][A-Z0-9]*(?:_[A-Z0-9\-]+)+_TC_(\d+))\s*\|')
# Cot 'Test Case ID' co 2 che do (API-Gen-TC-From-TD-v4.md muc VII.1):
#   - SINH MOI: `<DU_AN>_<MODULE>_TC_<NNN>`, danh so lien tuc toan file.
#   - TAI DUNG ID GOC: khi co bo TC goc cua khach, o nay mang dung ID cua khach
#     (khuon tuy y, co the trung neu chinh file goc trung) va de TRONG cho TC moi
#     them, kem nhan [TC MOI THEM] o cot Notes.
API_GEN_ID_RE = re.compile(r'^([A-Z][A-Z0-9]*(?:_[A-Z0-9\-]+)+)_TC_(\d+)$')
API_NEW_TC_MARK = "[TC MOI THEM]"
API_GROUP_ROW_RE = re.compile(r'^\|\s*\*\*(.+?)\*\*\s*\|')
API_TD_REF_RE = re.compile(r'\bTD:\s*(TD_P[1-4]_\d+)')
API_RISK_ENUM = {"High", "Medium", "Low"}
API_TOTAL_DECLARED_RE = re.compile(r'T[ổo]ng s[ốo] Test Case:\s*\*\*(\d+)\*\*')
API_PRECOND_BANNED_RE = re.compile(r'(?:^|<br>)\s*(?:\d+\.|-)\s*(Env|URL|Endpoint|Header)\s*:', re.IGNORECASE)
API_PRECOND_NUMBERED_RE = re.compile(r'(?:^|<br>)\s*\d+\.\s*(?:User/Quy|Tr[aạ]ng th[aá]i|D[uữ] li[eệ]u)', re.IGNORECASE)
# Test Data cung dung gach dau dong: bat cac dong 'N. Endpoint:' / 'N. Headers:' / 'N. Body:'...
API_TESTDATA_NUMBERED_RE = re.compile(r'(?:^|<br>)\s*\d+\.\s*(Endpoint|Headers?|File|Body|DB)\s*:', re.IGNORECASE)


def split_md_row(line):
    """Tach 1 dong bang Markdown thanh cac o, ton trong pipe da escape."""
    body = line.strip()
    if body.startswith("|"):
        body = body[1:]
    if body.endswith("|"):
        body = body[:-1]
    cells, buf, i = [], [], 0
    while i < len(body):
        ch = body[i]
        if ch == "\\" and i + 1 < len(body) and body[i + 1] == "|":
            buf.append("|")
            i += 2
            continue
        if ch == "|":
            cells.append("".join(buf).strip())
            buf = []
            i += 1
            continue
        buf.append(ch)
        i += 1
    cells.append("".join(buf).strip())
    return cells


def _validate_api(path, lines):
    """Validate file TC API (schema 19 cot cua skill api_test_design)."""
    errors, warnings = [], []

    header_idxs = [i for i, l in enumerate(lines) if l.strip().startswith(API_HEADER_START)]
    header_cells = split_md_row(lines[header_idxs[0]])
    if header_cells != API_EXPECTED_HEADER:
        missing = [c for c in API_EXPECTED_HEADER if c not in header_cells]
        extra = [c for c in header_cells if c not in API_EXPECTED_HEADER]
        fail(errors, f"Header bảng TC API không khớp contract 19 cột. Thiếu: {missing or 'không'} | Thừa: {extra or 'không'}")

    tc_ids, tc_nums, prefixes = [], [], Counter()
    source_ids = []
    tc_row_count = 0
    block_risk = {}
    blocks_seen = []
    group_labels = []
    summary_counter = Counter()
    seen_header_rows = set(header_idxs)

    for i, line in enumerate(lines):
        if not line.startswith("|") or i in seen_header_rows:
            continue
        stripped = line.strip()
        if set(stripped) <= set("|-: "):
            continue

        cells = split_md_row(line)

        gm = API_GROUP_ROW_RE.match(line)
        if gm and all(c == "" for c in cells[1:]):
            group_labels.append((i + 1, gm.group(1).strip()))
            continue

        # Dong TC = dong NAM SAU header bang TC va co cot Function mang 1 trong 4 nhom
        # rui ro (hoac o dau dung khuon ID sinh moi). Khong nhan dien qua rieng cot ID
        # nua vi o do co the de trong; chan tren header_idxs[0] de khong an nham bang
        # Traceability Matrix o phia truoc (bang do cung co cot 'NHÓM ...').
        is_tc_row = i > header_idxs[0] and (
            bool(API_TC_ROW_RE.match(line))
            or (len(cells) > 1 and cells[1].upper().startswith("NHÓM"))
        )
        if not is_tc_row:
            continue

        if len(cells) != 19:
            fail(errors, f"Dòng {i+1}: có {len(cells)} cột, contract yêu cầu đúng 19 cột. TC: {cells[0] or '(ô Test Case ID để trống)'}")
            continue

        tc_row_count += 1
        tc_id = cells[0]
        tc_label = tc_id or f"TC mới thêm, dòng {i+1}"
        gid = API_GEN_ID_RE.match(tc_id) if tc_id else None
        if not tc_id:
            if API_NEW_TC_MARK not in cells[18]:
                fail(errors, f"Dòng {i+1}: ô 'Test Case ID' để trống nhưng cột 'Notes' thiếu nhãn '{API_NEW_TC_MARK}' — TC chưa có ID bắt buộc phải tự khai là TC mới thêm.")
        elif gid:
            tc_ids.append(tc_id)
            tc_nums.append(int(gid.group(2)))
            prefixes[gid.group(1)] += 1
        else:
            source_ids.append(tc_id)

        function, block, risk = cells[1], cells[2], cells[3]
        scenario, precond, notes = cells[4], cells[5], cells[18]

        if risk not in API_RISK_ENUM:
            fail(errors, f"Dòng {i+1} ({tc_label}): Risk Level = '{risk}' — phải là enum sạch High/Medium/Low, không thêm chú thích.")
        if block and block == function:
            fail(errors, f"Dòng {i+1} ({tc_label}): cột 'Group Tests' đang copy lại cột 'Function' ('{function}') — phải mang TÊN BLOCK lấy từ Test Design.")
        if not block:
            fail(errors, f"Dòng {i+1} ({tc_label}): cột 'Group Tests' (tên block) đang để trống.")

        key = (function, block)
        if key in block_risk and block_risk[key] != risk:
            fail(errors, f"Dòng {i+1} ({tc_label}): block '{block}' có Risk Level không nhất quán ('{risk}' vs '{block_risk[key]}') — Risk gán ở mức block, mọi TC trong cùng block phải giống nhau.")
        else:
            block_risk.setdefault(key, risk)
        if key not in blocks_seen:
            blocks_seen.append(key)
        summary_counter[(function, block, risk)] += 1

        if not TITLE_PREFIX_RE.match(scenario):
            fail(errors, f"Dòng {i+1} ({tc_label}): 'Test Case Title' = '{scenario[:70]}' không bắt đầu bằng 'Kiểm tra ...'. Convention bắt buộc: 'Kiểm tra <hành động> <đối tượng> với <dữ liệu/điều kiện>'.")

        if not API_TD_REF_RE.search(notes):
            fail(errors, f"Dòng {i+1} ({tc_label}): cột 'Notes' thiếu mỏ neo traceability 'TD: <Node ID>' (vd 'TD: TD_P3_003') — bắt buộc từ contract 19 cột.")

        vm = VAGUE_EXPECTED_RE.search(cells[8])
        if vm:
            fail(errors, f"Dòng {i+1} ({tc_label}): 'Expected result' chứa cụm mơ hồ không verify được: '{vm.group(0)}'.")

        tdm = API_TESTDATA_NUMBERED_RE.search(cells[7])
        if tdm:
            fail(errors, f"Dòng {i+1} ({tc_label}): 'Test Data' đang đánh số `1. 2. 3.` (thấy '{tdm.group(1)}:') — phải dùng gạch đầu dòng `- `. Đánh số chỉ dành cho Test Steps / Expected result.")
        if API_PRECOND_NUMBERED_RE.search(precond):
            fail(errors, f"Dòng {i+1} ({tc_label}): 'Pre-conditions' đang đánh số `1. 2. 3.` — phải dùng gạch đầu dòng `- `. Đánh số chỉ dành cho Test Steps / Expected result.")
        bm = API_PRECOND_BANNED_RE.search(precond)
        if bm:
            fail(errors, f"Dòng {i+1} ({tc_label}): 'Pre-conditions' còn chứa '{bm.group(1)}:' — Env/URL/Endpoint/Header phải nằm ở cột 'Test Data', không lặp ở đây.")
        for part in ("User/Quyền", "Trạng thái hệ thống", "Dữ liệu có sẵn"):
            if part.lower() not in precond.lower():
                warnings.append(f"Dòng {i+1} ({tc_label}): 'Pre-conditions' thiếu thành phần '{part}' (bắt buộc đủ 3 thành phần).")
                break

    # ---- TC ID: kiem theo dung che do file dang dung ----
    if tc_ids and source_ids:
        fail(errors, f"File trộn 2 chế độ Test Case ID: {len(tc_ids)} ô theo khuôn sinh mới `<DỰ_ÁN>_<MODULE>_TC_<NNN>` và {len(source_ids)} ô theo ID của bộ TC gốc — phải chọn đúng 1 chế độ cho cả file.")
    if tc_ids:
        if len(prefixes) > 1:
            fail(errors, f"File dùng nhiều prefix TC ID khác nhau: {dict(prefixes)} — contract yêu cầu 1 prefix `<DỰ_ÁN>_<MODULE>` duy nhất cho cả file.")
        dupes = [i for i, c in Counter(tc_ids).items() if c > 1]
        if dupes:
            fail(errors, f"TC ID bị trùng: {sorted(dupes)[:10]}")
        expected = list(range(1, len(tc_nums) + 1))
        if sorted(tc_nums) != expected:
            missing = sorted(set(expected) - set(tc_nums))
            fail(errors, f"Số thứ tự TC ID không liên tục 001..{len(tc_nums):03d} (KHÔNG reset theo cấu phần). Số bị thiếu: {missing[:10]}")
        if tc_nums != sorted(tc_nums):
            fail(errors, "TC ID không tăng dần theo thứ tự xuất hiện trong file.")
    elif source_ids:
        # Chi canh bao khi trung: chinh file TC goc cua khach co the da trung ID,
        # sua o day se lam lech truy vet nguoc ve file khach.
        sdupes = sorted(i for i, c in Counter(source_ids).items() if c > 1)
        if sdupes:
            warnings.append(f"Test Case ID lấy từ bộ TC gốc bị trùng: {sdupes[:10]} — đối chiếu lại file gốc của khách xem có trùng thật không.")

    # ---- Dong tieu de nhom: moi block dung 1 dong ----
    if not group_labels:
        fail(errors, "Không tìm thấy dòng tiêu đề nhóm nào (`| **NHÓM <nhóm rủi ro> - <tên block>** | | ... |`) — contract mục VI.4 bắt buộc mỗi block có 1 dòng đứng trước TC đầu tiên.")
    elif len(group_labels) != len(blocks_seen):
        fail(errors, f"Số dòng tiêu đề nhóm ({len(group_labels)}) khác số block thực tế trong bảng TC ({len(blocks_seen)}) — mỗi block phải có đúng 1 dòng tiêu đề.")

    # ---- Tong so TC khai bao ----
    text = "\n".join(lines)
    dm = API_TOTAL_DECLARED_RE.search(text)
    if dm and int(dm.group(1)) != tc_row_count:
        fail(errors, f"'Tổng số Test Case' khai báo = {dm.group(1)} nhưng đếm thật trong bảng = {tc_row_count}.")
    elif not dm:
        warnings.append("Không tìm thấy dòng 'Tổng số Test Case: **N**' để đối chiếu.")

    # ---- Bang 'Tong hop theo nhom' phai khop dem that ----
    for i, line in enumerate(lines):
        if line.strip().startswith("| Cấu phần (Function) | Block (Group Tests) | Risk Level |") or line.strip().startswith("| Nhóm rủi ro (Function) | Block (Group Tests) | Risk Level |"):
            for j in range(i + 2, len(lines)):
                row = lines[j]
                if not row.startswith("|"):
                    break
                if set(row.strip()) <= set("|-: "):
                    continue
                c = split_md_row(row)
                if len(c) < 4 or c[0].startswith("**"):
                    continue
                try:
                    declared = int(c[3])
                except ValueError:
                    continue
                actual = summary_counter.get((c[0], c[1], c[2]), 0)
                if declared != actual:
                    fail(errors, f"Dòng {j+1}: bảng 'Tổng hợp theo nhóm' ghi {declared} TC cho ({c[0]} / {c[1]} / {c[2]}) nhưng đếm thật = {actual}.")
            break

    return errors, warnings


def is_ui_tc_file(path):
    normalized = path.replace("\\", "/")
    return "/ui/" in normalized


def fail(errors, msg):
    errors.append(msg)


def _validate_single(path, lines):
    """Validate a normal (non-rollup) TC file. Returns (errors, warnings, stats|None)."""
    errors = []
    warnings = []

    header_idx = None
    for i, line in enumerate(lines):
        if line.strip().startswith("| TC ID | Module | Risk Level"):
            header_idx = i
            break
    if header_idx is None:
        return None  # caller decides: not a single-file TC table

    expected_cols = lines[header_idx].count("|") - 1
    check_precond = is_ui_tc_file(path)

    tc_rows = []
    current_group = None
    group_counts = defaultdict(int)
    priority_counter = Counter()
    id_prefix_counter = Counter()
    precond_gap_ids = []

    for i in range(header_idx + 1, len(lines)):
        line = lines[i]
        if not line.startswith("|"):
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

        title = cells[3] if len(cells) > 3 else ""
        if not TITLE_PREFIX_RE.match(title):
            fail(
                errors,
                f"Dòng {i+1}: Test Title '{title}' không bắt đầu bằng 'Kiểm tra ...'. "
                "Convention bắt buộc: 'Kiểm tra <hành động: thêm mới/thất bại/validate/xóa/phân quyền ...> "
                "<đối tượng> với <loại dữ liệu>' — không viết cụt lủn kiểu cụm từ mô tả UI thô.",
            )

        expected_result = cells[6] if len(cells) > 6 else ""
        vm = VAGUE_EXPECTED_RE.search(expected_result)
        if vm:
            fail(
                errors,
                f"Dòng {i+1}: Expected Result chứa cụm mơ hồ '{vm.group(0)}' — không thể verify PASS/FAIL rõ ràng. "
                "Phải chọn 1 default cụ thể và gắn nhãn '[ASSUMPTION: ...]' thay vì để ngỏ.",
            )

        if check_precond and len(cells) > 4:
            precond = cells[4]
            if not PRECOND_SKIP_RE.match(precond):
                missing = []
                if not PRECOND_USER_ANCHOR_RE.search(precond):
                    missing.append("user")
                if not PRECOND_SCREEN_ANCHOR_RE.search(precond):
                    missing.append("màn hình")
                if not PRECOND_DATA_ANCHOR_RE.search(precond):
                    missing.append("dữ liệu cụ thể")
                if missing:
                    precond_gap_ids.append((tc_id, missing))

        if current_group:
            group_counts[current_group] += 1

        tc_rows.append((tc_id, tc_num, prefix, current_group, priority, line, i + 1))

    if not tc_rows:
        fail(errors, "Không tìm thấy dòng TC nào khớp pattern ID trong bảng — kiểm tra định dạng TC ID [DỰ_ÁN]_[MODULE]_TC_[SỐ].")
        return errors, warnings, None

    if len(id_prefix_counter) > 1:
        warnings.append(f"File có nhiều prefix TC ID khác nhau trong cùng bảng: {dict(id_prefix_counter)} — xác nhận đây là chủ đích (vd nhóm cross-module) chứ không phải lỗi gõ nhầm.")

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

    declared_totals = [int(m.group(1)) for l in lines[:header_idx] for m in [TOTAL_DECLARED_RE.match(l.strip())] if m]
    for d in declared_totals:
        if d != total_actual:
            fail(errors, f"'Tổng số TC' khai báo = {d}, nhưng đếm thật trong bảng = {total_actual}. Cần tính lại và sửa dòng khai báo.")

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

    real_ids = {tc_id for tc_id, *_ in tc_rows}
    for i, line in enumerate(lines):
        if i > header_idx and TC_ROW_RE.match(line):
            continue  # this line IS a table row, skip — we only care about prose references
        for m in ANY_TC_ID_RE.finditer(line):
            ref_id = m.group(1)
            if ref_id not in real_ids:
                fail(errors, f"Dòng {i+1}: tham chiếu '{ref_id}' trong văn xuôi nhưng KHÔNG tồn tại dòng TC nào có ID này (có thể trích sai ID hoặc quên cập nhật sau khi renumber).")

    if check_precond and precond_gap_ids:
        examples = ", ".join(f"{tid} (thiếu {'/'.join(m)})" for tid, m in precond_gap_ids[:5])
        more = f" (+{len(precond_gap_ids) - 5} dòng khác)" if len(precond_gap_ids) > 5 else ""
        warnings.append(
            f"{len(precond_gap_ids)} dòng Pre-Condition (UI) thiếu ít nhất 1 trong 3 thành phần bắt buộc "
            f"(user / màn hình / dữ liệu cụ thể) — xem rule manual_testcase_quality_rules.md mục 9. "
            f"Ví dụ: {examples}{more}."
        )

    stats = {
        "total": total_actual,
        "priority_counter": priority_counter,
        "by_prefix": {p: sorted(set(nums)) for p, nums in by_prefix.items()},
        "real_ids": real_ids,
    }
    return errors, warnings, stats


def _parse_child_table(lines, header_idx):
    """Parse the 'Danh sách file con' table starting right after its header row."""
    rows = []
    i = header_idx + 1
    # skip the markdown separator row (---|---|...)
    if i < len(lines) and set(lines[i].strip()) <= set("|-: "):
        i += 1
    while i < len(lines) and lines[i].strip().startswith("|"):
        line = lines[i]
        if set(line.strip()) <= set("|-: "):
            i += 1
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 2 and cells[0]:
            file_cell = cells[0].strip("`").strip()
            submodule = cells[1] if len(cells) > 1 else ""
            range_cell = cells[2] if len(cells) > 2 else ""
            total_cell = cells[3] if len(cells) > 3 else ""
            rows.append((file_cell, submodule, range_cell, total_cell, i + 1))
        i += 1
    return rows


def _validate_rollup(path, lines, child_table_idx):
    errors = []
    warnings = []
    base_dir = os.path.dirname(os.path.abspath(path))

    children = _parse_child_table(lines, child_table_idx)
    if not children:
        fail(errors, "Tìm thấy bảng 'Danh sách file con' nhưng không đọc được dòng nào — kiểm tra format bảng (mỗi dòng phải có cột File không rỗng).")
        return errors, warnings

    all_nums_by_prefix = defaultdict(list)
    total_actual_sum = 0
    priority_sum = Counter()
    all_real_ids = set()

    for file_cell, submodule, range_cell, total_cell, line_no in children:
        child_path = os.path.join(base_dir, file_cell)
        if not os.path.isfile(child_path):
            fail(errors, f"Dòng {line_no} (Danh sách file con): file con '{file_cell}' không tồn tại tại đường dẫn '{child_path}'.")
            continue

        with open(child_path, encoding="utf-8") as f:
            child_lines = f.read().splitlines()

        result = _validate_single(child_path, child_lines)
        if result is None:
            fail(errors, f"Dòng {line_no}: file con '{file_cell}' không có header bảng TC hợp lệ ('| TC ID | Module | Risk Level ...').")
            continue
        c_errors, c_warnings, stats = result
        for e in c_errors:
            errors.append(f"[{file_cell}] {e}")
        for w in c_warnings:
            warnings.append(f"[{file_cell}] {w}")
        if stats is None:
            continue

        total_actual_sum += stats["total"]
        priority_sum.update(stats["priority_counter"])
        all_real_ids |= stats["real_ids"]

        for prefix, nums in stats["by_prefix"].items():
            all_nums_by_prefix[prefix].extend(nums)

            actual_min, actual_max = min(nums), max(nums)
            range_nums = CHILD_ROW_ID_NUM_RE.findall(range_cell)
            if len(range_nums) == 2:
                decl_min, decl_max = int(range_nums[0]), int(range_nums[1])
                if decl_min != actual_min or decl_max != actual_max:
                    fail(
                        errors,
                        f"Dòng {line_no} (Danh sách file con): khai TC ID range '{range_cell}' cho '{file_cell}', "
                        f"nhưng thực tế file con có {prefix}_TC_{actual_min:03d} – {prefix}_TC_{actual_max:03d}.",
                    )
            elif range_cell.strip():
                warnings.append(f"Dòng {line_no}: không parse được TC ID range '{range_cell}' — kiểm tra format (vd `PREFIX_TC_001` – `PREFIX_TC_027`).")

        if total_cell.strip().isdigit() and int(total_cell.strip()) != stats["total"]:
            fail(
                errors,
                f"Dòng {line_no} (Danh sách file con): khai Tổng TC = {total_cell} cho '{file_cell}', "
                f"nhưng đếm thật trong file con = {stats['total']}.",
            )

    # ---- Cross-file TC ID continuity (no gaps/dups spanning the whole module) ----
    for prefix, nums in all_nums_by_prefix.items():
        dup = [n for n, c in Counter(nums).items() if c > 1]
        if dup:
            fail(errors, f"Prefix {prefix}: TC ID bị TRÙNG số GIỮA các file con: {sorted(dup)}")
        uniq = sorted(set(nums))
        if uniq and uniq[0] != 1:
            warnings.append(f"Prefix {prefix}: số TC đầu tiên xuyên suốt các file con là {uniq[0]}, không bắt đầu từ 1.")
        missing = [n for n in range(uniq[0], uniq[-1] + 1) if n not in uniq] if uniq else []
        if missing:
            fail(errors, f"Prefix {prefix}: THIẾU số TC ID xuyên suốt các file con (gap giữa 2 file con, hoặc quên đánh số): {missing}")

    # ---- Rollup's own declared "Tổng số TC" vs sum of children ----
    declared_totals = [int(m.group(1)) for l in lines[:child_table_idx] for m in [TOTAL_DECLARED_RE.match(l.strip())] if m]
    for d in declared_totals:
        if d != total_actual_sum:
            fail(errors, f"'Tổng số TC' khai báo ở rollup = {d}, nhưng tổng đếm thật từ tất cả file con = {total_actual_sum}.")

    # ---- Rollup's Priority summary table vs aggregated children ----
    prio_table_idx = None
    for i, line in enumerate(lines[:child_table_idx]):
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
        for key, actual_count in priority_sum.items():
            declared_count = declared_prio.get(key)
            if declared_count is None:
                fail(errors, f"Bảng Priority (rollup) THIẾU dòng cho giá trị Priority thực tế '{key}' (tổng đếm từ file con = {actual_count}).")
            elif declared_count != actual_count:
                fail(errors, f"Bảng Priority (rollup): '{key}' khai {declared_count}, tổng đếm thật từ file con {actual_count}.")
        for key in declared_prio:
            if key not in priority_sum:
                warnings.append(f"Bảng Priority (rollup) khai '{key}' nhưng không có TC nào ở bất kỳ file con nào mang giá trị này.")
    else:
        warnings.append("Không tìm thấy bảng 'Priority | Số lượng' (mục 6) trong rollup để đối chiếu — bỏ qua check này.")

    # ---- TC IDs referenced in rollup prose must resolve to a real row in some child ----
    for i, line in enumerate(lines):
        for m in ANY_TC_ID_RE.finditer(line):
            ref_id = m.group(1)
            if ref_id not in all_real_ids:
                fail(errors, f"Dòng {i+1} (rollup): tham chiếu '{ref_id}' trong văn xuôi nhưng KHÔNG tồn tại dòng TC nào có ID này ở bất kỳ file con nào.")

    return errors, warnings


def validate_file(path):
    with open(path, encoding="utf-8") as f:
        lines = f.read().splitlines()

    for line in lines:
        if line.strip().startswith(API_HEADER_START):
            return _validate_api(path, lines)

    header_idx = None
    for i, line in enumerate(lines):
        if line.strip().startswith("| TC ID | Module | Risk Level"):
            header_idx = i
            break

    if header_idx is not None:
        result = _validate_single(path, lines)
        errors, warnings, _stats = result
        return errors, warnings

    child_table_idx = None
    for i, line in enumerate(lines):
        if CHILD_TABLE_HEADER_RE.match(line):
            child_table_idx = i
            break

    if child_table_idx is not None:
        return _validate_rollup(path, lines, child_table_idx)

    return (
        [
            "Không tìm thấy header bảng TC UI ('| TC ID | Module | Risk Level ...'), header bảng TC API "
            "('| Test Case ID | Function | Group Tests | Risk Level ...'), và cũng không tìm thấy bảng "
            "'Danh sách file con' (rollup) — có thể sai schema, chưa tới Bước 6, hoặc thiếu header đúng format."
        ],
        [],
    )


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
