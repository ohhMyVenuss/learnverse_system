# Hướng dẫn Thêm Nút và Icon vào Thanh Điều Hướng Dưới (Bottom Navigation Bar)

Tài liệu này hướng dẫn chi tiết cách thêm nút mới, cấu hình biểu tượng (Icon) tương ứng và cập nhật logic điều hướng trên thanh điều hướng dưới của ứng dụng.

---

## 1. Cấu trúc Hiện tại của `BottomNavBar`

Thanh điều hướng dưới được định nghĩa ở cuối tệp [HomeScreen.kt](file:///d:/OhhhMyVenuss/LearnverseV2/frontend/app/src/main/java/com/vku/learnverse/ui/screens/HomeScreen.kt#L484-L517):

```kotlin
@Composable
fun BottomNavBar(currentTab: Int, onTabSelected: (Int) -> Unit) {
    NavigationBar(
        containerColor = BgPage,
        tonalElevation = 0.dp,
        modifier = Modifier
            .shadow(12.dp)
            .border(1.dp, BorderDark, RoundedCornerShape(0.dp))
    ) {
        val items = listOf("Home", "Explore", "Assistant", "Sign Out")
        val icons = listOf(Icons.Filled.Home, Icons.Filled.Search, Icons.Filled.Build, Icons.Filled.ExitToApp)
        // ... Vòng lặp vẽ các NavigationBarItem ...
    }
}
```

---

## 2. Quy trình Thêm Nút Mới (Ví dụ: Thêm mục "Settings")

Để thêm một nút mới, bạn hãy thực hiện theo 3 bước sau:

### Bước 1: Khai báo Nhãn và Biểu tượng mới
Mở tệp [HomeScreen.kt](file:///d:/OhhhMyVenuss/LearnverseV2/frontend/app/src/main/java/com/vku/learnverse/ui/screens/HomeScreen.kt) tìm đến hàm `BottomNavBar` và thêm giá trị vào hai danh sách:

```diff
- val items = listOf("Home", "Explore", "Assistant", "Sign Out")
- val icons = listOf(Icons.Filled.Home, Icons.Filled.Search, Icons.Filled.Build, Icons.Filled.ExitToApp)
+ val items = listOf("Home", "Explore", "Assistant", "Settings", "Sign Out")
+ val icons = listOf(Icons.Filled.Home, Icons.Filled.Search, Icons.Filled.Build, Icons.Filled.Settings, Icons.Filled.ExitToApp)
```

> [!NOTE]  
> Các icon được lấy từ thư viện `androidx.compose.material.icons.Icons`. Bạn có thể sử dụng bất kỳ biểu tượng Material Design có sẵn nào (ví dụ: `Icons.Filled.Settings`, `Icons.Filled.Person`, `Icons.Filled.Notifications`, v.v.).

---

### Bước 2: Cập nhật chỉ số xử lý sự kiện trong `HomeScreen`
Trong phần `Scaffold` của hàm `HomeScreen`, sự kiện click được lắng nghe để chuyển đổi tab. Bạn cần cập nhật chỉ số (index) của nút đăng xuất (Sign Out) và định tuyến cho nút mới:

```kotlin
// Trước khi sửa (Sign Out ở vị trí số 3):
BottomNavBar(currentTab) { idx ->
    currentTab = idx
    if (idx == 3) onLogOutClick()
}

// Sau khi sửa (Settings chèn vào vị trí 3, Sign Out chuyển sang vị trí 4):
BottomNavBar(currentTab) { idx ->
    currentTab = idx
    if (idx == 4) { // Vị trí mới của nút đăng xuất
        onLogOutClick()
    }
}
```

---

### Bước 3: Cập nhật giao diện hiển thị tương ứng với từng Tab
Để hiển thị màn hình/nội dung khác nhau khi người dùng bấm vào các nút, hãy sử dụng cấu trúc `when (currentTab)` để render giao diện tương ứng bên trong `Scaffold`:

Tìm khối code xử lý nội dung chính của màn hình:

```kotlin
Scaffold(
    // ...
) { pad ->
    Box(modifier.fillMaxSize().padding(pad)) {
        // Thay vì hiển thị cố định màn hình Home dưới dạng cuộn
        // Hãy cấu hình chuyển đổi theo tab:
        when (currentTab) {
            0 -> {
                // TAB 0: HOME
                Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
                    TopHeaderSection(uiState)
                    // ... các card trang chủ ...
                }
            }
            1 -> {
                // TAB 1: EXPLORE
                ExploreScreenContent()
            }
            2 -> {
                // TAB 2: ASSISTANT (Chatbot AI)
                AssistantScreenContent()
            }
            3 -> {
                // TAB 3: SETTINGS
                SettingsScreenContent()
            }
        }
    }
}
```

---

## 3. Cách Sử Dụng Icons Khác (Bao gồm Ảnh SVG Tự Thêm)

Nếu bạn muốn sử dụng icon SVG tự thiết kế ngoài bộ icon mặc định của Android:

1. Copy file `.svg` của bạn vào thư mục `app/src/main/res/drawable/`.
2. Tạo Icon thông qua `painterResource(id = R.drawable.my_custom_icon)` thay vì `imageVector` trong phần khai báo.

Ví dụ sửa logic vẽ icon trong `BottomNavBar`:

```kotlin
icon = {
    Icon(
        painter = painterResource(id = when(i) {
            3 -> R.drawable.ic_custom_settings // Icon drawable của bạn
            else -> 0 // Nếu dùng mặc định
        }),
        contentDescription = label,
        tint = if (selected) Pink else Color(0xFF9CA3AF)
    )
}
```
*(Nếu sử dụng cách này, hãy đảm bảo nhập đúng `import androidx.compose.ui.res.painterResource`)*.
