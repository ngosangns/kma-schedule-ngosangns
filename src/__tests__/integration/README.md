# Integration Tests với Tài Khoản Thật

Thư mục này chứa các integration tests sử dụng tài khoản thật từ file `.env` để kiểm tra các chức năng của ứng dụng KMA Schedule với dữ liệu thực từ server.

## Cấu hình

### 1. Thiết lập file .env

Đảm bảo file `.env` trong thư mục gốc của dự án có các biến sau:

```env
TEST_USERNAME=your_kma_username
TEST_PASSWORD=your_kma_password
```

**Lưu ý:** Thay `your_kma_username` và `your_kma_password` bằng tài khoản KMA thật của bạn.

### 2. Cài đặt dependencies

```bash
npm install
```

## Chạy Tests

### Chạy tất cả unit tests (không bao gồm integration tests)

```bash
npm run test
# hoặc
npm run test:unit
```

### Chạy chỉ integration tests với tài khoản thật

```bash
npm run test:integration
```

### Chạy tất cả tests (bao gồm cả unit và integration)

```bash
npm run test:all
```

### Chạy integration tests ở chế độ watch

```bash
npm run test:integration:watch
```

## Các Test Cases

### 1. Real Account Integration Tests (`real-account.test.ts`)

**Mục đích:** Kiểm tra toàn bộ workflow từ đăng nhập đến xử lý dữ liệu với tài khoản thật.

**Test cases:**

- ✅ Đăng nhập thành công với tài khoản thật
- ❌ Đăng nhập thất bại với tài khoản sai
- ✅ Lấy dữ liệu lịch học từ server
- ✅ Xử lý và lọc dữ liệu HTML
- ✅ Xử lý thông tin sinh viên
- ✅ Xử lý form data
- ✅ Xử lý thông tin học kỳ
- ✅ Lưu và tải dữ liệu từ localStorage
- ✅ Xóa dữ liệu
- ✅ Workflow hoàn chỉnh end-to-end

### 2. Calendar Processing Tests (`calendar-processing.test.ts`)

**Mục đích:** Kiểm tra chi tiết các chức năng xử lý dữ liệu lịch học.

**Test cases:**

- ✅ Cấu trúc dữ liệu lịch học đúng format
- ✅ Xử lý dữ liệu các học kỳ khác nhau
- ✅ Trích xuất thông tin sinh viên
- ✅ Xử lý form fields
- ✅ Xử lý thông tin học kỳ
- ✅ Tính nhất quán của dữ liệu
- ❌ Xử lý lỗi với token không hợp lệ
- ❌ Xử lý response rỗng
- ❌ Xử lý HTML không đúng format
- ⏱️ Kiểm tra hiệu suất xử lý

### 3. Hooks Integration Tests (`hooks-integration.test.ts`)

**Mục đích:** Kiểm tra hook `useCalendarData` với dữ liệu thật.

**Test cases:**

- ✅ Đăng nhập thành công qua hook
- ❌ Xử lý lỗi đăng nhập
- ✅ Thay đổi học kỳ
- ✅ Xử lý dữ liệu manual
- ✅ Xuất lịch học
- ✅ Đăng xuất và xóa dữ liệu
- ❌ Xử lý lỗi mạng
- ❌ Xử lý lỗi processing
- ✅ Quản lý state processing

## Lưu ý quan trọng

### Bảo mật

- **KHÔNG** commit file `.env` chứa tài khoản thật vào git
- Chỉ sử dụng tài khoản test, không sử dụng tài khoản chính
- Các tests này sẽ thực hiện các request thật đến server KMA

### Hiệu suất

- Integration tests mất thời gian lâu hơn unit tests (có thể 10-30 giây)
- Cần kết nối internet để chạy
- Server KMA có thể chậm hoặc không khả dụng

### Môi trường

- Tests sẽ bị skip nếu không có `TEST_USERNAME` và `TEST_PASSWORD` trong `.env`
- Timeout được set là 30 giây cho các network operations
- Tests sử dụng `jest.setTimeout(30000)` để tăng timeout

## Troubleshooting

### Tests bị skip

```
SKIP Real Account Integration Tests
```

**Nguyên nhân:** Không có `TEST_USERNAME` hoặc `TEST_PASSWORD` trong file `.env`
**Giải pháp:** Thêm credentials vào file `.env`

### Timeout errors

```
Timeout - Async callback was not invoked within the 30000 ms timeout
```

**Nguyên nhân:** Server KMA phản hồi chậm hoặc mạng không ổn định
**Giải pháp:** Thử lại hoặc kiểm tra kết nối mạng

### Authentication errors

```
Failed to authenticate with server
```

**Nguyên nhân:** Tài khoản hoặc mật khẩu không đúng
**Giải pháp:** Kiểm tra lại credentials trong file `.env`

### Network errors

```
fetch failed
```

**Nguyên nhân:** Không có kết nối internet hoặc server KMA down
**Giải pháp:** Kiểm tra kết nối internet và thử lại sau

## Kết quả mong đợi

Khi chạy thành công, bạn sẽ thấy:

- Thông tin sinh viên được trích xuất
- Số lượng môn học trong lịch
- Số lượng học kỳ có sẵn
- Thời gian xử lý dữ liệu
- Tất cả tests PASS

Ví dụ output thực tế:

```
✓ should complete full workflow with real data (1784 ms)

console.log
  Testing full workflow...
console.log
  ✓ Login successful
console.log
  ✓ Calendar data fetched
console.log
  ✓ HTML filtered
console.log
  ✓ All data processed successfully
console.log
  Student: CT030343 - Ngô Quang Sang - Ngành An toàn thông tin
console.log
  Subjects count: 0
console.log
  Semesters count: 37
```

## Thành tựu đạt được

✅ **Đã thiết lập thành công unit testing với tài khoản thật**

- Sử dụng credentials từ file `.env` (TEST_USERNAME, TEST_PASSWORD)
- Thực hiện đăng nhập thật với server KMA
- Lấy và xử lý dữ liệu thật từ server
- Kiểm tra toàn bộ workflow từ đăng nhập đến xử lý dữ liệu

✅ **Cấu hình testing hoàn chỉnh**

- Unit tests riêng biệt (không bao gồm integration tests)
- Integration tests với tài khoản thật
- Môi trường testing được cách ly
- Timeout phù hợp cho network operations

✅ **Kết quả testing thực tế**

- Đăng nhập thành công với tài khoản CT030343
- Trích xuất thông tin sinh viên: "Ngô Quang Sang - Ngành An toàn thông tin"
- Phát hiện 37 học kỳ có sẵn
- Xử lý dữ liệu hoàn tất trong ~1.8 giây
