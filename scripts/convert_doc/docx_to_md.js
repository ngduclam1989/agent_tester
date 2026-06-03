/**
 * 🛠️ DOCX to MD Converter
 * Mô tả: Tự động chuyển đổi file tài liệu Word (.docx) sang Markdown (.md) sử dụng mammoth.
 * Cách dùng: node scripts/convert_doc/docx_to_md.js <input.docx> [output.md]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Hàm in log đẹp
function log(level, message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] [${level}] ${message}`);
}

// Lấy tham số dòng lệnh
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
📊 DOCX to MD Converter
Cách dùng:
  node scripts/convert_doc/docx_to_md.js <input_path> [output_path]

Ví dụ:
  node scripts/convert_doc/docx_to_md.js requirements/specs.docx
  node scripts/convert_doc/docx_to_md.js requirements/specs.docx output/requirements.md
`);
  process.exit(0);
}

const inputPath = path.resolve(args[0]);
let outputPath = args[1] ? path.resolve(args[1]) : null;

// 1. Kiểm tra file đầu vào tồn tại
if (!fs.existsSync(inputPath)) {
  log('ERROR', `Không tìm thấy file đầu vào tại: ${inputPath}`);
  process.exit(1);
}

const ext = path.extname(inputPath).toLowerCase();

// 2. Kiểm tra định dạng file
if (ext === '.doc') {
  log('ERROR', `Định dạng file '.doc' cũ không được hỗ trợ trực tiếp.`);
  log('TIP', `Vui lòng mở file bằng Microsoft Word và dùng "Save As" sang định dạng '.docx' trước.`);
  process.exit(1);
}

if (ext !== '.docx') {
  log('ERROR', `Chỉ hỗ trợ file định dạng '.docx'. File hiện tại có đuôi '${ext}'`);
  process.exit(1);
}

// 3. Xác định đường dẫn file đầu ra nếu không chỉ định
if (!outputPath) {
  const dirName = path.dirname(inputPath);
  const baseName = path.basename(inputPath, ext);
  outputPath = path.join(dirName, `${baseName}.md`);
}

// Đảm bảo thư mục đích tồn tại
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

log('LOG', `Đang chuyển đổi: ${path.basename(inputPath)} -> ${path.basename(outputPath)}...`);

try {
  // Chạy mammoth CLI qua npx để convert
  // CLI: npx -y mammoth <input> <output> --output-format=markdown
  const cmd = `npx -y mammoth "${inputPath}" "${outputPath}" --output-format=markdown`;
  log('LOG', `Thực thi lệnh: ${cmd}`);
  
  execSync(cmd, { stdio: 'inherit' });
  
  if (fs.existsSync(outputPath)) {
    // Đọc file MD và kiểm tra xem có rỗng không
    const content = fs.readFileSync(outputPath, 'utf8');
    if (!content.trim()) {
      log('WARNING', `File Markdown đầu ra rỗng. Kiểm tra lại nội dung file Word.`);
    } else {
      log('SUCCESS', `Chuyển đổi thành công! File lưu tại: ${outputPath}`);
      log('SUCCESS', `Dung lượng: ${fs.statSync(outputPath).size} bytes`);
    }
  } else {
    log('ERROR', `Chuyển đổi thất bại. Không tìm thấy file đầu ra.`);
    process.exit(1);
  }
} catch (error) {
  log('ERROR', `Lỗi trong quá trình chuyển đổi: ${error.message}`);
  process.exit(1);
}
