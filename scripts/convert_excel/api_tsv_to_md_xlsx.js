/**
 * Script: api_tsv_to_md_xlsx.js
 * Mô tả:  Convert file TSV Test Case (API, schema 19 cột của skill api_test_design)
 *         sang Markdown (.md) VÀ Excel (.xlsx) đã chuẩn hóa theo RBT.
 *
 * Khác với md_to_xlsx.js (chỉ đọc bảng Markdown 9 cột của rbt_manual_testing/UI),
 * script này đọc trực tiếp file .tsv 19 cột (Test Case ID, Function, Group Tests,
 * Risk Level, Test Case Title, Pre-conditions, Test Steps, Test Data,
 * Expected result, Environment, Priority, Regression, Automation,
 * Manual Test Results Round 1, Manual Test Results Round 2, Automation Test Results,
 * Actual result, BugID, Notes) do skill api_test_design sinh ra.
 *
 * Chuẩn hóa theo RBT (v2):
 *   - Nhận diện DÒNG TIÊU ĐỀ NHÓM (ô đầu dạng "**<NHÓM rủi ro> - <tên block>**",
 *     19 ô còn lại rỗng) — không tính vào tổng số TC.
 *   - File .md tách mỗi NHÓM RỦI RO RBT (cột Function) thành 1 section "##" riêng, kèm
 *     bảng tổng hợp số TC theo Nhóm x Block x Risk Level tính lại từ nội dung thật.
 *   - File .xlsx giữ 1 sheet "API Test Cases" theo đúng thứ tự gốc (kể cả dòng nhóm),
 *     kèm 1 sheet "Tong hop".
 *
 * Cách dùng:
 *   node scripts/convert_excel/api_tsv_to_md_xlsx.js <input.tsv> [output_basename]
 *
 * Output: <output_basename>.md và <output_basename>.xlsx (mặc định cùng tên input,
 * đổi đuôi .tsv -> .md / .xlsx) trong cùng thư mục với file input.
 *
 * Yêu cầu: npm install xlsx (đã có sẵn trong scripts/convert_excel/node_modules)
 */

const fs = require("fs");
const path = require("path");

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
  group1: "9DC3E6", // xanh vừa — dòng nhóm mở đầu 1 NHÓM RỦI RO
  group2: "BDD7EE", // xanh nhạt — dòng nhóm của các block tiếp theo
  border: "4472C4", // viền mảnh xanh
};
const FONT = "Arial";
const thinBorder = () => {
  const e = { style: "thin", color: { rgb: PALETTE.border } };
  return { top: e, bottom: e, left: e, right: e };
};
// Cột căn giữa: Test Case ID(0) Risk Level(3) Environment(9) Priority(10)
// Regression(11) Automation(12) + 4 cột kết quả (13-16) + BugID(17)
const CENTERED = new Set([0, 3, 9, 10, 11, 12, 13, 14, 15, 16, 17]);

const EXPECTED_HEADER = [
  "Test Case ID",
  "Function",
  "Group Tests",
  "Risk Level",
  "Test Case Title",
  "Pre-conditions",
  "Test Steps",
  "Test Data",
  "Expected result",
  "Environment",
  "Priority",
  "Regression",
  "Automation",
  "Manual Test Results Round 1",
  "Manual Test Results Round 2",
  "Automation Test Results",
  "Actual result",
  "BugID",
  "Notes",
];

/** Parse 1 dòng TSV theo quy tắc Quote-All + escape "" -> ", tab là delimiter cấu trúc. */
function parseTsvLine(line) {
  const fields = [];
  let i = 0;
  const n = line.length;
  while (i < n) {
    if (line[i] === '"') {
      i++;
      let field = "";
      while (i < n) {
        if (line[i] === '"') {
          if (line[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          } else {
            i++;
            break;
          }
        } else {
          field += line[i];
          i++;
        }
      }
      fields.push(field);
      if (line[i] === "\t") i++;
    } else {
      // Fallback: field không quote (không đúng contract nhưng vẫn xử lý an toàn)
      let j = line.indexOf("\t", i);
      if (j === -1) j = n;
      fields.push(line.slice(i, j));
      i = j + 1;
    }
  }
  return fields;
}

function parseTsvFile(filepath) {
  const content = fs.readFileSync(filepath, "utf-8");
  const rawLines = content.split(/\r?\n/).filter((l) => l.length > 0);

  if (rawLines.length === 0) {
    throw new Error("File rỗng.");
  }

  let idx = 0;
  let coverageSeal = null;
  if (rawLines[0].trim().startsWith("--")) {
    coverageSeal = rawLines[0].trim();
    idx = 1;
  }

  const header = parseTsvLine(rawLines[idx]);
  idx++;

  const mismatch = EXPECTED_HEADER.some((h, i) => header[i] !== h);
  if (header.length !== 19 || mismatch) {
    console.warn(
      `⚠️  Header không khớp 100% contract 19 cột chuẩn (tìm thấy ${header.length} cột). Vẫn tiếp tục dùng header thực tế trong file.`
    );
  }

  const rows = [];
  for (; idx < rawLines.length; idx++) {
    const fields = parseTsvLine(rawLines[idx]);
    if (fields.length === 0) continue;
    rows.push(fields);
  }

  return { coverageSeal, header, rows };
}

/** literal "\n" (2 ký tự) trong cell -> newline thật (dùng cho Excel wrap text) */
function unescapeLiteralNewlines(text) {
  return text.replace(/\\n/g, "\n");
}

/** newline thật -> <br> (dùng cho Markdown table cell), escape | */
function toMarkdownCell(text) {
  const withRealNewlines = unescapeLiteralNewlines(text);
  return withRealNewlines.replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
}

/**
 * Dòng tiêu đề nhóm: ô đầu tiên là nhãn in đậm "**NHÓM ...**", mọi ô còn lại rỗng.
 * Dòng này chỉ để phân nhóm trực quan — KHÔNG phải test case.
 */
function isGroupRow(row) {
  const first = (row[0] || "").trim();
  if (!/^\*\*.*\*\*$/.test(first)) return false;
  return row.slice(1).every((c) => (c || "").trim() === "");
}

function countTestCases(rows) {
  return rows.filter((r) => !isGroupRow(r)).length;
}

/** Thống kê số TC theo Nhóm rủi ro x Block x Risk Level (tính lại từ nội dung thật). */
function buildSummary(rows) {
  const map = new Map();
  for (const row of rows) {
    if (isGroupRow(row)) continue;
    const key = [row[1] || "", row[2] || "", row[3] || ""].join("\u0000");
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].map(([k, count]) => {
    const [fn, block, risk] = k.split("\u0000");
    return { fn, block, risk, count };
  });
}

function buildMarkdown(coverageSeal, header, rows, moduleName) {
  const lines = [];
  lines.push(`# Test Cases (API) — ${moduleName}`);
  lines.push("");
  if (coverageSeal) {
    lines.push(`> ${coverageSeal}`);
    lines.push("");
  }
  lines.push(`Tổng số Test Case: **${countTestCases(rows)}**`);
  lines.push("");

  const summary = buildSummary(rows);
  if (summary.length > 0) {
    lines.push("## Tổng hợp theo nhóm");
    lines.push("");
    lines.push("| Nhóm rủi ro (Function) | Block (Group Tests) | Risk Level | Số TC |");
    lines.push("|---|---|---|---|");
    for (const r of summary) {
      lines.push(`| ${r.fn} | ${r.block} | ${r.risk} | ${r.count} |`);
    }
    lines.push(`| **Tổng** | | | **${countTestCases(rows)}** |`);
    lines.push("");
  }

  const headerLine = `| ${header.join(" | ")} |`;
  const sepLine = `|${header.map(() => "---").join("|")}|`;

  // Dòng tiêu đề nhóm không có cột Function → nó thuộc về nhóm rủi ro của TC ngay sau nó.
  // Nếu không tính trước, dòng nhóm sẽ bị in ra TRƯỚC heading "##" của chính nó.
  const effectiveFn = rows.map((row, i) => {
    if (!isGroupRow(row)) return row[1] || "";
    for (let j = i + 1; j < rows.length; j++) {
      if (!isGroupRow(rows[j])) return rows[j][1] || "";
    }
    return "";
  });

  let currentFn = null;
  let tableOpen = false;

  const closeTable = () => {
    if (tableOpen) {
      lines.push("");
      tableOpen = false;
    }
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = header.map((_, k) => toMarkdownCell(row[k] || ""));
    const fn = effectiveFn[i];

    if (fn !== currentFn) {
      closeTable();
      currentFn = fn;
      lines.push(`## ${fn}`);
      lines.push("");
    }

    if (!tableOpen) {
      lines.push(headerLine);
      lines.push(sepLine);
      tableOpen = true;
    }
    lines.push(`| ${cells.join(" | ")} |`);
  }
  closeTable();

  return lines.join("\n");
}

/**
 * Tô màu sheet "API Test Cases" theo bảng màu của template mẫu:
 *   - dòng 1 (header)           → nền navy, chữ trắng đậm, căn giữa
 *   - dòng nhóm mở đầu 1 NHÓM   → nền xanh vừa, chữ đậm
 *   - dòng nhóm của block tiếp  → nền xanh nhạt, chữ đậm
 *   - dòng TC                   → nền trắng, wrap text, căn trên
 */
function applyStyles(ws, header, rows) {
  const base = { name: FONT, sz: 10 };
  const border = thinBorder();

  for (let c = 0; c < header.length; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { ...base, bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: PALETTE.header } },
      alignment: { horizontal: "center", vertical: "top", wrapText: true },
      border,
    };
  }

  let lastFn = null;
  rows.forEach((row, idx) => {
    const r = idx + 1;
    const group = isGroupRow(row);
    // Dòng nhóm mang tên NHÓM ngay trong nhãn; dòng TC lấy từ cột Function
    const fn = group ? (row[0] || "").replace(/\*/g, "").split(" - ")[0].trim() : row[1];
    let fill = null;
    if (group) {
      fill = fn && fn !== lastFn ? PALETTE.group1 : PALETTE.group2;
    }
    if (fn) lastFn = fn;

    for (let c = 0; c < header.length; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) continue;
      ws[addr].s = {
        font: { ...base, bold: group },
        ...(fill ? { fill: { fgColor: { rgb: fill } } } : {}),
        alignment: {
          vertical: "top",
          wrapText: true,
          horizontal: group ? "left" : CENTERED.has(c) ? "center" : "left",
        },
        border,
      };
    }
  });
}

function buildXlsx(header, rows, outputPath) {
  const wsData = [header];
  for (const row of rows) {
    const cleaned = header.map((_, i) => unescapeLiteralNewlines(row[i] || ""));
    // Nhãn dòng nhóm trong .md phải bọc ** để in đậm; trong Excel đã có nền + font đậm
    // nên bỏ dấu ** đi cho sạch.
    if (isGroupRow(row)) cleaned[0] = cleaned[0].replace(/^\*\*|\*\*$/g, "");
    wsData.push(cleaned);
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths — tuned cho 19 cột (ID ngắn, Title/Steps/Expected dài)
  const colWidths = [
    22, 20, 22, 11, 58, 34, 48, 34, 42, 10, 10, 11, 11, 14, 14, 16, 14, 10, 30,
  ];
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));

  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", state: "frozen" };

  const lastCol = String.fromCharCode(65 + header.length - 1); // 19 cột = S, an toàn
  ws["!autofilter"] = { ref: `A1:${lastCol}${rows.length + 1}` };

  applyStyles(ws, header, rows);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "API Test Cases");

  // Sheet "Tong hop": thống kê tính lại từ nội dung thật, không viết tay
  const summary = buildSummary(rows);
  const sumData = [["Nhom rui ro (Function)", "Block (Group Tests)", "Risk Level", "So TC"]];
  for (const r of summary) sumData.push([r.fn, r.block, r.risk, r.count]);
  sumData.push(["TONG", "", "", countTestCases(rows)]);
  const wsSum = XLSX.utils.aoa_to_sheet(sumData);
  wsSum["!cols"] = [{ wch: 34 }, { wch: 30 }, { wch: 12 }, { wch: 8 }];
  wsSum["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", state: "frozen" };
  applyStyles(wsSum, sumData[0], sumData.slice(1));
  XLSX.utils.book_append_sheet(wb, wsSum, "Tong hop");

  XLSX.writeFile(wb, outputPath);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log(
      "Cách dùng: node scripts/convert_excel/api_tsv_to_md_xlsx.js <input.tsv> [output_basename]"
    );
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File không tồn tại: ${inputPath}`);
    process.exit(1);
  }

  const base = args[1]
    ? path.resolve(args[1])
    : inputPath.replace(/\.tsv$/i, "");
  const mdPath = base + ".md";
  const xlsxPath = base + ".xlsx";
  const moduleName = path.basename(base).replace(/^TC_/, "").replace(/_API$/, "");

  console.log(`📖 Đang đọc: ${inputPath}`);
  const { coverageSeal, header, rows } = parseTsvFile(inputPath);
  const tcCount = countTestCases(rows);
  const groupCount = rows.length - tcCount;
  console.log(
    `📊 Tìm thấy ${tcCount} test case + ${groupCount} dòng tiêu đề nhóm, ${header.length} cột.`
  );

  const md = buildMarkdown(coverageSeal, header, rows, moduleName);
  fs.writeFileSync(mdPath, md, "utf-8");
  console.log(`✅ Đã ghi Markdown → ${mdPath}`);

  buildXlsx(header, rows, xlsxPath);
  console.log(`✅ Đã ghi Excel → ${xlsxPath}`);
}

main();
