/**
 * Script: reorder_api_tc.js
 * Mô tả:  Sắp xếp lại thứ tự KHỐI (block) các Test Case trong file TSV 19 cột
 *         (api_test_design) theo trình tự nghiệp vụ thay vì thứ tự 4 cấu phần
 *         kỹ thuật gốc (TD_P1 Method&Header -> TD_P2 Schema -> TD_P3 Business
 *         -> TD_P4 Response).
 *
 * Thứ tự khối mới:
 *   1. Value, Business Logic, Cross Logic  (Function: happy path đầu khối + unhappy)
 *   2. Schema Validation                    (Validate)
 *   3. Method & Header                      (chứa Security/Phân quyền + Protocol)
 *   4. Response Validation                  (còn lại)
 *
 * QUAN TRỌNG: KHÔNG đổi nội dung/Test Case ID của bất kỳ TC nào — chỉ đổi
 * THỨ TỰ DÒNG trong file. Trong mỗi khối, giữ nguyên thứ tự tương đối gốc
 * (Happy Path [Smoke] luôn là dòng đầu mỗi khối theo đúng thiết kế Test Design).
 *
 * Cách dùng:
 *   node scripts/convert_excel/reorder_api_tc.js <input.tsv>
 * (Ghi đè trực tiếp file input — file input đã được backup trước khi chạy hàng loạt.)
 */

const fs = require("fs");
const path = require("path");

const BLOCK_ORDER = [
  "Value, Business Logic, Cross Logic",
  "Schema Validation",
  "Method & Header",
  "Response Validation",
];

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
      let j = line.indexOf("\t", i);
      if (j === -1) j = n;
      fields.push(line.slice(i, j));
      i = j + 1;
    }
  }
  return fields;
}

function quoteCell(text) {
  return `"${text.replace(/"/g, '""')}"`;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log("Cách dùng: node scripts/convert_excel/reorder_api_tc.js <input.tsv>");
    process.exit(1);
  }
  const inputPath = path.resolve(args[0]);
  const content = fs.readFileSync(inputPath, "utf-8");
  const rawLines = content.split(/\r?\n/).filter((l) => l.length > 0);

  let idx = 0;
  let coverageSeal = null;
  if (rawLines[0].trim().startsWith("--")) {
    coverageSeal = rawLines[0];
    idx = 1;
  }
  const headerLine = rawLines[idx];
  const header = parseTsvLine(headerLine);
  idx++;

  const functionColIdx = header.indexOf("Function");
  if (functionColIdx === -1) {
    console.error("❌ Không tìm thấy cột 'Function' trong header.");
    process.exit(1);
  }

  const rows = [];
  for (; idx < rawLines.length; idx++) {
    rows.push(parseTsvLine(rawLines[idx]));
  }

  const blocks = {};
  for (const key of BLOCK_ORDER) blocks[key] = [];
  const unmatched = [];
  for (const row of rows) {
    const fn = row[functionColIdx];
    if (blocks[fn]) {
      blocks[fn].push(row);
    } else {
      unmatched.push(row);
    }
  }

  if (unmatched.length > 0) {
    console.warn(
      `⚠️  ${unmatched.length} dòng có giá trị Function không khớp 4 nhóm chuẩn — giữ nguyên ở cuối file.`
    );
  }

  const orderedRows = [];
  for (const key of BLOCK_ORDER) orderedRows.push(...blocks[key]);
  orderedRows.push(...unmatched);

  const outLines = [];
  if (coverageSeal) outLines.push(coverageSeal);
  outLines.push(header.map(quoteCell).join("\t"));
  for (const row of orderedRows) {
    outLines.push(row.map((c) => quoteCell(c)).join("\t"));
  }

  fs.writeFileSync(inputPath, outLines.join("\n") + "\n", "utf-8");
  console.log(
    `✅ Đã sắp xếp lại ${orderedRows.length} TC trong ${path.basename(inputPath)} theo thứ tự: ${BLOCK_ORDER.join(" → ")}`
  );
}

main();
