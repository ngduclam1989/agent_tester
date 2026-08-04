import os
import sys

from pdf2image import convert_from_path


def convert(pdf_path, output_dir, max_dim=1000):
    images = convert_from_path(pdf_path, dpi=200)

    for i, image in enumerate(images):
        width, height = image.size
        if width > max_dim or height > max_dim:
            scale_factor = min(max_dim / width, max_dim / height)
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            image = image.resize((new_width, new_height))
        
        image_path = os.path.join(output_dir, f"page_{i+1}.png")
        image.save(image_path)
        print(f"Đã lưu trang {i+1} thành {image_path} (kích thước: {image.size})")

    print(f"Đã chuyển đổi {len(images)} trang sang định dạng ảnh PNG")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Cách dùng: convert_pdf_to_images.py [tệp pdf đầu vào] [thư mục đầu ra]")
        sys.exit(1)
    pdf_path = sys.argv[1]
    output_directory = sys.argv[2]
    convert(pdf_path, output_directory)
