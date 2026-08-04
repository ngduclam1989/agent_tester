#!/bin/bash
# Sinh biểu đồ SVG - Kiểm tra tính hợp lệ và xuất biểu đồ SVG sang PNG

set -euo pipefail

# Màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Giá trị mặc định
STYLE="1"
WIDTH="1920"
OUTPUT_DIR="."
VALIDATE=true

# Các loại biểu đồ hợp lệ
VALID_TYPES="architecture|data-flow|flowchart|sequence|comparison|timeline|mind-map|agent|memory|use-case|class|state-machine|er-diagram|network-topology"

usage() {
    cat << USAGE
Cách dùng: $0 [TÙY CHỌN]

Tùy chọn:
    -t, --type TYPE        Loại biểu đồ ($VALID_TYPES)
    -s, --style STYLE      Mã phong cách (1-7, mặc định: 1)
    -o, --output PATH      Đường dẫn đầu ra (mặc định: thư mục hiện tại)
    -w, --width WIDTH      Chiều rộng PNG bằng pixel (mặc định: 1920)
    --no-validate          Bỏ qua kiểm tra tính hợp lệ
    -h, --help             Hiển thị trợ giúp này

Ví dụ:
    $0 -t architecture -s 1 -o ./output/arch.svg
    $0 -t class -s 2 -w 2400
    $0 -t sequence -s 6
USAGE
    exit 0
}

# Phân tích đối số
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            TYPE="$2"
            shift 2
            ;;
        -s|--style)
            STYLE="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_PATH="$2"
            shift 2
            ;;
        -w|--width)
            WIDTH="$2"
            shift 2
            ;;
        --no-validate)
            VALIDATE=false
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo -e "${RED}Tùy chọn không xác định: $1${NC}"
            usage
            ;;
    esac
done

# Kiểm tra các tham số bắt buộc
if [ -z "${TYPE:-}" ]; then
    echo -e "${RED}Lỗi: Loại biểu đồ là bắt buộc${NC}"
    usage
fi

# Kiểm tra tính hợp lệ của loại biểu đồ
VALID_TYPE=false
for t in architecture data-flow flowchart sequence comparison timeline mind-map agent memory use-case class state-machine er-diagram network-topology; do
    if [ "$TYPE" = "$t" ]; then
        VALID_TYPE=true
        break
    fi
done

if [ "$VALID_TYPE" = false ]; then
    echo -e "${RED}Lỗi: Loại biểu đồ không hợp lệ '$TYPE'${NC}"
    echo "Các loại hợp lệ: $VALID_TYPES"
    exit 1
fi

# Xác định đường dẫn đầu ra
if [ -z "${OUTPUT_PATH:-}" ]; then
    BASENAME="${TYPE}-style${STYLE}"
    SVG_FILE="${OUTPUT_DIR}/${BASENAME}.svg"
    PNG_FILE="${OUTPUT_DIR}/${BASENAME}.png"
else
    SVG_FILE="$OUTPUT_PATH"
    PNG_FILE="${OUTPUT_PATH%.svg}.png"
fi

echo -e "${BLUE}Đang tạo biểu đồ ${TYPE} (phong cách ${STYLE})...${NC}"
echo "Đầu ra: $SVG_FILE"

# Tải tài liệu tham khảo phong cách
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STYLE_FILE=$(find "${SKILL_DIR}/references" -maxdepth 1 -type f -name "style-${STYLE}-*.md" | head -n 1)

if [ -z "${STYLE_FILE:-}" ] || [ ! -f "$STYLE_FILE" ]; then
    echo -e "${RED}Lỗi: Không tìm thấy tệp phong cách: ${STYLE_FILE}${NC}"
    echo "Các phong cách hiện có: 1-7"
    exit 1
fi

# Lưu ý: Việc tạo nội dung SVG thực tế do Claude Code thực hiện
# Kịch bản này chỉ cung cấp tính năng kiểm tra tính hợp lệ và xuất file

echo -e "${YELLOW}Lưu ý: Việc tạo nội dung SVG yêu cầu Claude Code${NC}"
echo -e "${YELLOW}Kịch bản này chỉ cung cấp tính năng kiểm tra tính hợp lệ và xuất file${NC}"

# Kiểm tra xem file SVG có tồn tại không
if [ -f "$SVG_FILE" ]; then
    if [ "$VALIDATE" = true ]; then
        echo -e "\n${BLUE}Đang kiểm tra tính hợp lệ của SVG...${NC}"
        if "${SKILL_DIR}/scripts/validate-svg.sh" "$SVG_FILE"; then
            echo -e "${GREEN}Kiểm tra tính hợp lệ thành công${NC}"
        else
            echo -e "${RED}Kiểm tra tính hợp lệ thất bại${NC}"
            exit 1
        fi
    fi

    # Xuất ra file PNG
    echo -e "\n${BLUE}Đang xuất ra file PNG (chiều rộng: ${WIDTH}px)...${NC}"
    if command -v rsvg-convert &> /dev/null; then
        if rsvg-convert -w "$WIDTH" "$SVG_FILE" -o "$PNG_FILE" 2>/dev/null; then
            PNG_SIZE=$(du -h "$PNG_FILE" | cut -f1)
            echo -e "${GREEN}Đã xuất PNG: $PNG_FILE (${PNG_SIZE})${NC}"
        else
            echo -e "${RED}Xuất PNG thất bại${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Lỗi: Không tìm thấy rsvg-convert${NC}"
        echo "Cài đặt bằng lệnh: brew install librsvg"
        exit 1
    fi
else
    echo -e "${YELLOW}Không tìm thấy file SVG. Hãy tạo nó trước bằng Claude Code.${NC}"
    exit 1
fi

echo -e "\n${GREEN}Hoàn thành${NC}"
