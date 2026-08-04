#!/bin/bash
# Kịch bản kiểm thử hàng loạt
# Vẽ các bản mẫu, kiểm tra tính hợp lệ của SVG và xuất ra PNG

set -euo pipefail

# Màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_DIR="${SKILL_DIR}/test-output"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}=== Fireworks Tech Graph - Kiểm thử hàng loạt ===${NC}"
echo "Thư mục kiểm thử: $TEST_DIR"
echo "Nhãn thời gian: $TIMESTAMP"
echo ""

# Tạo thư mục kiểm thử
mkdir -p "$TEST_DIR"

# Cấu hình kiểm thử
STYLES=(1 2 3 4 5 6 7)
STYLE_NAMES=("Flat Icon" "Dark Terminal" "Blueprint" "Notion Clean" "Glassmorphism" "Claude Official" "OpenAI Official")

# Bộ đếm tổng kết
TOTAL=0
PASSED=0
FAILED=0

FIXTURES_DIR="${SKILL_DIR}/fixtures"

echo -e "${BLUE}Đang kiểm thử tất cả các phong cách...${NC}"
echo "----------------------------------------"

for i in "${!STYLES[@]}"; do
    STYLE="${STYLES[$i]}"
    STYLE_NAME="${STYLE_NAMES[$i]}"
    
    echo -e "\n${YELLOW}Phong cách $STYLE: $STYLE_NAME${NC}"
    
    # Kiểm tra xem tài liệu tham khảo phong cách có tồn tại không
    STYLE_FILE=$(find "${SKILL_DIR}/references" -maxdepth 1 -type f -name "style-${STYLE}-*.md" | head -n 1)
    if [ -z "${STYLE_FILE:-}" ] || [ ! -f "$STYLE_FILE" ]; then
        echo -e "${RED}✗ Không tìm thấy tệp phong cách: $STYLE_FILE${NC}"
        FAILED=$((FAILED + 1))
        TOTAL=$((TOTAL + 1))
        continue
    fi
    
    echo -e "${GREEN}✓ Đã tìm thấy tệp phong cách${NC}"
    
    if [ ! -d "$FIXTURES_DIR" ]; then
        echo -e "${YELLOW}⚠ Không tìm thấy thư mục fixtures: $FIXTURES_DIR${NC}"
        continue
    fi

    FIXTURE_FILES=$(find "$FIXTURES_DIR" -maxdepth 1 -type f -name "*.json" | sort || true)
    MATCHED_FIXTURES=()
    for FIXTURE in $FIXTURE_FILES; do
        FIXTURE_STYLE=$(python3 - "$FIXTURE" <<'PY'
import json
import sys
from pathlib import Path
data = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
print(data.get("style", ""))
PY
)
        if [ "$FIXTURE_STYLE" = "$STYLE" ]; then
            MATCHED_FIXTURES+=("$FIXTURE")
        fi
    done

    if [ "${#MATCHED_FIXTURES[@]}" -eq 0 ]; then
        echo -e "${YELLOW}⚠ Không tìm thấy kịch bản thử nghiệm nào cho phong cách $STYLE${NC}"
        continue
    fi

    # Vẽ, kiểm tra tính hợp lệ và xuất từng fixture
    for FIXTURE in "${MATCHED_FIXTURES[@]}"; do
        BASENAME=$(basename "$FIXTURE" .json)
        SVG_FILE="${TEST_DIR}/${BASENAME}_${TIMESTAMP}.svg"
        PNG_FILE="${TEST_DIR}/${BASENAME}_${TIMESTAMP}.png"
        TEMPLATE_TYPE=$(python3 - "$FIXTURE" <<'PY'
import json
import sys
from pathlib import Path
data = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
print(data.get("template_type", "architecture"))
PY
)

        echo -n "  Đang vẽ $BASENAME... "
        TOTAL=$((TOTAL + 1))

        if python3 "${SKILL_DIR}/scripts/generate-from-template.py" "$TEMPLATE_TYPE" "$SVG_FILE" "$(cat "$FIXTURE")" > /dev/null 2>&1 \
            && "${SKILL_DIR}/scripts/validate-svg.sh" "$SVG_FILE" > /dev/null 2>&1; then
            if command -v rsvg-convert &> /dev/null \
                && rsvg-convert -w 1920 "$SVG_FILE" -o "$PNG_FILE" 2>/dev/null; then
                PNG_SIZE=$(du -h "$PNG_FILE" | cut -f1)
                echo -e "${GREEN}✓ Đạt${NC} (${PNG_SIZE})"
            else
                echo -e "${GREEN}✓ Đạt${NC}"
            fi
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}✗ Thất bại${NC}"
            FAILED=$((FAILED + 1))
            if [ -f "$SVG_FILE" ]; then
                "${SKILL_DIR}/scripts/validate-svg.sh" "$SVG_FILE" 2>&1 | grep -E "✗|Error" | sed 's/^/    /' || true
            fi
        fi
    done
done

# In tổng kết
echo ""
echo "========================================"
echo -e "${BLUE}Tổng kết kiểm thử${NC}"
echo "----------------------------------------"
echo "Tổng số kiểm thử: $TOTAL"
echo -e "${GREEN}Đạt: $PASSED${NC}"
echo -e "${RED}Thất bại: $FAILED${NC}"

if [ "$FAILED" -eq 0 ]; then
    echo -e "\n${GREEN}✓ Tất cả kiểm thử đã vượt qua!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Một số kiểm thử đã thất bại${NC}"
    exit 1
fi
