import json
import sys

from pypdf import PdfReader, PdfWriter

from extract_form_field_info import get_field_info


def fill_pdf_fields(input_pdf_path: str, fields_json_path: str, output_pdf_path: str):
    with open(fields_json_path, encoding='utf-8') as f:
        fields = json.load(f)
    fields_by_page = {}
    for field in fields:
        if "value" in field:
            field_id = field["field_id"]
            page = field["page"]
            if page not in fields_by_page:
                fields_by_page[page] = {}
            fields_by_page[page][field_id] = field["value"]
    
    reader = PdfReader(input_pdf_path)

    has_error = False
    field_info = get_field_info(reader)
    fields_by_ids = {f["field_id"]: f for f in field_info}
    for field in fields:
        existing_field = fields_by_ids.get(field["field_id"])
        if not existing_field:
            has_error = True
            print(f"LỖI: `{field['field_id']}` không phải là ID trường hợp lệ")
        elif field["page"] != existing_field["page"]:
            has_error = True
            print(f"LỖI: Số trang không chính xác cho `{field['field_id']}` (nhận được {field['page']}, kỳ vọng {existing_field['page']})")
        else:
            if "value" in field:
                err = validation_error_for_field_value(existing_field, field["value"])
                if err:
                    print(err)
                    has_error = True
    if has_error:
        sys.exit(1)

    writer = PdfWriter(clone_from=reader)
    for page, field_values in fields_by_page.items():
        writer.update_page_form_field_values(writer.pages[page - 1], field_values, auto_regenerate=False)

    writer.set_need_appearances_writer(True)
    
    with open(output_pdf_path, "wb") as f:
        writer.write(f)


def validation_error_for_field_value(field_info, field_value):
    field_type = field_info["type"]
    field_id = field_info["field_id"]
    if field_type == "checkbox":
        checked_val = field_info["checked_value"]
        unchecked_val = field_info["unchecked_value"]
        if field_value != checked_val and field_value != unchecked_val:
            return f'LỖI: Giá trị "{field_value}" không hợp lệ cho hộp kiểm (checkbox) "{field_id}". Giá trị được chọn (checked) là "{checked_val}" và giá trị không chọn (unchecked) là "{unchecked_val}"'
    elif field_type == "radio_group":
        option_values = [opt["value"] for opt in field_info["radio_options"]]
        if field_value not in option_values:
            return f'LỖI: Giá trị "{field_value}" không hợp lệ cho nhóm nút chọn (radio group) "{field_id}". Các giá trị hợp lệ là: {option_values}' 
    elif field_type == "choice":
        choice_values = [opt["value"] for opt in field_info["choice_options"]]
        if field_value not in choice_values:
            return f'LỖI: Giá trị "{field_value}" không hợp lệ cho trường danh sách lựa chọn (choice) "{field_id}". Các giá trị hợp lệ là: {choice_values}'
    return None


def monkeypatch_pydpf_method():
    from pypdf.generic import DictionaryObject
    from pypdf.constants import FieldDictionaryAttributes

    original_get_inherited = DictionaryObject.get_inherited

    def patched_get_inherited(self, key: str, default = None):
        result = original_get_inherited(self, key, default)
        if key == FieldDictionaryAttributes.Opt:
            if isinstance(result, list) and all(isinstance(v, list) and len(v) == 2 for v in result):
                result = [r[0] for r in result]
        return result

    DictionaryObject.get_inherited = patched_get_inherited


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Cách dùng: fill_fillable_fields.py [tệp pdf đầu vào] [tệp field_values.json] [tệp pdf đầu ra]")
        sys.exit(1)
    monkeypatch_pydpf_method()
    input_pdf = sys.argv[1]
    fields_json = sys.argv[2]
    output_pdf = sys.argv[3]
    fill_pdf_fields(input_pdf, fields_json, output_pdf)
