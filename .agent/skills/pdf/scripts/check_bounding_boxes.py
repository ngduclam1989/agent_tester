from dataclasses import dataclass
import json
import sys


@dataclass
class RectAndField:
    rect: list[float]
    rect_type: str
    field: dict


def get_bounding_box_messages(fields_json_stream) -> list[str]:
    messages = []
    fields = json.load(fields_json_stream)
    messages.append(f"Đã đọc {len(fields['form_fields'])} trường")

    def rects_intersect(r1, r2):
        disjoint_horizontal = r1[0] >= r2[2] or r1[2] <= r2[0]
        disjoint_vertical = r1[1] >= r2[3] or r1[3] <= r2[1]
        return not (disjoint_horizontal or disjoint_vertical)

    rects_and_fields = []
    for f in fields["form_fields"]:
        rects_and_fields.append(RectAndField(f["label_bounding_box"], "label", f))
        rects_and_fields.append(RectAndField(f["entry_bounding_box"], "entry", f))

    has_error = False
    for i, ri in enumerate(rects_and_fields):
        for j in range(i + 1, len(rects_and_fields)):
            rj = rects_and_fields[j]
            if ri.field["page_number"] == rj.field["page_number"] and rects_intersect(ri.rect, rj.rect):
                has_error = True
                if ri.field is rj.field:
                    messages.append(f"THẤT BẠI: Có sự giao nhau (va chạm) giữa hộp bao nhãn (label) và hộp bao nhập liệu (entry) của `{ri.field['description']}` ({ri.rect}, {rj.rect})")
                else:
                    type_i = "nhãn" if ri.rect_type == "label" else "nhập liệu"
                    type_j = "nhãn" if rj.rect_type == "label" else "nhập liệu"
                    messages.append(f"THẤT BẠI: Có sự giao nhau giữa hộp bao {type_i} của `{ri.field['description']}` ({ri.rect}) và hộp bao {type_j} của `{rj.field['description']}` ({rj.rect})")
                if len(messages) >= 20:
                    messages.append("Hủy bỏ các kiểm tra tiếp theo; hãy sửa lại các hộp bao (bounding box) và thử lại")
                    return messages
        if ri.rect_type == "entry":
            if "entry_text" in ri.field:
                font_size = ri.field["entry_text"].get("font_size", 14)
                entry_height = ri.rect[3] - ri.rect[1]
                if entry_height < font_size:
                    has_error = True
                    messages.append(f"THẤT BẠI: Chiều cao hộp bao nhập liệu ({entry_height}) của `{ri.field['description']}` quá thấp so với kích thước nội dung văn bản (cỡ chữ: {font_size}). Hãy tăng chiều cao hộp hoặc giảm cỡ chữ.")
                    if len(messages) >= 20:
                        messages.append("Hủy bỏ các kiểm tra tiếp theo; hãy sửa lại các hộp bao (bounding box) và thử lại")
                        return messages

    if not has_error:
        messages.append("THÀNH CÔNG: Tất cả các hộp bao (bounding box) đều hợp lệ")
    return messages


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Cách dùng: check_bounding_boxes.py [fields.json]")
        sys.exit(1)
    with open(sys.argv[1], encoding='utf-8') as f:
        messages = get_bounding_box_messages(f)
    for msg in messages:
        print(msg)
