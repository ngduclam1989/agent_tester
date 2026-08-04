---
name: fireworks-tech-graph
description: >-
  Sử dụng khi người dùng muốn tạo bất kỳ sơ đồ kỹ thuật nào - kiến trúc, luồng dữ liệu, lưu đồ, tuần tự, agent/bộ nhớ hoặc sơ đồ khái niệm - và xuất ra định dạng SVG+PNG. Kích hoạt khi có từ khóa: "vẽ sơ đồ" "vẽ hình" "tạo biểu đồ" "sơ đồ kiến trúc" "sơ đồ luồng" "vẽ quy trình" "xuất sơ đồ" "generate diagram" "draw diagram" "visualize" hoặc bất kỳ mô tả hệ thống/quy trình nào người dùng muốn minh họa.
---

# Sơ đồ kỹ thuật Fireworks (Fireworks Tech Graph)

Tạo sơ đồ kỹ thuật SVG chất lượng cao và xuất ra định dạng PNG thông qua `rsvg-convert`.

## Nguồn cài đặt

Cài đặt kỹ năng này từ GitHub:

```bash
npx skills add yizhiyanhua-ai/fireworks-tech-graph
```

Trang gói công khai:

```text
https://www.npmjs.com/package/@yizhiyanhua-ai/fireworks-tech-graph
```

Không truyền trực tiếp `@yizhiyanhua-ai/fireworks-tech-graph` vào lệnh `skills add`, vì giao diện dòng lệnh (CLI) yêu cầu một nguồn kho lưu trữ GitHub hoặc local.

Lệnh cập nhật:

```bash
npx skills add yizhiyanhua-ai/fireworks-tech-graph --force -g -y
```

## Các tập lệnh hỗ trợ (Khuyến nghị)

Bốn tập lệnh hỗ trợ trong thư mục `scripts/` cung cấp khả năng sinh và xác thực SVG ổn định:

### 1. `generate-diagram.sh` - Xác thực SVG + xuất PNG
```bash
./scripts/generate-diagram.sh -t architecture -s 1 -o ./output/arch.svg
```
- Xác thực tệp SVG hiện có
- Xuất tệp PNG sau khi xác thực
- Ví dụ: `./scripts/generate-diagram.sh -t architecture -s 1 -o ./output/arch.svg`

### 2. `generate-from-template.py` - Tạo sơ đồ SVG ban đầu từ bản mẫu (template)
```bash
python3 ./scripts/generate-from-template.py architecture ./output/arch.svg '{"title":"My Diagram","nodes":[],"arrows":[]}'
```
- Tải một template SVG tích hợp sẵn
- Kết xuất (render) các node, arrow và phần chú giải từ đầu vào JSON
- Bảo toàn ký tự (escape) nội dung văn bản để đảm bảo đầu ra XML hợp lệ

### 3. `validate-svg.sh` - Xác thực cú pháp SVG
```bash
./scripts/validate-svg.sh <svg-file>
```
- Kiểm tra cú pháp XML
- Xác minh sự cân bằng của các thẻ
- Xác thực các tham chiếu marker
- Kiểm tra tính đầy đủ của các thuộc tính
- Xác thực dữ liệu đường dẫn (path data)

### 4. `test-all-styles.sh` - Kiểm thử hàng loạt tất cả các style
```bash
./scripts/test-all-styles.sh
```
- Kiểm thử nhiều kích thước sơ đồ
- Xác thực tất cả các SVG đã sinh ra
- Tạo báo cáo kiểm thử

**Khi nào nên sử dụng tập lệnh:**
- Sử dụng tập lệnh khi tạo các SVG phức tạp để tránh lỗi cú pháp
- Tập lệnh cung cấp khả năng xác thực tự động và báo cáo lỗi
- Khuyến nghị cho các sơ đồ môi trường production

**Khi nào nên tạo trực tiếp SVG:**
- Sơ đồ đơn giản với ít phần tử
- Bản mẫu (prototype) nhanh
- Khi bạn cần kiểm soát hoàn toàn cấu trúc SVG

## Quy trình làm việc (Luôn tuân theo thứ tự này)

1. **Phân loại** loại sơ đồ (xem Các loại sơ đồ bên dưới)
2. **Trích xuất cấu trúc** — xác định các lớp (layers), nút (nodes), cạnh (edges), luồng (flows) và nhóm ngữ nghĩa từ mô tả của người dùng
3. **Lên kế hoạch bố cục** (layout) — áp dụng các quy tắc bố cục cho loại sơ đồ đó
4. **Tải tham chiếu style** — luôn tải `references/style-1-flat-icon.md` trừ khi người dùng chỉ định loại khác; tải tệp `references/style-N.md` tương ứng để lấy các token màu sắc và mẫu SVG chính xác
5. **Ánh xạ các node với hình dạng** — sử dụng Từ vựng hình dạng bên dưới
6. **Kiểm tra nhu cầu biểu tượng** — tải `references/icons.md` cho các sản phẩm đã biết
7. **Viết SVG** với chiến lược thích ứng (xem Chiến lược tạo SVG bên dưới)
8. **Xác thực**: Chạy `rsvg-convert file.svg -o /dev/null 2>&1` để kiểm tra cú pháp
9. **Xuất PNG**: `rsvg-convert -w 1920 file.svg -o file.png`
10. **Báo cáo** đường dẫn của các tệp đã tạo

## Các loại sơ đồ & Quy tắc bố cục

### Sơ đồ kiến trúc (Architecture Diagram)
Nút = dịch vụ/thành phần. Nhóm thành các **lớp nằm ngang** (trên→dưới hoặc trái→phải).
- Các lớp điển hình: Client → Gateway/LB → Services → Data/Storage
- Sử dụng các container `<rect>` nét đứt để nhóm các dịch vụ liên quan trong cùng một lớp
- Hướng mũi tên đi theo luồng dữ liệu/yêu cầu
- ViewBox: tiêu chuẩn `0 0 960 600`, hoặc `0 0 960 800` cho các cấu trúc cao

### Sơ đồ luồng dữ liệu (Data Flow Diagram)
Nhấn mạnh **dữ liệu nào di chuyển đi đâu**. Tập trung vào sự biến đổi dữ liệu.
- Gắn nhãn cho mọi mũi tên với kiểu dữ liệu (ví dụ: "embeddings", "query", "context")
- Sử dụng mũi tên rộng hơn (`stroke-width: 2.5`) cho các đường dẫn dữ liệu chính
- Mũi tên nét đứt cho luồng điều khiển/kích hoạt
- Tô màu các mũi tên theo phân loại dữ liệu (không chỉ Agent/RAG — sử dụng ngữ nghĩa)

### Sơ đồ quy trình / Lưu đồ (Flowchart / Process Flow)
Các bước quy trình/quyết định tuần tự.
- Ưu tiên từ trên xuống dưới; từ trái sang phải cho các luồng rộng
- Hình thoi cho các quyết định, hình chữ nhật bo góc cho các quy trình, hình bình hành cho I/O
- Giữ nhãn nút ngắn (≤3 từ); đặt chi tiết trong nhãn phụ
- Căn chỉnh các nút trên lưới: tọa độ x snap theo khoảng cách 120px, y theo 80px

### Sơ đồ kiến trúc Agent (Agent Architecture Diagram)
Hiển thị cách một AI agent suy luận, sử dụng công cụ và quản lý bộ nhớ.
Các lớp khái niệm quan trọng luôn cần xem xét:
- **Lớp đầu vào (Input layer)**: Người dùng, truy vấn, kích hoạt
- **Lớp lõi Agent (Agent core)**: LLM, vòng lặp suy luận, bộ lập kế hoạch
- **Lớp bộ nhớ (Memory layer)**: Ngắn hạn (context window), Dài hạn (vector/graph DB), Bộ nhớ sự kiện (Episodic)
- **Lớp công cụ (Tool layer)**: Các cuộc gọi công cụ, API, tìm kiếm, thực thi mã
- **Lớp đầu ra (Output layer)**: Phản hồi, hành động, tác dụng phụ
Sử dụng mũi tên vòng (loop arcs) để hiển thị suy luận lặp lại. Phân tách trực quan các loại bộ nhớ.

### Sơ đồ kiến trúc bộ nhớ (Memory Architecture Diagram)
Sơ đồ agent chuyên dụng tập trung vào các thao tác bộ nhớ (như kiểu Mem0, MemGPT).
- Hiển thị riêng biệt **đường ghi bộ nhớ** (write path) và **đường đọc bộ nhớ** (read path) (màu mũi tên khác nhau)
- Các tầng bộ nhớ: Working Memory → Short-term → Long-term → External Store
- Gắn nhãn các thao tác bộ nhớ: `store()`, `retrieve()`, `forget()`, `consolidate()`
- Sử dụng các hình chữ nhật xếp chồng hoặc hình trụ nhiều lớp cho các tầng lưu trữ

### Sơ đồ tuần tự (Sequence Diagram)
Trao đổi thông điệp theo trình tự thời gian giữa các đối tượng tham gia.
- Các đối tượng tham gia dưới dạng các **lifeline** dọc (nhãn ở trên + đường nét đứt dọc)
- Thông điệp dưới dạng các mũi tên ngang giữa các lifeline, thứ tự thời gian từ trên xuống dưới
- Các hộp kích hoạt (hình chữ nhật mỏng được tô màu trên lifeline) hiển thị xử lý đang hoạt động
- Nhóm bằng các khung vòng lặp `<rect>` loop/alt với nhãn ở góc trên bên trái
- Chiều cao ViewBox = 80 + (số_thông_điệp × 50)

### Ma trận so sánh / tính năng (Comparison / Feature Matrix)
So sánh song song các cách tiếp cận, hệ thống hoặc thành phần.
- Tiêu đề cột = hệ thống, tiêu đề hàng = thuộc tính
- Chiều cao hàng: 40px; chiều rộng cột: tối thiểu 120px; chiều cao hàng tiêu đề: 50px
- Ô được chọn: nền nhạt (ví dụ: `#dcfce7`) + dấu tích `✓`; không hỗ trợ: nền `#f9fafb`
- Màu nền hàng xen kẽ (`#f9fafb` / `#ffffff`) để dễ đọc
- Số cột tối đa dễ đọc: 5; vượt quá mức đó, hãy chia thành hai sơ đồ

### Dòng thời gian / Biểu đồ Gantt (Timeline / Gantt)
Trục thời gian nằm ngang hiển thị thời gian, các giai đoạn và cột mốc.
- Trục X = thời gian (tuần/tháng/quý); Trục Y = các hạng mục/nhiệm vụ/giai đoạn
- Thanh tiến độ: hình chữ nhật bo góc, được tô màu theo danh mục, gắn nhãn bên trong hoặc bên cạnh
- Điểm mốc: hình thoi hoặc hình tròn tô kín tại vị trí x cụ thể với nhãn phía trên
- ViewBox: điển hình `0 0 960 400`; rộng hơn cho nhiều khoảng thời gian: `0 0 1200 400`

### Sơ đồ tư duy / Sơ đồ khái niệm (Mind Map / Concept Map)
Bố cục tỏa tròn từ khái niệm trung tâm.
- Nút trung tâm tại `cx=480, cy=280`
- Các nhánh cấp một: phân bố đều xung quanh trung tâm (360/N độ)
- Các nhánh cấp hai: phân nhánh từ cấp một với góc lệch 30-45°
- Sử dụng đường cong `<path>` với bezier bậc ba cho các nhánh, không dùng đường thẳng

### Sơ đồ lớp (Class Diagram - UML)
Cấu trúc tĩnh hiển thị các lớp, thuộc tính, phương thức và các mối quan hệ.
- **Hộp lớp (Class box)**: Hình chữ nhật gồm 3 ngăn (tên / thuộc tính / phương thức), chiều rộng tối thiểu 160px
  - Ngăn trên: tên lớp, in đậm, căn giữa (trừu tượng = *in nghiêng*)
  - Ngăn giữa: thuộc tính với phạm vi truy cập (`+` public, `-` private, `#` protected)
  - Ngăn dưới: chữ ký phương thức, cùng ký hiệu phạm vi truy cập
- **Mối quan hệ**:
  - Kế thừa (extends): đường liền nét + đầu mũi tên tam giác rỗng, con → cha
  - Hiện thực hóa (interface): đường nét đứt + tam giác rỗng, lớp → interface
  - Liên kết (Association): đường liền nét + đầu mũi tên mở, gắn nhãn với bội số (1, 0..*, 1..*)
  - Thu gom (Aggregation): đường liền nét + hình thoi rỗng ở phía lớp chứa
  - Thành phần (Composition): đường liền nét + hình thoi đặc ở phía lớp chứa
  - Phụ thuộc (Dependency): đường nét đứt + đầu mũi tên mở
- **Interface**: stereotype `<<interface>>` phía trên tên, hoặc ký hiệu hình tròn/kẹo mút
- **Enum**: hình chữ nhật các ngăn với stereotype `<<enumeration>>`, các giá trị ở phía dưới
- Bố cục: lớp cha ở trên, lớp con ở dưới; các interface ở bên trái/phải của các lớp thực thi
- ViewBox: tiêu chuẩn `0 0 960 600`; hoặc `0 0 960 800` cho cấu trúc phân cấp sâu

### Sơ đồ ca sử dụng (Use Case Diagram - UML)
Chức năng hệ thống từ góc nhìn của người dùng.
- **Tác nhân (Actor)**: hình người que (đầu hình tròn + thân đường thẳng) đặt bên ngoài biên hệ thống
  - Nhãn dưới hình vẽ, kích thước 13-14px
  - Tác nhân chính bên trái, tác nhân phụ/hỗ trợ bên phải
- **Ca sử dụng (Use case)**: hình elip với nhãn căn giữa bên trong, tối thiểu 140×60px
  - Đặt tên là cụm động từ: "Create Order", "Process Payment"
- **Ranh giới hệ thống (System boundary)**: hình chữ nhật lớn nét đứt + tên hệ thống ở góc trên bên trái
- **Mối quan hệ**:
  - Include: mũi tên nét đứt `<<include>>` từ ca sử dụng cơ sở sang ca sử dụng được bao gồm
  - Extend: mũi tên nét đứt `<<extend>>` từ ca sử dụng mở rộng sang ca sử dụng cơ sở
  - Tổng quát hóa: đường liền nét + tam giác rỗng (đặc thù → tổng quát)
- Bố cục: ranh giới hệ thống căn giữa, tác nhân ở ngoài, ca sử dụng ở trong
- ViewBox: tiêu chuẩn `0 0 960 600`

### Sơ đồ trạng thái (State Machine Diagram - UML)
Vòng đời trạng thái và các sự kiện chuyển đổi của một thực thể.
- **Trạng thái (State)**: hình chữ nhật bo góc với tên trạng thái, tối thiểu 120×50px
  - Hoạt động nội bộ: văn bản nhỏ `entry/ hành động`, `exit/ hành động`, `do/ hoạt động`
  - **Trạng thái khởi đầu**: hình tròn đen tô kín (r=8), một mũi tên đi ra
  - **Trạng thái kết thúc**: hình tròn tô kín (r=8) bên trong hình tròn rỗng (r=12)
  - **Lựa chọn (Choice)**: hình thoi rỗng nhỏ, nhãn điều kiện trên các mũi tên đi ra `[điều kiện]`
- **Chuyển đổi (Transition)**: mũi tên với nhãn tùy chọn `sự kiện [điều kiện] / hành động`
  - Các điều kiện bảo vệ trong dấu ngoặc vuông
  - Các hành động sau dấu `/`
- **Trạng thái composite/lồng nhau**: hình chữ nhật lớn hơn chứa các trạng thái con, với tab tên
- **Fork/join**: thanh ngang hoặc dọc màu đen dày (đồng bộ hóa)
- Bố cục: trạng thái bắt đầu ở góc trên bên trái, trạng thái kết thúc ở góc dưới bên phải, luồng từ trên xuống dưới
- ViewBox: tiêu chuẩn `0 0 960 600`

### Sơ đồ quan hệ thực thể (ER Diagram - Entity-Relationship)
Lược đồ cơ sở dữ liệu và các mối quan hệ dữ liệu.
- **Thực thể (Entity)**: hình chữ nhật với tên thực thể trong tiêu đề (in đậm), các thuộc tính bên dưới
  - Thuộc tính khóa chính: gạch chân
  - Khóa ngoại: in nghiêng hoặc ký hiệu với (FK)
  - Chiều rộng tối thiểu: 160px; kích thước phông chữ thuộc tính: 12px
- **Mối quan hệ**: hình thoi trên đường kết nối
  - Nhãn bên trong hình thoi: "has", "belongs to", "enrolls in"
  - Nhãn bội số gần thực thể: `1`, `N`, `0..1`, `0..*`, `1..*`
- **Thực thể yếu**: hình chữ nhật viền kép với mối quan hệ hình thoi kép
- **Thực thể liên kết**: lai giữa hình thoi + hình chữ nhật (hình chữ nhật có hình thoi bên trong)
- Kiểu đường kẻ: nét liền cho các quan hệ định danh, nét đứt cho các quan hệ không định danh
- Bố cục: các thực thể xếp thành 2-3 hàng, các mối quan hệ nằm giữa các thực thể liên quan
- ViewBox: tiêu chuẩn `0 0 960 600`; hoặc rộng hơn `0 0 1200 600` cho nhiều thực thể

### Sơ đồ cấu trúc mạng (Network Topology)
Cơ sở hạ tầng mạng vật lý hoặc logic.
- **Thiết bị**: hình chữ nhật hoặc hình chữ nhật bo góc dạng icon
  - Router: hình tròn có các mũi tên chéo
  - Switch: hình chữ nhật có lưới mũi tên
  - Server: hình chữ nhật xếp chồng (icon rack)
  - Firewall: hình chữ nhật họa tiết gạch hoặc hình cái khiên
  - Load Balancer: hình chữ nhật chia đôi nằm ngang có mũi tên
  - Cloud: đường dẫn đám mây (các cung tròn chồng lên nhau)
- **Kết nối**: các đường thẳng nối giữa các tâm thiết bị
  - Ethernet/có dây: đường liền nét, gắn nhãn băng thông
  - Không dây: đường nét đứt có biểu tượng WiFi
  - VPN: đường nét đứt có biểu tượng ổ khóa
- **Mạng con/Phân vùng (Subnets/Zones)**: các container hình chữ nhật nét đứt có nhãn phân vùng (DMZ, Internal, External)
- **Nhãn**: hostname thiết bị + IP bên dưới, kích thước 12-13px
- Bố cục: phân tầng từ trên xuống dưới (Internet → Edge → Core → Access → Endpoints)
- ViewBox: tiêu chuẩn `0 0 960 600`

## Bản đồ bao phủ UML

Bản đồ đầy đủ của 14 loại sơ đồ UML sang các loại sơ đồ được hỗ trợ:

| Sơ đồ UML | Được hỗ trợ dưới dạng | Lưu ý |
|-------------|-------------|-------|
| Class | Sơ đồ lớp (Class Diagram) | Ký hiệu UML đầy đủ |
| Component | Sơ đồ kiến trúc | Sử dụng màu tô cho mỗi loại thành phần |
| Deployment | Sơ đồ kiến trúc | Thêm nhãn nút/instance |
| Package | Sơ đồ kiến trúc | Sử dụng các container nhóm nét đứt |
| Composite Structure | Sơ đồ kiến trúc | Các hình chữ nhật lồng nhau trong các thành phần |
| Object | Sơ đồ lớp | Các hộp instance với tên được gạch chân |
| Use Case | Sơ đồ ca sử dụng | Đầy đủ tác nhân/elip/mối quan hệ |
| Activity | Sơ đồ quy trình / Lưu đồ | Thêm các thanh fork/join |
| State Machine | Sơ đồ trạng thái | Ký hiệu UML đầy đủ |
| Sequence | Sơ đồ tuần tự | Thêm các khung alt/opt/loop |
| Communication | — | Xấp xỉ bằng sơ đồ tuần tự (hoán đổi trục) |
| Timing | Dòng thời gian | Thích ứng trục thời gian |
| Interaction Overview | Sơ đồ quy trình | Kết hợp các đoạn hoạt động + tuần tự |
| ER Diagram | Sơ đồ ER | Ký hiệu Chen/Crow's foot |

## Từ vựng hình dạng

Ánh xạ các khái niệm ngữ nghĩa sang các hình dạng nhất quán trên tất cả các loại sơ đồ:

| Khái niệm | Hình dạng | Lưu ý |
|---------|-------|-------|
| User / Người dùng | Hình tròn + đường dẫn thân | Hình người que hoặc avatar |
| LLM / Mô hình | Hình chữ nhật bo góc với biểu tượng não/tia sét hoặc màu tô gradient | Sử dụng màu nhấn nổi bật |
| Agent / Điều phối | Hình lục giác hoặc hình chữ nhật bo góc có viền kép | Báo hiệu "bộ điều khiển hoạt động" |
| Bộ nhớ (ngắn hạn) | Hình chữ nhật bo góc viền nét đứt | Tạm thời = nét đứt |
| Bộ nhớ (dài hạn) | Hình trụ (hình dạng cơ sở dữ liệu) | Bền vững = hình trụ nét liền |
| Vector Store | Hình trụ có các đường lưới bên trong | Thêm 3 đường ngang |
| Graph DB | Cụm hình tròn (3 hình tròn chồng lên nhau) | |
| Công cụ / Hàm | Hình chữ nhật dạng bánh răng hoặc có icon cờ lê | |
| API / Gateway | Hình lục giác (viền đơn) | |
| Hàng đợi / Stream | Ống nằm ngang (dạng đường ống) | |
| Tệp / Tài liệu | Hình chữ nhật gấp góc | |
| Browser / Giao diện | Hình chữ nhật có thanh tiêu đề 3 chấm | |
| Quyết định | Hình thoi | Chỉ dành cho lưu đồ (flowcharts) |
| Quy trình / Bước | Hình chữ nhật bo góc | Hộp tiêu chuẩn |
| Dịch vụ bên ngoài | Hình chữ nhật có biểu tượng đám mây hoặc viền nét đứt | |
| Dữ liệu / Hiện vật | Hình bình hành | I/O trong lưu đồ |

## Ngữ nghĩa của mũi tên

Luôn gán ý nghĩa cho mũi tên, không chỉ dùng màu sắc thông thường:

| Loại luồng | Màu sắc | Đường nét | Nét đứt | Ý nghĩa |
|-----------|-------|--------|------|---------|
| Luồng dữ liệu chính | Xanh lam `#2563eb` | Nét liền 2px | Không | Đường dẫn yêu cầu/phản hồi chính |
| Điều khiển / Kích hoạt | Cam `#ea580c` | Nét liền 1.5px | Không | Một hệ thống kích hoạt hệ thống khác |
| Đọc bộ nhớ | Xanh lá `#059669` | Nét liền 1.5px | Không | Lấy dữ liệu từ kho lưu trữ |
| Ghi bộ nhớ | Xanh lá `#059669` | 1.5px | `5,3` | Thao tác ghi/lưu trữ |
| Bất đồng bộ / Sự kiện | Xám `#6b7280` | 1.5px | `4,2` | Không chặn (non-blocking), hướng sự kiện |
| Embedding / Chuyển đổi | Tím `#7c3aed` | Nét liền 1px | Không | Biến đổi dữ liệu |
| Phản hồi / Vòng lặp | Tím `#7c3aed` | Cong 1.5px | Không | Vòng lặp suy luận lặp đi lặp lại |

Luôn bao gồm một **phần chú giải** (legend) khi sử dụng từ 2 loại mũi tên trở lên.

## Quy tắc bố cục & Xác thực

**Khoảng cách**:
- Các nút cùng lớp: 80px theo chiều ngang, 120px theo chiều dọc giữa các lớp
- Lề canvas: Tối thiểu 40px, 60px giữa các cạnh nút
- Căn chỉnh lưới 8px: Snap theo khoảng cách ngang 120px, khoảng cách dọc 120px

**Nhãn mũi tên** (QUAN TRỌNG):
- BẮT BUỘC phải có hình chữ nhật nền: `<rect fill="canvas_bg" opacity="0.95"/>` với khoảng đệm ngang 4px, dọc 2px
- Đặt ở giữa mũi tên, ≤3 từ, xếp so le 15-20px khi nhiều mũi tên hội tụ
- Duy trì khoảng cách an toàn 10px với các nút

**Định tuyến mũi tên**:
- Ưu tiên đường đi trực giao (chữ L) để giảm thiểu giao cắt
- Neo các mũi tên trên các cạnh thành phần, không neo ở tâm hình học
- Định tuyến đi vòng qua các cụm nút dày đặc, sử dụng các độ lệch y khác nhau cho các mũi tên song song
- Các vòng cung nhảy qua (bán kính 5px) cho các giao cắt không thể tránh khỏi

**Ngăn ngừa trùng lặp đường thẳng** (QUAN TRỌNG - lỗi phổ biến nhất):
Khi hai mũi tên phải cắt nhau, LUÔN LUÔN sử dụng các cung nhảy qua (jump-over arcs) để tránh giao cắt trực quan:
- Cắt mũi tên ngang: thêm một cung bán nguyệt nhỏ (bán kính 5px, nét vẽ cùng màu với mũi tên, không màu tô) "nhảy qua" đường thẳng kia
- Mẫu SVG cho cung nhảy qua: sử dụng một cung màu trắng/trùng màu nền ở lớp dưới, sau đó vẽ cung phía trên lên trên cùng
- Nhiều giao cắt: xếp so le bán kính cung (5px, 7px, 9px) để các cung không chồng lên nhau
- Không bao giờ để hai đoạn thẳng của mũi tên cắt nhau mà không có cung nhảy qua

**Danh sách xác thực** (chạy trước khi hoàn tất):
1. **Va chạm Mũi tên - Thành phần**: Mũi tên KHÔNG ĐƯỢC đi qua bên trong các thành phần (định tuyến đi vòng qua bằng các đường đi trực giao)
2. **Tràn văn bản**: Tất cả văn bản BẮT BUỘC phải vừa vặn với khoảng đệm 8px (ước tính: `text.length × 7px ≤ shape_width - 16px`)
3. **Căn chỉnh Mũi tên - Văn bản**: Các điểm đầu cuối của mũi tên BẮT BUỘC phải kết nối với các cạnh hình dạng (không bay lơ lửng); tất cả các nhãn mũi tên BẮT BUỘC phải có hình chữ nhật nền
4. **Kỷ luật Container**: Ưu tiên mũi tên đi vào và đi ra khỏi các container phần thông qua các khoảng trống mở giữa các thành phần, không đi qua thân thành phần bên trong

## Quy tắc kỹ thuật SVG

- ViewBox: mặc định `0 0 960 600`; cao `0 0 960 800`; rộng `0 0 1200 600`
- Phông chữ: nhúng qua `<style>font-family: ...</style>` — không sử dụng `@import` bên ngoài (làm hỏng rsvg-convert)
- `<defs>`: marker mũi tên, gradient, filter, clip path
- Văn bản: tối thiểu 12px, ưu tiên nhãn 13-14px, nhãn phụ 11px, tiêu đề 16-18px
- Tất cả các mũi tên: `<marker>` với `markerEnd`, kích thước `markerWidth="10" markerHeight="7"`
- Đổ bóng (drop shadows): `<feDropShadow>` trong `<filter>`, áp dụng hạn chế (chỉ các nút chính)
- Đường cong: sử dụng `M x1,y1 C cx1,cy1 cx2,cy2 x2,y2` bezier bậc ba cho các vòng lặp/mũi tên phản hồi
- Cắt nội dung: sử dụng `<clipPath>` nếu văn bản có thể tràn ra ngoài hộp nút

## Sinh SVG & Ngăn ngừa lỗi

**BẮT BUỘC: Phương pháp Python List** (LUÔN LUÔN sử dụng phương pháp này):
```python
python3 << 'EOF'
lines = []
lines.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 700">')
lines.append('  <defs>')
# ... từng dòng độc lập
lines.append('</svg>')

with open('/path/to/output.svg', 'w') as f:
    f.write('\n'.join(lines))
print("SVG generated successfully")
EOF
```

**Tại sao bắt buộc**: Ngăn chặn việc cắt bớt ký tự, lỗi chính tả và lỗi cú pháp. Mỗi dòng độc lập và dễ xác minh.

**Danh sách kiểm tra trước khi gọi công cụ** (QUAN TRỌNG - sử dụng MỌI LÚC):
1. ✅ Tôi có thể viết ra lệnh/nội dung HOÀN CHỈNH ngay bây giờ không?
2. ✅ Tôi đã chuẩn bị sẵn TẤT CẢ các tham số bắt buộc chưa?
3. ✅ Tôi đã kiểm tra lỗi cú pháp trong nội dung đã chuẩn bị chưa?

**Nếu BẤT KỲ câu trả lời nào là KHÔNG**: DỪNG LẠI. KHÔNG gọi công cụ. Hãy chuẩn bị nội dung trước.

**Giao thức khôi phục lỗi**:
- **Lỗi đầu tiên**: Phân tích nguyên nhân gốc rễ, áp dụng sửa lỗi mục tiêu
- **Lỗi thứ hai**: Chuyển hoàn toàn phương pháp (Python list → sinh theo khối)
- **Lỗi thứ ba**: DỪNG LẠI và báo cáo cho người dùng - KHÔNG lặp vô tận
- **Không bao giờ**: Thử lại cùng một lệnh không thành công hoặc gọi các công cụ với các tham số trống

**Xác thực** (chạy sau khi sinh):
```bash
rsvg-convert file.svg -o /tmp/test.png 2>&1 && echo "✓ Valid" && rm /tmp/test.png
```

**Nếu sử dụng `generate-from-template.py`**:
- Ưu tiên các ID nút `source` / `target` trong JSON mũi tên để bộ sinh có thể snap vào các cạnh nút
- Giữ `x1,y1,x2,y2` làm gợi ý hoặc tọa độ dự phòng, không phải là nguyên mẫu định tuyến chính
- Để bộ sinh tự chọn các tuyến trực giao; tránh code cứng các đường thẳng từ tâm đến tâm trừ khi đường dẫn được đảm bảo thông thoáng

**Các lỗi cú pháp phổ biến cần tránh**:
- ❌ `yt-anchor` → ✅ `y="60" text-anchor="middle"`
- ❌ `x="390` (thiếu y) → ✅ `x="390" y="250"`
- ❌ `fill=#fff` → ✅ `fill="#ffffff"`
- ❌ `marker-end=` → ✅ `marker-end="url(#arrow)"`
- ❌ `L 29450` → ✅ `L 290,220`
- ❌ Thiếu `</svg>` ở cuối

## Đầu ra

- **Mặc định**: `./[derived-name].svg` và `./[derived-name].png` trong thư mục hiện tại
- **Tùy chỉnh**: người dùng chỉ định đường dẫn với `--output /path/` hoặc `xuất ra /path/`
- **Xuất PNG**: `rsvg-convert -w 1920 file.svg -o file.png` (1920px = 2x retina)

## ADLC Testing integration note

Khi skill này được gọi từ `rbt_manual_testing` trong FULL RBT Bước 2/Bước 3, không được thay thế
graph chính thức bằng Mermaid/text inline. Agent phải:

1. Nêu rõ diagram type đã chọn và lý do chọn.
2. Dùng style mặc định `style-1-flat-icon` nếu user không chỉ định style khác.
3. Tạo artifact SVG bằng template/script hoặc SVG trực tiếp theo quy tắc của skill.
4. Validate SVG. Ưu tiên `rsvg-convert`; nếu thiếu renderer trong môi trường thì phải báo rõ
   degraded validation/export status.
5. Xuất PNG khi renderer khả dụng. Nếu không xuất được PNG, checkpoint phải ghi rõ chỉ có SVG.
6. Báo cáo đường dẫn artifact trong checkpoint để các bước RBT sau có thể trace node/edge coverage.
7. Bắt buộc áp dụng readability gate trước khi bàn giao:
   - Với process flow/user flow/cross-boundary flow, ưu tiên swimlane hoặc bố cục hàng-cột cố định.
   - Luồng chính phải đi trái-sang-phải hoặc trên-xuống-dưới nhất quán; nhánh lỗi/empty/fail-closed
     gom về lane/cột riêng.
   - Hạn chế tối đa đường chéo và giao cắt; mũi tên không được đi xuyên qua node/container.
   - Nhãn mũi tên phải có nền riêng và không chồng lên node/text khác.
   - Nếu artifact khó đọc hoặc "lung tung", agent phải vẽ lại trước khi báo hoàn thành.

---

## Quy ước đường dẫn xuất cho testing repo Garage

Khi skill được gọi trong `garage-agentic-testing`, output SVG + PNG PHẢI đi vào 1 trong 2 folder cố định (KHÔNG được xuất ra thư mục hiện tại `./`):

| Bối cảnh | Folder | Ví dụ |
|---|---|---|
| Sơ đồ sinh từ RGR checkpoint (`/grill-me-qa` RGR mode) — trace ngược về finding | `Execution/tracking/rgr-diagrams/W{NN}/<tên>.svg` | `Execution/tracking/rgr-diagrams/W04/accounting-period-state-machine.svg` |
| Sơ đồ chung của wave (không trace 1 finding cụ thể) | `Execution/tracking/wave-diagrams/W{NN}/<tên>.svg` | `Execution/tracking/wave-diagrams/W04/w04-use-case.svg` |

File PNG (nếu xuất được) đi cùng thư mục với SVG, cùng tên khác đuôi (`.svg` → `.png`).

Tên file dùng kebab-case, tiếng Anh, không dấu, ngắn gọn mô tả nội dung.

## Bảng gợi ý loại sơ đồ theo Issue Type của RGR finding

Khi finding từ `/grill-me-qa` RGR mode có Issue Type nhất định, đề xuất loại sơ đồ trực quan hoá:

| Issue Type (từ finding) | Loại sơ đồ đề xuất | Khi nào dùng |
|---|---|---|
| `State` | Máy trạng thái (State Machine — UML) | Khi finding về chuyển trạng thái, vòng đời thực thể, terminal state |
| `Concurrency` | Sơ đồ tuần tự (Sequence Diagram — UML) | Khi finding về điều kiện đua, giao dịch song song, idempotency |
| `Coverage-Gap` (cấu trúc thực thể) | Sơ đồ quan hệ thực thể (ER Diagram) | Khi finding về cấu trúc bảng, foreign key, phân cấp thực thể |
| `Cross-artifact` (luồng dữ liệu) | Sơ đồ luồng dữ liệu (Data Flow Diagram) | Khi finding về sync giữa 2+ boundary, API contract match |
| `Ambiguity` (ranh giới hệ thống) | Sơ đồ ca sử dụng (Use Case Diagram — UML) | Khi finding về vai trò, quyền, phạm vi tương tác |
| `Missing-dependency` (thành phần) | Sơ đồ thành phần (Component Diagram — UML) | Khi finding về phụ thuộc mô-đun, biên giới |
| `UX` | Lưu đồ (Flowchart) hoặc Sơ đồ hoạt động (Activity Diagram) | Khi finding về luồng người dùng, quyết định UX |
| `Edge` / `Exception` | Sơ đồ tuần tự với các đoạn `alt` / `opt` | Khi finding về nhánh biên, exception path |
| `Security` | Sơ đồ luồng dữ liệu với swimlane theo trust boundary | Khi finding về authz, PII, sensitive data flow |
| `Accessibility` | KHÔNG cần sơ đồ | A11y không có ngữ nghĩa cấu trúc — chuyển sang wireframe/mockup nếu cần |

## Metadata comment BẮT BUỘC ở đầu SVG

MỌI file SVG sinh trong testing repo PHẢI có đoạn ghi chú metadata ngay sau thẻ `<svg>` mở, format:

```xml
<!--
  Diagram: <tên tiếng Việt mô tả nội dung>
  Type: <loại sơ đồ — ví dụ State Machine, Sequence, Class, Use Case>
  Wave: W<NN>
  Related findings: <danh sách RR-NNN cách nhau bởi dấu phẩy, hoặc "N/A" nếu không trace tới finding>
  Related FEAT: <danh sách FEAT-XXX>
  Related BR: <danh sách BR-XXX>
  Related ADR: <danh sách ADR-XXX nếu có>
  Style: style-1-flat-icon (mặc định) hoặc <style khác>
  Generated: <ISO timestamp YYYY-MM-DDTHH:MM:SS+07:00>
  Generator: fireworks-tech-graph skill
-->
```

Mọi trường tiếng Việt bên trong metadata comment phải viết tiếng Việt có dấu (đồng bộ với rule ngôn ngữ của `grill-me-qa` RGR mode).

Nếu file SVG không có metadata comment → REJECT, phải sinh lại.

## User checkpoint BẮT BUỘC sau mỗi PACK (không phải mỗi sơ đồ)

Đơn vị checkpoint là **PACK** (nhóm sơ đồ có cùng mức ưu tiên), không phải sơ đồ riêng lẻ. Mặc định, agent vẽ liên tiếp cả pack (không dừng giữa các sơ đồ trong cùng pack) rồi mới checkpoint 1 lần cho cả pack.

**Định nghĩa PACK cho testing repo Garage**:
- Pack P1 (ưu tiên cao nhất): 4 sơ đồ cốt lõi — Sơ đồ lớp phân cấp thực thể chính + Máy trạng thái chính + Sơ đồ tuần tự liên biên giới + Sơ đồ ca sử dụng theo vai trò.
- Pack P2 (bổ sung): 4 sơ đồ — Sơ đồ quan hệ thực thể + Sơ đồ tuần tự giao dịch nguyên tử + Lưu đồ quy trình wave + Sơ đồ tuần tự điều kiện đua.
- Pack P3 (tuỳ chọn): 4 sơ đồ — Sơ đồ thành phần liên biên giới + Máy trạng thái phụ + Sơ đồ luồng dữ liệu + Sơ đồ tuần tự dây chuyền.
- Ngoài ba pack cố định, user có thể yêu cầu pack tuỳ chỉnh (VD "vẽ 3 sơ đồ cho FEAT-X").

**Luồng bắt buộc**:
1. Agent vẽ liên tiếp tất cả sơ đồ trong pack (không có sơ đồ nào bị bỏ giữa).
2. Xuất SVG và PNG (nếu môi trường hỗ trợ) cho từng sơ đồ.
3. Ghi metadata comment ở đầu mỗi tệp SVG.
4. **Chỉ sau khi cả pack xong** → agent PHẢI dừng lại + hỏi user 3 câu checkpoint cho **cả pack**. Format bắt buộc:

```markdown
## Pack vừa vẽ xong: <tên pack, VD P1 · P2 · pack tuỳ chỉnh>

| Số | Loại | Tên sơ đồ | Đường dẫn SVG | Đường dẫn PNG | Finding trace |
|---|---|---|---|---|---|
| 1 | ... | ... | [...](...)  | [...](...) hoặc "chưa xuất được" | RR-NNN, ... |
| 2 | ... | ... | ... | ... | ... |
| ... | ... | ... | ... | ... | ... |

## Câu hỏi cho user (checkpoint pack)

1. Sơ đồ nào trong pack cần CHỈNH SỬA? (nêu tên sơ đồ + chi tiết chỉnh)
2. Nếu OK cả pack → có VẼ TIẾP pack tiếp theo không? (P2 / P3 / pack tuỳ chỉnh)
3. Nếu SAI hoàn toàn sơ đồ nào → nói tên sơ đồ + cấu trúc mong muốn.

⏸ Chờ user trả lời trước khi vẽ pack tiếp theo.
```

**Anti-pattern** — KHÔNG được vi phạm:
- ❌ Vẽ 1 sơ đồ rồi dừng checkpoint (khi user đã chỉ định pack) → **REJECT** — phải vẽ hết pack rồi mới checkpoint.
- ❌ Vẽ liên tiếp nhiều pack (P1 + P2 + P3) không checkpoint giữa hai pack → **REJECT** — mỗi pack có checkpoint riêng.
- ❌ Kết thúc phiên báo "đã vẽ xong pack" mà không hỏi 3 câu checkpoint → **REJECT**.
- ❌ Bỏ qua feedback "chỉnh sửa sơ đồ X" của user và nhảy sang pack mới → **REJECT** (phải sửa sơ đồ X trước khi vẽ pack mới).

**Ngoại lệ 1** — User yêu cầu vẽ ít sơ đồ hơn cả pack (VD "chỉ vẽ 2 sơ đồ trong P1"): agent làm theo yêu cầu, checkpoint sau 2 sơ đồ đó (coi như pack tuỳ chỉnh 2 sơ đồ).

**Ngoại lệ 2** — User yêu cầu vẽ nhiều pack liền (VD "vẽ cả P1 + P2 luôn, chốt 1 lần"): agent làm theo yêu cầu, checkpoint 1 lần cho cả 8 sơ đồ. Ghi chú trong metadata comment của mỗi sơ đồ: `User approved multi-pack batch: <timestamp>`.

**Ngoại lệ 3** — User yêu cầu vẽ 1 sơ đồ riêng lẻ (không thuộc pack): checkpoint sau sơ đồ đó, format checkpoint đơn giản 3 câu (không cần bảng nhiều dòng).

## Các style

| # | Tên | Nền | Tốt nhất cho |
|---|------|-----------|----------|
| 1 | **Flat Icon** *(mặc định)* | Trắng | Blog, tài liệu, bài thuyết trình |
| 2 | **Dark Terminal** | `#0f0f1a` | GitHub, bài viết kỹ thuật |
| 3 | **Blueprint** | `#0a1628` | Tài liệu kiến trúc |
| 4 | **Notion Clean** | Trắng, tối giản | Tài liệu wiki |
| 5 | **Glassmorphism** | Gradient tối | Trang sản phẩm, keynotes |
| 6 | **Claude Official** | Kem ấm `#f8f6f3` | Sơ đồ kiểu Anthropic |
| 7 | **OpenAI Official** | Trắng tinh `#ffffff` | Sơ đồ kiểu OpenAI |

Tải `references/style-N.md` để lấy chính xác các token màu sắc và mẫu SVG.

## Lựa chọn style

**Mặc định**: Style 1 (Flat Icon) cho hầu hết các sơ đồ. Tải `references/style-diagram-matrix.md` để biết các khuyến nghị cụ thể từ style sang loại sơ đồ.

Các mẫu này thường xuất hiện thường xuyên — hãy ghi nhớ:

**RAG Pipeline**: Query → Embed → VectorSearch → Retrieve → Augment → LLM → Response
**Agentic RAG**: thêm vòng lặp Agent với việc sử dụng công cụ giữa Query và LLM
**Agentic Search**: Query → Planner → [Search Tool / Calculator / Code] → Synthesizer → Response
**Mem0 / Memory Layer**: Input → Memory Manager → [Ghi: VectorDB + GraphDB] / [Đọc: Retrieve+Rank] → Context
**Các loại bộ nhớ Agent**: Sensory (raw input) → Working (context window) → Episodic (past interactions) → Semantic (facts) → Procedural (skills)
**Multi-Agent**: Orchestrator → [SubAgent A / SubAgent B / SubAgent C] → Aggregator → Output
**Tool Call Flow**: LLM → Tool Selector → Tool Execution → Result Parser → LLM (vòng lặp)
