/**
 * Script: md_to_xlsx.js
 * Mô tả:  Convert file Markdown Test Cases sang Excel (.xlsx) có format đẹp.
 * Cách dùng:
 *   node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]
 *
 * Yêu cầu: npm install xlsx   (hoặc chạy 1 lần: npm i xlsx --save-dev)
 */

const fs = require("fs");
const path = require("path");
// Dấu ' đầu ô (quotePrefix) — dùng chung với api_tsv_to_md_xlsx.js
const { applyQuotePrefix } = require("./quote_prefix");

// xlsx-js-style: fork của SheetJS, API y hệt nhưng GHI được style (fill/font/border/wrap).
// Bản `xlsx` community chỉ đọc được style, ghi ra sẽ mất màu.
let XLSX;
try {
  XLSX = require("xlsx-js-style");
} catch {
  console.error("❌ Thiếu thư viện xlsx-js-style. Cài đặt bằng lệnh:");
  console.error("   cd scripts/convert_excel && npm install");
  process.exit(1);
}

// Bảng màu lấy từ .claude/skills/rbt_manual_testing/templates/Testcase_mẫu AI_v1.0.0.xlsx
const PALETTE = {
  header: "2F5597", // navy — dòng tên cột
  group1: "9DC3E6", // xanh vừa — dòng nhóm rủi ro (**NHÓM ...**)
  group2: "BDD7EE", // xanh nhạt — dòng nhóm con trong nhóm Validate (**— Trường: ...**)
  border: "4472C4",
  added: "C00000", // đỏ — chữ của TC bổ sung (cột "TC ID gốc" trống)
};
const FONT = "Arial";
// Cột căn giữa: TC ID(0) · Risk Level(2) · Priority(7)
const CENTERED = new Set([0, 2, 7]);

/** Dòng tiêu đề nhóm: ô đầu dạng **...**, 8 ô còn lại rỗng */
function isGroupRow(row) {
  const first = (row[0] || "").trim();
  if (!/^\*\*.*\*\*$/.test(first)) return false;
  return row.slice(1).every((c) => (c || "").trim() === "");
}

/** Nhóm con (Validate tách theo từng trường) bắt đầu bằng — hoặc - */
function isSubGroup(label) {
  return /^[—–-]\s/.test(label.replace(/^\*+|\*+$/g, "").trim());
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Remove emoji characters */
function stripEmoji(text) {
  return text.replace(/[\u{1F534}\u{1F7E1}\u{1F7E2}\u2705\u274C\u{1F525}]/gu, "").trim();
}

/** Convert <br> → newline, strip backticks & emoji */
function cleanCell(text) {
  let out = text.replace(/<br>/gi, "\n");
  out = out.replace(/`([^`]*)`/g, "$1"); // remove inline code markers
  return stripEmoji(out).trim();
}

/** Detect risk level from cell text */
function detectRisk(text) {
  const l = text.toLowerCase();
  if (l.includes("high")) return "high";
  if (l.includes("medium")) return "medium";
  if (l.includes("low")) return "low";
  return "";
}

/** Detect priority from cell text */
function detectPriority(text) {
  const l = text.toLowerCase();
  for (const p of ["critical", "high", "medium", "low"]) {
    if (l.includes(p)) return p;
  }
  return "";
}

// ── Parse Markdown tables ──────────────────────────────────────────────────

function parseMdTables(filepath) {
  const content = fs.readFileSync(filepath, "utf-8");
  const lines = content.split("\n");

  const tables = [];
  let currentTable = null;
  let headerFound = false;
  // Tên sheet khai ngay trước bảng bằng `<!-- sheet: TÊN -->`; bảng không khai → sheet mặc định
  let pendingSheet = null;

  for (const line of lines) {
    const stripped = line.trim();

    const sm = stripped.match(/^<!--\s*sheet:\s*(.+?)\s*-->$/i);
    if (sm) {
      pendingSheet = sm[1];
      continue;
    }

    // Detect header row of a test-case table
    if (stripped.startsWith("|") && stripped.includes("TC ID") && stripped.includes("Test Title")) {
      headerFound = true;
      currentTable = [];
      currentTable.sheet = pendingSheet || DEFAULT_SHEET;
      pendingSheet = null;
      if (!tables.header) {
        tables.header = stripped.split("|").slice(1, -1).map((c) => c.trim());
      }
      continue;
    }

    // Skip separator row (|---|---|…)
    if (headerFound && /^\|[\s\-|]+\|$/.test(stripped)) {
      headerFound = false;
      continue;
    }

    // Data rows
    if (currentTable !== null && stripped.startsWith("|")) {
      const cells = stripped
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.length > 0) {
        currentTable.push(cells);
      }
    } else if (currentTable !== null && !stripped.startsWith("|")) {
      if (currentTable.length > 0) {
        tables.push(currentTable);
      }
      currentTable = null;
    }
  }

  // Flush last table
  if (currentTable && currentTable.length > 0) {
    tables.push(currentTable);
  }

  return tables;
}

// ── Build Excel ────────────────────────────────────────────────────────────

const DEFAULT_SHEET = "Test Cases";

/** Gom bảng theo tên sheet (giữ thứ tự xuất hiện): mỗi sheet = 1 worksheet trong file Excel */
function buildXlsx(tables, outputPath) {
  const sheets = new Map();
  for (const table of tables) {
    if (!sheets.has(table.sheet)) sheets.set(table.sheet, []);
    sheets.get(table.sheet).push(table);
  }
  const wb = XLSX.utils.book_new();
  let count = 0;
  for (const [name, sheetTables] of sheets) {
    const { ws, tcCount } = buildSheet(sheetTables, tables.header);
    // Excel giới hạn tên sheet 31 ký tự
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    count += tcCount;
  }
  XLSX.writeFile(wb, outputPath);
  applyQuotePrefix(outputPath);
  return count;
}

function buildSheet(tables, headerCells) {
  const headers = [
    "TC ID",
    "Module",
    "Risk Level",
    "Test Title",
    "Pre-Condition",
    "Test Steps",
    "Expected Result",
    "Priority",
    "Test Data",
  ];
  // Cột phụ đặt SAU Test Data (vd "TC ID gốc" map sang bộ TC của khách) — 9 cột chuẩn giữ nguyên vị trí
  const extraHeaders = (headerCells || []).slice(headers.length);
  headers.push(...extraHeaders);

  const colWidths = [22, 22, 14, 50, 35, 60, 60, 12, 40, ...extraHeaders.map(() => 18)];

  // Collect all rows
  const allRows = [];
  for (const table of tables) {
    for (const row of table) {
      const cleaned = [];
      for (let i = 0; i < headers.length; i++) {
        cleaned.push(cleanCell(row[i] || ""));
      }
      allRows.push(cleaned);
    }
  }

  // Phân loại từng dòng TRƯỚC khi bỏ dấu ** (bỏ rồi thì không nhận diện được nữa)
  const kinds = allRows.map((row) =>
    isGroupRow(row) ? (isSubGroup(row[0]) ? "g2" : "g1") : "tc"
  );
  // Nhãn dòng nhóm trong .md phải bọc ** để in đậm; trong Excel đã có nền + font đậm
  allRows.forEach((row, i) => {
    if (kinds[i] !== "tc") row[0] = row[0].replace(/^\*\*|\*\*$/g, "");
  });

  // Build worksheet data (header + data rows)
  const wsData = [headers, ...allRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ── Column widths ──────────────────────────────────────────────────────
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));

  // ── Freeze top row ─────────────────────────────────────────────────────
  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", state: "frozen" };

  // ── AutoFilter ─────────────────────────────────────────────────────────
  ws["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}${allRows.length + 1}` };

  // ── Outline group: TC thụt vào dưới dòng tiêu đề nhóm gần nhất ────────────
  // g1 (nhóm rủi ro) cấp 0, g2 (nhóm con theo trường) cấp 1, TC luôn là cấp thấp nhất
  // → đóng/mở được cả nhóm rủi ro lẫn từng trường. summaryBelow=false vì tiêu đề nằm TRÊN cụm TC.
  ws["!outline"] = { above: true };
  let lastGroupKind = null;
  ws["!rows"] = [
    {},
    ...kinds.map((kind) => {
      if (kind !== "tc") {
        lastGroupKind = kind;
        return kind === "g2" ? { level: 1 } : {};
      }
      return { level: lastGroupKind === "g2" ? 2 : 1 };
    }),
  ];

  // ── Tô màu theo bảng màu template ──────────────────────────────────────
  const base = { name: FONT, sz: 10 };
  const e = { style: "thin", color: { rgb: PALETTE.border } };
  const border = { top: e, bottom: e, left: e, right: e };

  for (let c = 0; c < headers.length; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { ...base, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: PALETTE.header } },
      alignment: { horizontal: "center", vertical: "top", wrapText: true },
      border,
    };
  }

  // Bộ TC dựng lại từ file khách: dòng TC có cột "TC ID gốc" trống là TC agent bổ sung → chữ đỏ
  const origCol = headers.indexOf("TC ID gốc");
  kinds.forEach((kind, idx) => {
    const fill = kind === "g1" ? PALETTE.group1 : kind === "g2" ? PALETTE.group2 : null;
    const added = kind === "tc" && origCol >= 0 && !allRows[idx][origCol];
    for (let c = 0; c < headers.length; c++) {
      const addr = XLSX.utils.encode_cell({ r: idx + 1, c });
      if (!ws[addr]) continue;
      ws[addr].s = {
        font: { ...base, bold: kind !== "tc", ...(added ? { color: { rgb: PALETTE.added } } : {}) },
        ...(fill ? { fill: { fgColor: { rgb: fill } } } : {}),
        alignment: {
          vertical: "top",
          wrapText: true,
          horizontal: kind !== "tc" ? "left" : CENTERED.has(c) ? "center" : "left",
        },
        border,
      };
    }
  });

  // Chỉ đếm dòng TC thật, không tính dòng tiêu đề nhóm
  return { ws, tcCount: kinds.filter((k) => k === "tc").length };
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Cách dùng: node scripts/convert_excel/md_to_xlsx.js <input.md> [output.xlsx]");
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File không tồn tại: ${inputPath}`);
    process.exit(1);
  }

  const outputPath = args[1]
    ? path.resolve(args[1])
    : inputPath.replace(/\.md$/i, ".xlsx");

  console.log(`📖 Đang đọc: ${inputPath}`);
  const tables = parseMdTables(inputPath);

  if (tables.length === 0) {
    console.error("❌ Không tìm thấy bảng Test Cases nào trong file markdown.");
    process.exit(1);
  }

  const flat = tables.flat();
  const groupRows = flat.filter(isGroupRow).length;
  const sheetNames = [...new Set(tables.map((t) => t.sheet))];
  console.log(
    `📊 Tìm thấy ${tables.length} bảng, ${flat.length - groupRows} test case + ${groupRows} dòng tiêu đề nhóm, ${sheetNames.length} sheet: ${sheetNames.join(", ")}`
  );

  const count = buildXlsx(tables, outputPath);
  console.log(`✅ Đã xuất ${count} test cases → ${outputPath}`);
}

main();
