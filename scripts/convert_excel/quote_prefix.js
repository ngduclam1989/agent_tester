const fs = require("fs");
const fflate = require("fflate");

/**
 * Bật quote-prefix (dấu ' đầu ô của Excel) cho TOÀN BỘ ô trong file .xlsx.
 *
 * Vì sao cần: rất nhiều ô của bộ TC mở đầu bằng `- ` (Pre-conditions, Test Data),
 * `1. ` (Test Steps, Expected result) hoặc `=`/`+`. Khi người dùng bấm vào ô rồi Enter,
 * Excel hiểu ký tự đầu là toán tử/số và cố parse thành công thức → hiện hộp thoại lỗi /
 * `#NAME?`. Quote-prefix ép Excel luôn coi ô là text, kể cả khi nhập lại.
 *
 * Vì sao phải patch thẳng file: `xlsx-js-style` không ghi thuộc tính `quotePrefix`
 * trong style object. Ở đây thêm `quotePrefix="1"` vào mọi `<xf>` của `<cellXfs>`
 * nên không phải ánh xạ lại chỉ số style của từng ô.
 *
 * Lưu ý: dấu ' này KHÔNG nằm trong nội dung ô — nó chỉ hiện trên thanh công thức,
 * đúng như khi người dùng tự gõ `'` trong Excel. Bản `.md` không bị ảnh hưởng.
 */
function applyQuotePrefix(xlsxPath) {
  const zip = fflate.unzipSync(new Uint8Array(fs.readFileSync(xlsxPath)));
  const stylesEntry = "xl/styles.xml";
  if (!zip[stylesEntry]) return;

  const xml = new TextDecoder().decode(zip[stylesEntry]);
  const patched = xml.replace(/<cellXfs[\s\S]*?<\/cellXfs>/, (block) =>
    block.replace(/<xf (?!quotePrefix)/g, '<xf quotePrefix="1" ')
  );
  if (patched === xml) return;

  zip[stylesEntry] = new TextEncoder().encode(patched);
  fs.writeFileSync(xlsxPath, Buffer.from(fflate.zipSync(zip)));
}

module.exports = { applyQuotePrefix };
