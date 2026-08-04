# Tham chiếu Biểu tượng (Icon Reference)

## Quy tắc tương thích với rsvg-convert

**Không bao giờ sử dụng** `@import url()` cho các phông chữ biểu tượng — `rsvg-convert` không tải các tài nguyên bên ngoài qua mạng.
**Luôn sử dụng** tổ hợp trực tiếp (inline) các phần tử SVG như `<path>`, `<circle>`, `<rect>`, `<text>`.
**Phông chữ dự phòng (Font fallback)**: chỉ nhúng font-family trong thẻ `<style>` sử dụng các phông chữ hệ thống.

---

## Các hình dạng ngữ nghĩa chung (Không có thương hiệu — ưu tiên sử dụng)

### Cơ sở dữ liệu / Vector Store (hình trụ)
```xml
<!-- cx=tọa độ x trung tâm, top=tọa độ y trên cùng, w=chiều rộng, h=chiều cao -->
<!-- Điển hình: w=80, h=70 -->
<ellipse cx="cx" cy="top" rx="w/2" ry="w/6" fill="fill" stroke="stroke" stroke-width="1.5"/>
<rect x="cx-w/2" y="top" width="w" height="h" fill="fill" stroke="none"/>
<line x1="cx-w/2" y1="top" x2="cx-w/2" y2="top+h" stroke="stroke" stroke-width="1.5"/>
<line x1="cx+w/2" y1="top" x2="cx+w/2" y2="top+h" stroke="stroke" stroke-width="1.5"/>
<!-- Các vòng tròn lưới bên trong tùy chọn cho Vector Store -->
<ellipse cx="cx" cy="top+h*0.33" rx="w/2" ry="w/6" fill="none" stroke="stroke" stroke-width="0.7" opacity="0.5"/>
<ellipse cx="cx" cy="top+h*0.66" rx="w/2" ry="w/6" fill="none" stroke="stroke" stroke-width="0.7" opacity="0.5"/>
<ellipse cx="cx" cy="top+h" rx="w/2" ry="w/6" fill="fill-dark" stroke="stroke" stroke-width="1.5"/>
```

### Nút LLM / Mô hình (hình chữ nhật bo góc với tia sét)
```xml
<!-- Hình chữ nhật bo góc viền kép = tín hiệu "thông minh" -->
<rect x="x" y="y" width="w" height="h" rx="10" fill="fill" stroke="stroke-outer" stroke-width="2.5"/>
<rect x="x+3" y="y+3" width="w-6" height="h-6" rx="8" fill="none" stroke="stroke-inner" stroke-width="0.8" opacity="0.5"/>
<!-- Biểu tượng tia sét (⚡) dạng văn bản hoặc đường dẫn nhỏ -->
<text x="cx" y="cy-6" text-anchor="middle" font-size="14">⚡</text>
<text x="cx" y="cy+10" text-anchor="middle" fill="text-color" font-size="13" font-weight="600">GPT-4o</text>
```

### Agent / Bộ điều phối (hình lục giác)
```xml
<!-- r = bán kính ngoại tiếp, cx/cy = tâm -->
<!-- Với r=36: các đỉnh tại 36,0  18,31.2  -18,31.2  -36,0  -18,-31.2  18,-31.2 -->
<polygon points="cx,cy-r  cx+r*0.866,cy-r*0.5  cx+r*0.866,cy+r*0.5  cx,cy+r  cx-r*0.866,cy+r*0.5  cx-r*0.866,cy-r*0.5"
         fill="fill" stroke="stroke" stroke-width="1.5"/>
<text x="cx" y="cy+5" text-anchor="middle" fill="text" font-size="12" font-weight="600">Agent</text>
```

### Nút bộ nhớ (ngắn hạn, viền nét đứt)
```xml
<rect x="x" y="y" width="w" height="h" rx="8"
      fill="fill" stroke="stroke" stroke-width="1.5" stroke-dasharray="6,3"/>
<text x="cx" y="cy-6" text-anchor="middle" fill="text" font-size="10" opacity="0.7">MEMORY</text>
<text x="cx" y="cy+8" text-anchor="middle" fill="text" font-size="13">Ngắn hạn</text>
```

### Cuộc gọi Công cụ / Hàm (hình chữ nhật có biểu tượng bánh răng)
```xml
<rect x="x" y="y" width="w" height="h" rx="6" fill="fill" stroke="stroke" stroke-width="1.5"/>
<!-- Bánh răng: ký tự unicode ⚙ hoặc vòng tròn nhỏ có các nét vẽ -->
<text x="cx" y="cy-4" text-anchor="middle" font-size="16">⚙</text>
<text x="cx" y="cy+12" text-anchor="middle" fill="text" font-size="12">Tên công cụ</text>
```

### Hàng đợi / Stream (đường ống nằm ngang)
```xml
<!-- Ống dẫn: elip nắp trái + thân + elip nắp phải -->
<ellipse cx="x1" cy="cy" rx="ry*0.6" ry="ry" fill="fill-dark" stroke="stroke" stroke-width="1.5"/>
<rect x="x1" y="cy-ry" width="x2-x1" height="ry*2" fill="fill" stroke="none"/>
<line x1="x1" y1="cy-ry" x2="x2" y2="cy-ry" stroke="stroke" stroke-width="1.5"/>
<line x1="x1" y1="cy+ry" x2="x2" y2="cy+ry" stroke="stroke" stroke-width="1.5"/>
<ellipse cx="x2" cy="cy" rx="ry*0.6" ry="ry" fill="fill-light" stroke="stroke" stroke-width="1.5"/>
```

### Người dùng / Tác nhân con người
```xml
<!-- Đầu -->
<circle cx="cx" cy="cy-18" r="10" fill="fill" stroke="stroke" stroke-width="1.2"/>
<!-- Thân / Vai -->
<path d="M cx-14,cy+16 Q cx-14,cy-4 cx,cy-4 Q cx+14,cy-4 cx+14,cy+16"
      fill="fill" stroke="stroke" stroke-width="1.2"/>
<text x="cx" y="cy+30" text-anchor="middle" fill="text" font-size="12">Người dùng</text>
```

### API Gateway (hình lục giác, viền đơn, nhỏ hơn)
```xml
<polygon points="cx,cy-28  cx+24,cy-14  cx+24,cy+14  cx,cy+28  cx-24,cy+14  cx-24,cy-14"
         fill="fill" stroke="stroke" stroke-width="1.5"/>
<text x="cx" y="cy+5" text-anchor="middle" fill="text" font-size="11">API</text>
```

### Trình duyệt / Web Client
```xml
<rect x="x" y="y" width="w" height="h" rx="6" fill="fill" stroke="stroke" stroke-width="1.5"/>
<!-- Thanh tiêu đề -->
<rect x="x" y="y" width="w" height="20" rx="6" fill="fill-dark" stroke="none"/>
<rect x="x" y="y+14" width="w" height="6" fill="fill-dark"/>
<!-- Ba nút màu đèn giao thông -->
<circle cx="x+12" cy="y+10" r="4" fill="#ef4444" opacity="0.8"/>
<circle cx="x+24" cy="y+10" r="4" fill="#f59e0b" opacity="0.8"/>
<circle cx="x+36" cy="y+10" r="4" fill="#10b981" opacity="0.8"/>
```

### Tài liệu / Tệp tin
```xml
<!-- Hình chữ nhật gấp góc -->
<path d="M x,y L x+w-12,y L x+w,y+12 L x+w,y+h L x,y+h Z"
      fill="fill" stroke="stroke" stroke-width="1.5"/>
<!-- Nếp gấp -->
<path d="M x+w-12,y L x+w-12,y+12 L x+w,y+12" fill="fill-dark" stroke="stroke" stroke-width="1"/>
<!-- Các dòng kẻ bên trong -->
<line x1="x+8" y1="y+h*0.45" x2="x+w-8" y2="y+h*0.45" stroke="stroke" stroke-width="1" opacity="0.5"/>
<line x1="x+8" y1="y+h*0.6"  x2="x+w-8" y2="y+h*0.6"  stroke="stroke" stroke-width="1" opacity="0.5"/>
<line x1="x+8" y1="y+h*0.75" x2="x+w-16" y2="y+h*0.75" stroke="stroke" stroke-width="1" opacity="0.5"/>
```

### Hình thoi quyết định (lưu đồ)
```xml
<!-- cx/cy = tâm, hw = nửa chiều rộng, hh = nửa chiều cao -->
<polygon points="cx,cy-hh  cx+hw,cy  cx,cy+hh  cx-hw,cy"
         fill="fill" stroke="stroke" stroke-width="1.5"/>
<text x="cx" y="cy+5" text-anchor="middle" fill="text" font-size="12">Điều kiện?</text>
```

### Làn bơi (Swim Lane Container)
```xml
<!-- Nền phân lớp/nhóm -->
<rect x="x" y="y" width="w" height="h" rx="6"
      fill="fill" fill-opacity="0.04" stroke="stroke" stroke-width="1" stroke-dasharray="6,4"/>
<!-- Nhãn lớp ở trên cùng bên trái -->
<text x="x+12" y="y+16" fill="label-color" font-size="10" font-weight="600" letter-spacing="0.06em">TÊN PHÂN LỚP</text>
```

---

## Các biểu tượng sản phẩm (Màu thương hiệu + Inline SVG)

Tất cả sử dụng dạng biểu tượng hình tròn + chữ viết tắt. Thay thế `cx`, `cy` bằng tọa độ thực tế của bạn.

### Sản phẩm AI / ML

| Sản phẩm | Màu sắc | Ký tự biểu tượng |
|---------|-------|-----------|
| OpenAI / ChatGPT | `#10A37F` | `OAI` |
| Anthropic / Claude | `#D97757` | `Claude` |
| Google Gemini | `#4285F4` | `Gemini` |
| Meta LLaMA | `#0467DF` | `LLaMA` |
| Mistral | `#FF7000` | `Mistral` |
| Cohere | `#39594D` | `Cohere` |
| Groq | `#F55036` | `Groq` |
| Together AI | `#6366F1` | `Together` |
| Replicate | `#191919` | `Rep` |
| Hugging Face | `#FFD21E` (chữ tối) | `HF` |

**Template:**
```xml
<circle cx="cx" cy="cy" r="22" fill="BRAND_COLOR"/>
<text x="cx" y="cy+5" text-anchor="middle" fill="white"
      font-size="10" font-weight="700" font-family="Helvetica">BADGE_TEXT</text>
<!-- Vòng ngoài tùy chọn cho các sản phẩm "AI" -->
<circle cx="cx" cy="cy" r="24" fill="none" stroke="BRAND_COLOR" stroke-width="1" opacity="0.4"/>
```

### Các sản phẩm RAG & Bộ nhớ AI

| Sản phẩm | Màu sắc | Biểu tượng |
|---------|-------|-------|
| Mem0 | `#6366F1` | `mem0` |
| LangChain | `#1C3C3C` | `LC` hoặc `🦜` |
| LlamaIndex | `#8B5CF6` | `LI` |
| LangGraph | `#1C3C3C` | `LG` |
| CrewAI | `#EF4444` | `Crew` |
| AutoGen | `#0078D4` | `AG` |
| Haystack | `#FF6D00` | `HS` hoặc `🌾` |
| DSPy | `#7C3AED` | `DSPy` |

### Cơ sở dữ liệu Vector (Vector DB)

| Sản phẩm | Màu sắc | Biểu tượng |
|---------|-------|-------|
| Pinecone | `#1C1C2E` + xanh | `Pine` |
| Weaviate | `#FA0050` | `Wea` |
| Qdrant | `#DC244C` | `Qdrant` |
| Chroma | `#FF6B35` | `Chr` |
| Milvus | `#00A1EA` | `Milvus` |
| pgvector | `#336791` | `pgv` |
| Faiss | `#0467DF` | `FAISS` |

**Mẫu Vector DB (hình trụ + badge):**
```xml
<!-- Hình dạng hình trụ -->
<ellipse cx="cx" cy="top" rx="40" ry="12" fill="FILL" stroke="STROKE" stroke-width="1.5"/>
<rect x="cx-40" y="top" width="80" height="50" fill="FILL" stroke="none"/>
<line x1="cx-40" y1="top" x2="cx-40" y2="top+50" stroke="STROKE" stroke-width="1.5"/>
<line x1="cx+40" y1="top" x2="cx+40" y2="top+50" stroke="STROKE" stroke-width="1.5"/>
<ellipse cx="cx" cy="top+50" rx="40" ry="12" fill="FILL_DARK" stroke="STROKE" stroke-width="1.5"/>
<!-- Tên sản phẩm -->
<text x="cx" y="top+30" text-anchor="middle" fill="white"
      font-size="11" font-weight="700">Pinecone</text>
```

### Cơ sở dữ liệu & Lưu trữ truyền thống

| Sản phẩm | Màu sắc |
|---------|-------|
| PostgreSQL | `#336791` |
| MySQL | `#4479A1` |
| MongoDB | `#47A248` |
| Redis | `#DC382D` |
| Elasticsearch | `#005571` |
| Cassandra | `#1287B1` |
| Neo4j | `#008CC1` |
| SQLite | `#003B57` |

### Hàng đợi thông điệp & Streaming

| Sản phẩm | Màu sắc |
|---------|-------|
| Apache Kafka | `#231F20` |
| RabbitMQ | `#FF6600` |
| AWS SQS | `#FF9900` |
| NATS | `#27AAE1` |
| Pulsar | `#188FFF` |

### Điện toán đám mây & Hạ tầng

| Sản phẩm | Màu sắc |
|---------|-------|
| AWS | `#FF9900` |
| GCP | `#4285F4` |
| Azure | `#0089D6` |
| Cloudflare | `#F48120` |
| Vercel | `#000000` |
| Docker | `#2496ED` |
| Kubernetes | `#326CE5` |
| Terraform | `#7B42BC` |
| Nginx | `#009639` |
| FastAPI | `#009688` |

### Giám sát & Quan sát (Observability)

| Sản phẩm | Màu sắc |
|---------|-------|
| Grafana | `#F46800` |
| Prometheus | `#E6522C` |
| Datadog | `#632CA6` |
| LangSmith | `#1C3C3C` |
| Langfuse | `#6366F1` |
| Arize | `#6B48FF` |

---

## Các biểu tượng dịch vụ Azure

Màu thương hiệu Azure: `#0089D6` (ngói trên / vòng ngoài).
Màu dịch vụ cụ thể lấy từ tập biểu tượng Azure của Microsoft; sử dụng chúng làm nền của biểu tượng bên trong để người dùng dễ nhận biết "đây là Azure".

**Mẫu (Azure Tile):**
```xml
<!-- Azure tile: ô vuông bo góc màu xanh Azure ở ngoài, biểu tượng dịch vụ bên trong. -->
<rect x="cx-22" y="cy-22" width="44" height="44" rx="6"
      fill="#0089D6" stroke="none"/>
<rect x="cx-19" y="cy-19" width="38" height="38" rx="4"
      fill="SERVICE_COLOR" stroke="none"/>
<text x="cx" y="cy+5" text-anchor="middle" fill="white"
      font-size="9" font-weight="700" font-family="Helvetica">BADGE</text>
```

### Azure Compute

| Sản phẩm | Màu dịch vụ | Viết tắt |
|---------|---------------|-------|
| Azure Functions | `#0062AD` | `Func` |
| Azure App Service | `#0072C6` | `App` |
| Azure Container Apps | `#3F8624` | `ACA` |
| Azure Container Instances | `#0078D4` | `ACI` |
| Azure Kubernetes Service (AKS) | `#326CE5` | `AKS` |
| Azure Virtual Machines | `#0078D4` | `VM` |
| Azure Batch | `#0072C6` | `Batch` |
| Azure Spring Apps | `#6DB33F` | `Spring` |

### Dữ liệu & Phân tích Azure

| Sản phẩm | Màu dịch vụ | Viết tắt |
|---------|---------------|-------|
| Azure SQL Database | `#0066A1` | `SQL` |
| Azure Cosmos DB | `#3D7AB3` | `Cosmos` |
| Azure PostgreSQL | `#336791` | `pg` |
| Azure Database for MySQL | `#4479A1` | `MySQL` |
| Azure Synapse Analytics | `#0078D4` | `Syn` |
| Azure Data Factory | `#0078D4` | `ADF` |
| Azure Databricks | `#FF3621` | `Bricks` |
| Azure Stream Analytics | `#0072C6` | `Stream` |
| Azure Data Explorer (Kusto) | `#1E5180` | `Kusto` |
| Azure Cache for Redis | `#DC382D` | `Redis` |

### Lưu trữ Azure

| Sản phẩm | Màu dịch vụ | Viết tắt |
|---------|---------------|-------|
| Azure Blob Storage | `#0078D4` | `Blob` |
| Azure Queue Storage | `#0078D4` | `Queue` |
| Azure Table Storage | `#0078D4` | `Table` |
| Azure Files | `#0078D4` | `Files` |
| Azure Data Lake Storage Gen2 | `#0078D4` | `Lake` |

### Trí tuệ nhân tạo Azure (Azure AI)

| Sản phẩm | Màu dịch vụ | Viết tắt |
|---------|---------------|-------|
| Azure OpenAI Service | `#10A37F` | `AOAI` |
| Azure AI Search (Cognitive Search) | `#0078D4` | `AISrch` |
| Azure AI Foundry | `#742774` | `Foundry` |
| Azure Machine Learning | `#0078D4` | `AML` |
| Azure AI Content Safety | `#107C10` | `Safety` |
| Azure Speech / Translator | `#0078D4` | `Speech` |

### Tin nhắn & Sự kiện Azure (Azure Messaging)

| Sản phẩm | Màu dịch vụ | Viết tắt |
|---------|---------------|-------|
| Azure Service Bus | `#0078D4` | `SB` |
| Azure Event Grid | `#0078D4` | `Grid` |
| Azure Event Hubs | `#0078D4` | `Hubs` |
| Azure Notification Hubs | `#0078D4` | `Notif` |
| Azure SignalR Service | `#0078D4` | `SignalR` |

### Mạng & Biên dịch vụ Azure (Azure Networking)

| Sản phẩm | Màu dịch vụ | Viết tắt |
|---------|---------------|-------|
| Azure Front Door | `#0078D4` | `AFD` |
| Azure Application Gateway | `#0078D4` | `AppGW` |
| Azure Load Balancer | `#0078D4` | `LB` |
| Azure API Management | `#1FBA9F` | `APIM` |
| Azure Virtual Network | `#0078D4` | `VNet` |
| Azure Private Link | `#0078D4` | `PL` |
| Azure CDN | `#0078D4` | `CDN` |
| Azure DNS | `#0078D4` | `DNS` |

### Danh tính & Bảo mật Azure

| Sản phẩm | Màu dịch vụ | Viết tắt |
|---------|---------------|-------|
| Microsoft Entra ID (Azure AD) | `#0072C6` | `Entra` |
| Azure Key Vault | `#FFB900` | `KV` |
| Azure Sentinel | `#0072C6` | `Sentinel` |
| Microsoft Defender for Cloud | `#0078D4` | `Defender` |

### DevOps & Vận hành Azure

| Sản phẩm | Màu dịch vụ | Viết tắt |
|---------|---------------|-------|
| Azure DevOps Pipelines | `#0078D4` | `Pipelines` |
| GitHub Actions (đích Azure) | `#181717` | `GHA` |
| Azure Monitor | `#0078D4` | `Monitor` |
| Application Insights | `#0072C6` | `AppI` |
| Azure Log Analytics | `#0078D4` | `Logs` |

### Các hình dạng đặc thù của Azure

Đối với các sơ đồ cần một vùng nhận diện trực quan "Azure" chung mà không có biểu tượng dịch vụ cụ thể — ví dụ: phân vùng vùng (region) Azure hoặc ranh giới subscription — hãy sử dụng viền nét đứt màu xanh lam Azure:

```xml
<!-- Azure region/subscription container -->
<rect x="x" y="y" width="w" height="h" rx="8"
      fill="#0089D6" fill-opacity="0.04"
      stroke="#0089D6" stroke-width="1.2" stroke-dasharray="6,4"/>
<text x="x+12" y="y+16" fill="#0089D6" font-size="10"
      font-weight="700" letter-spacing="0.06em">AZURE • TÊN VÙNG</text>
```

---

## Hướng dẫn kích thước biểu tượng

| Ngữ cảnh | Kích thước khuyến nghị | Khoảng đệm (Padding) |
|---------|-----------------|---------|
| Huy hiệu node (bên trong hộp) | Hình tròn 28×28px | 10px |
| Nút biểu tượng đứng riêng lẻ | 40×40px | 16px |
| Nút chính / nút trung tâm | 56×56px | 20px |
| Chỉ báo nhỏ trực tiếp | 16×16px | 6px |

## Các mẫu marker đầu mũi tên

```xml
<defs>
  <!-- Mũi tên đặc tiêu chuẩn -->
  <marker id="arrow-COLORNAME" markerWidth="10" markerHeight="7"
          refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill="COLOR"/>
  </marker>

  <!-- Mũi tên rỗng (chỉ viền ngoài) -->
  <marker id="arrow-open" markerWidth="10" markerHeight="8"
          refX="9" refY="4" orient="auto">
    <path d="M 0 0 L 10 4 L 0 8" fill="none" stroke="COLOR" stroke-width="1.5"/>
  </marker>

  <!-- Điểm tròn (cho các liên kết mối quan hệ) -->
  <marker id="dot" markerWidth="8" markerHeight="8"
          refX="4" refY="4" orient="auto">
    <circle cx="4" cy="4" r="3" fill="COLOR"/>
  </marker>
</defs>
```
