/**
 * Script: api_tsv_to_md_xlsx.js
 * Mô tả:  Convert file TSV Test Case (API, schema 19 cột của skill api_test_design)
 *         sang Markdown table (.md) VÀ Excel (.xlsx) có format đẹp.
 *
 * Khác với md_to_xlsx.js (chỉ đọc bảng Markdown 9 cột của rbt_manual_testing/UI),
 * script này đọc trực tiếp file .tsv 19 cột (Test Case ID, Function, Group Tests,
 * Scenario Outline, Test Case Summary, Pre-conditions, Test Data, Test Steps,
 * Expected result, Environment, Priority, Regression, Automation,
 * Manual Test Results Round 1, Manual Test Results Round 2, Automation Test Results,
 * Actual result, BugID, Notes) do skill api_test_design sinh ra.
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

let XLSX;
try {
  XLSX = require("xlsx");
} catch {
  console.error("❌ Thiếu thư viện xlsx. Cài đặt bằng lệnh:");
  console.error("   cd scripts/convert_excel && npm install xlsx");
  process.exit(1);
}

const EXPECTED_HEADER = [
  "Test Case ID",
  "Function",
  "Group Tests",
  "Scenario Outline",
  "Test Case Summary",
  "Pre-conditions",
  "Test Data",
  "Test Steps",
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

function buildMarkdown(coverageSeal, header, rows, moduleName) {
  const lines = [];
  lines.push(`# Test Cases (API) — ${moduleName}`);
  lines.push("");
  if (coverageSeal) {
    lines.push(`> ${coverageSeal}`);
    lines.push("");
  }
  lines.push(`Tổng số Test Case: **${rows.length}**`);
  lines.push("");
  lines.push(`| ${header.join(" | ")} |`);
  lines.push(`|${header.map(() => "---").join("|")}|`);
  for (const row of rows) {
    const cells = header.map((_, i) => toMarkdownCell(row[i] || ""));
    lines.push(`| ${cells.join(" | ")} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function buildXlsx(header, rows, outputPath) {
  const wsData = [header];
  for (const row of rows) {
    const cleaned = header.map((_, i) => unescapeLiteralNewlines(row[i] || ""));
    wsData.push(cleaned);
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths — tuned cho 19 cột (ID ngắn, Steps/Expected/Summary dài)
  const colWidths = [20, 16, 16, 30, 40, 30, 30, 45, 40, 12, 10, 12, 12, 14, 14, 16, 14, 12, 12];
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));

  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", state: "frozen" };

  const lastCol = String.fromCharCode(65 + header.length - 1); // hỗ trợ tới cột Z (19 cột = S, an toàn)
  ws["!autofilter"] = { ref: `A1:${lastCol}${rows.length + 1}` };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "API Test Cases");
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
  console.log(`📊 Tìm thấy ${rows.length} test case, ${header.length} cột.`);

  const md = buildMarkdown(coverageSeal, header, rows, moduleName);
  fs.writeFileSync(mdPath, md, "utf-8");
  console.log(`✅ Đã ghi Markdown → ${mdPath}`);

  buildXlsx(header, rows, xlsxPath);
  console.log(`✅ Đã ghi Excel → ${xlsxPath}`);
}

main();
