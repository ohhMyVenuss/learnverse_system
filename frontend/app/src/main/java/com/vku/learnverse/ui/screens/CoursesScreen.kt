package com.vku.learnverse.ui.screens

import android.graphics.Bitmap
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material.icons.rounded.AccessTime
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Error
import androidx.compose.material.icons.rounded.Groups
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Payments
import androidx.compose.material.icons.rounded.PlayCircle
import androidx.compose.material.icons.rounded.QrCode2
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material.icons.rounded.Verified
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.navigation.NavController
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import com.vku.learnverse.LearnverseApplication
import com.vku.learnverse.data.model.CoursePayment
import com.vku.learnverse.data.model.CourseSummary
import com.vku.learnverse.data.model.PaymentState
import com.vku.learnverse.data.repository.CourseRepository
import com.vku.learnverse.ui.components.LearnVerseHeader
import com.vku.learnverse.ui.components.softCard
import com.vku.learnverse.ui.theme.AppBackground
import com.vku.learnverse.ui.theme.Ink
import com.vku.learnverse.ui.theme.InkSoft
import com.vku.learnverse.ui.theme.LearnVersePink
import com.vku.learnverse.ui.theme.LearnVersePurple
import com.vku.learnverse.ui.theme.SurfaceWhite
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.NumberFormat
import java.util.Locale

private sealed interface CourseRoute {
    data object Catalog : CourseRoute
    data class Detail(val course: CourseSummary) : CourseRoute
    data class Payment(val course: CourseSummary) : CourseRoute
}

@Composable
fun CoursesScreen(navController: NavController) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val courseRepository = remember {
        (context.applicationContext as LearnverseApplication).container.courseRepository
    }

    var courses by remember { mutableStateOf<List<CourseSummary>>(emptyList()) }
    var enrolledCourses by remember { mutableStateOf<List<CourseSummary>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var loadFailed by remember { mutableStateOf(false) }
    var route by remember { mutableStateOf<CourseRoute>(CourseRoute.Catalog) }

    LaunchedEffect(Unit) {
        runCatching {
            courses = withContext(Dispatchers.IO) { courseRepository.loadCourses() }
            enrolledCourses = withContext(Dispatchers.IO) { courseRepository.loadEnrolledCourses() }
        }.onFailure {
            loadFailed = true
        }
        isLoading = false
    }

    AnimatedContent(
        targetState = route,
        modifier = Modifier.fillMaxSize(),
        transitionSpec = {
            fadeIn(tween(180)) togetherWith fadeOut(tween(120))
        },
        label = "course_navigation"
    ) { currentRoute ->
        when (currentRoute) {
            CourseRoute.Catalog -> CourseCatalogScreen(
                courses = courses,
                enrolledCourses = enrolledCourses,
                isLoading = isLoading,
                loadFailed = loadFailed,
                onCourseSelected = { route = CourseRoute.Detail(it) }
            )

            is CourseRoute.Detail -> CourseDetailScreen(
                course = currentRoute.course,
                isEnrolled = enrolledCourses.any { it.id == currentRoute.course.id },
                onBack = { route = CourseRoute.Catalog },
                onBuy = { route = CourseRoute.Payment(it) },
                onStudyClick = { course ->
                    navController.navigate("study_workspace/${course.id}")
                }
            )

            is CourseRoute.Payment -> PaymentScreen(
                course = currentRoute.course,
                courseRepository = courseRepository,
                onBack = {
                    coroutineScope.launch {
                        enrolledCourses = withContext(Dispatchers.IO) { courseRepository.loadEnrolledCourses() }
                    }
                    route = CourseRoute.Detail(currentRoute.course)
                },
                onPaymentSuccess = {
                    coroutineScope.launch {
                        enrolledCourses = withContext(Dispatchers.IO) { courseRepository.loadEnrolledCourses() }
                    }
                }
            )
        }
    }
}

@Composable
private fun CourseCatalogScreen(
    courses: List<CourseSummary>,
    enrolledCourses: List<CourseSummary>,
    isLoading: Boolean,
    loadFailed: Boolean,
    onCourseSelected: (CourseSummary) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Tất cả") }
    val categories = remember(courses) {
        listOf("Tất cả") + courses.map { it.category.trim() }
            .filter { it.isNotBlank() && !it.equals("Tất cả", ignoreCase = true) }
            .distinctBy { it.lowercase() }
            .take(5)
    }
    val filteredCourses = courses.filter { course ->
        (selectedCategory == "Tất cả" || course.category == selectedCategory) &&
            (searchQuery.isBlank() ||
                course.title.contains(searchQuery, ignoreCase = true) ||
                course.description.contains(searchQuery, ignoreCase = true))
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(AppBackground)
            .testTag("courses_screen"),
        contentPadding = PaddingValues(bottom = 30.dp)
    ) {
        item { LearnVerseHeader(hearts = 3) }
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            listOf(Color(0xFFFFF8FC), AppBackground)
                        )
                    )
                    .padding(horizontal = 20.dp, vertical = 26.dp)
            ) {
                Text(
                    text = "Học điều bạn thích",
                    style = MaterialTheme.typography.headlineMedium,
                    color = Ink
                )
                Text(
                    text = "Khóa học chất lượng, giá chỉ từ 2.000đ",
                    style = MaterialTheme.typography.bodyLarge,
                    color = InkSoft,
                    modifier = Modifier.padding(top = 4.dp)
                )
                TextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 18.dp),
                    placeholder = { Text("Bạn muốn học gì hôm nay?") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Rounded.Search,
                            contentDescription = null,
                            tint = LearnVersePurple
                        )
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = SurfaceWhite,
                        unfocusedContainerColor = SurfaceWhite,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    )
                )
            }
        }
        if (isLoading) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(360.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = LearnVersePink)
                }
            }
        } else if (courses.isNotEmpty()) {
            if (enrolledCourses.isNotEmpty()) {
                item {
                    Text(
                        text = "Khóa học của tôi",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = (-0.5).sp
                        ),
                        color = Ink,
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
                    )
                }
                item {
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 20.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.padding(bottom = 20.dp)
                    ) {
                        items(enrolledCourses, key = { it.id }) { course ->
                            EnrolledCourseCard(
                                course = course,
                                onClick = { onCourseSelected(course) }
                            )
                        }
                    }
                }
            }
            item {
                FeaturedCourseCard(
                    course = courses.first(),
                    onClick = { onCourseSelected(courses.first()) },
                    modifier = Modifier.padding(horizontal = 20.dp)
                )
            }
            item {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 20.dp, vertical = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(9.dp)
                ) {
                    items(categories, key = { it }) { category ->
                        CategoryChip(
                            label = category,
                            selected = category == selectedCategory,
                            onClick = { selectedCategory = category }
                        )
                    }
                }
            }
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (selectedCategory == "Tất cả") "Khóa học nổi bật" else selectedCategory,
                        style = MaterialTheme.typography.titleLarge,
                        color = Ink
                    )
                    Text(
                        text = "${filteredCourses.size} khóa học",
                        style = MaterialTheme.typography.labelMedium,
                        color = LearnVersePink
                    )
                }
            }
            items(
                items = filteredCourses,
                key = { it.id }
            ) { course ->
                CourseListCard(
                    course = course,
                    onClick = { onCourseSelected(course) },
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
                )
            }
        } else if (loadFailed) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(360.dp)
                        .padding(horizontal = 20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Không tải được danh sách khóa học lúc này.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = InkSoft,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}

@Composable
private fun FeaturedCourseCard(
    course: CourseSummary,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .shadow(9.dp, RoundedCornerShape(20.dp)),
        onClick = onClick,
        shape = RoundedCornerShape(20.dp),
        color = Color.Transparent
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(225.dp)
                .background(Brush.linearGradient(course.accentColors))
        ) {
            CourseImage(
                course = course,
                modifier = Modifier.fillMaxSize()
            )
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            listOf(Color.Transparent, Color(0xD90F1220))
                        )
                    )
            )
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(18.dp)
            ) {
                Text(
                    text = "ĐỀ XUẤT CHO BẠN",
                    style = MaterialTheme.typography.labelMedium,
                    color = Color(0xFFFFD8E8),
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = course.title,
                    style = MaterialTheme.typography.titleLarge,
                    color = Color.White,
                    modifier = Modifier.padding(top = 4.dp)
                )
                Row(
                    modifier = Modifier.padding(top = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RatingLabel(course.rating, Color.White)
                    Spacer(Modifier.width(12.dp))
                    Text(
                        text = formatPrice(course.price),
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White
                    )
                }
            }
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.92f))
                    .padding(horizontal = 12.dp, vertical = 7.dp)
            ) {
                Text(
                    text = course.level,
                    style = MaterialTheme.typography.labelMedium,
                    color = LearnVersePurple,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
private fun CourseListCard(
    course: CourseSummary,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .shadow(4.dp, RoundedCornerShape(16.dp)),
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        color = SurfaceWhite
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(width = 112.dp, height = 96.dp)
                    .clip(RoundedCornerShape(13.dp))
                    .background(Brush.linearGradient(course.accentColors))
            ) {
                CourseImage(course, Modifier.fillMaxSize())
                Box(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.88f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.PlayCircle,
                        contentDescription = null,
                        tint = LearnVersePink
                    )
                }
            }
            Spacer(Modifier.width(13.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    text = course.category.uppercase(),
                    style = MaterialTheme.typography.labelMedium,
                    color = LearnVersePink,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = course.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = Ink,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Row(
                    modifier = Modifier.padding(top = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RatingLabel(course.rating, Ink)
                    Spacer(Modifier.width(9.dp))
                    Text(
                        text = "${course.durationHours} giờ",
                        style = MaterialTheme.typography.labelMedium,
                        color = InkSoft
                    )
                }
                Text(
                    text = formatPrice(course.price),
                    style = MaterialTheme.typography.titleMedium,
                    color = LearnVersePurple,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }
    }
}

@Composable
private fun CategoryChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        shape = CircleShape,
        color = if (selected) LearnVersePink else SurfaceWhite,
        border = if (selected) null else androidx.compose.foundation.BorderStroke(
            1.dp,
            Color(0xFFE6DDE8)
        )
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 15.dp, vertical = 9.dp),
            style = MaterialTheme.typography.labelLarge,
            color = if (selected) Color.White else InkSoft
        )
    }
}

@Composable
private fun CourseDetailScreen(
    course: CourseSummary,
    isEnrolled: Boolean,
    onBack: () -> Unit,
    onBuy: (CourseSummary) -> Unit,
    onStudyClick: (CourseSummary) -> Unit
) {
    BackHandler(onBack = onBack)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(AppBackground)
            .testTag("course_detail_screen"),
        contentPadding = PaddingValues(bottom = 28.dp)
    ) {
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp)
                    .background(Brush.linearGradient(course.accentColors))
            ) {
                CourseImage(course, Modifier.fillMaxSize())
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                listOf(Color(0x33000000), Color(0xCC11131E))
                            )
                        )
                )
                IconButton(
                    onClick = onBack,
                    modifier = Modifier
                        .padding(16.dp)
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.92f))
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Rounded.ArrowBack,
                        contentDescription = "Quay lại",
                        tint = Ink
                    )
                }
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(20.dp)
                ) {
                    Text(
                        text = course.category.uppercase(),
                        style = MaterialTheme.typography.labelLarge,
                        color = Color(0xFFFFC8DD),
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = course.title,
                        style = MaterialTheme.typography.headlineMedium,
                        color = Color.White,
                        modifier = Modifier.padding(top = 5.dp)
                    )
                }
            }
        }
        item {
            Column(
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Giá trọn khóa",
                            style = MaterialTheme.typography.bodyMedium,
                            color = InkSoft
                        )
                        Text(
                            text = formatPrice(course.price),
                            style = MaterialTheme.typography.headlineMedium,
                            color = LearnVersePink
                        )
                    }
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(Color(0xFFEAE2FF))
                            .padding(horizontal = 13.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = course.level,
                            style = MaterialTheme.typography.labelLarge,
                            color = LearnVersePurple
                        )
                    }
                }
                Text(
                    text = course.description,
                    style = MaterialTheme.typography.bodyLarge,
                    color = InkSoft,
                    modifier = Modifier.padding(top = 14.dp)
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    CourseInfoItem(
                        icon = Icons.Rounded.Star,
                        value = course.rating.toString(),
                        label = "Đánh giá",
                        modifier = Modifier.weight(1f)
                    )
                    CourseInfoItem(
                        icon = Icons.Rounded.Groups,
                        value = formatCompact(course.studentCount),
                        label = "Học viên",
                        modifier = Modifier.weight(1f)
                    )
                    CourseInfoItem(
                        icon = Icons.Rounded.AccessTime,
                        value = "${course.durationHours}h",
                        label = "Thời lượng",
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
        item {
            DetailSection(
                title = "Giới thiệu khóa học",
                modifier = Modifier.padding(horizontal = 20.dp)
            ) {
                Text(
                    text = course.overview,
                    style = MaterialTheme.typography.bodyLarge,
                    color = InkSoft
                )
            }
        }
        item {
            DetailSection(
                title = "Bạn sẽ nhận được",
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)
            ) {
                course.includes.forEach { item ->
                    Row(
                        modifier = Modifier.padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF2CA57A),
                            modifier = Modifier.size(21.dp)
                        )
                        Spacer(Modifier.width(10.dp))
                        Text(
                            text = item,
                            style = MaterialTheme.typography.bodyLarge,
                            color = Ink
                        )
                    }
                }
            }
        }
        item {
            Row(
                modifier = Modifier
                    .padding(horizontal = 20.dp)
                    .fillMaxWidth()
                    .softCard(cornerRadius = 15, elevation = 3)
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFE8E0FA)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = course.instructorName
                            .split(" ")
                            .takeLast(2)
                            .joinToString("") { it.firstOrNull()?.uppercase() ?: "" },
                        color = LearnVersePurple,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Giảng viên",
                        style = MaterialTheme.typography.labelMedium,
                        color = InkSoft
                    )
                    Text(
                        text = course.instructorName,
                        style = MaterialTheme.typography.titleMedium,
                        color = Ink
                    )
                }
            }
        }
        item {
            if (isEnrolled) {
                Button(
                    onClick = {
                        onStudyClick(course)
                    },
                    modifier = Modifier
                        .padding(horizontal = 20.dp, vertical = 24.dp)
                        .fillMaxWidth()
                        .height(56.dp)
                        .testTag("study_course_button"),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2CA57A))
                ) {
                    Icon(
                        imageVector = Icons.Rounded.PlayCircle,
                        contentDescription = null,
                        tint = Color.White
                    )
                    Spacer(Modifier.width(9.dp))
                    Text(
                        text = "Vào học ngay",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            } else {
                Button(
                    onClick = { onBuy(course) },
                    modifier = Modifier
                        .padding(horizontal = 20.dp, vertical = 24.dp)
                        .fillMaxWidth()
                        .height(56.dp)
                        .testTag("buy_course_button"),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = LearnVersePink)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Payments,
                        contentDescription = null
                    )
                    Spacer(Modifier.width(9.dp))
                    Text(
                        text = "Mua khóa học · ${formatPrice(course.price)}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun PaymentScreen(
    course: CourseSummary,
    courseRepository: CourseRepository,
    onBack: () -> Unit,
    onPaymentSuccess: () -> Unit = {}
) {
    var payment by remember(course.id) { mutableStateOf<CoursePayment?>(null) }
    var isLoading by remember(course.id) { mutableStateOf(true) }
    var isChecking by remember(course.id) { mutableStateOf(false) }
    var errorMessage by remember(course.id) { mutableStateOf<String?>(null) }
    var retryKey by remember(course.id) { mutableStateOf(0) }
    val uriHandler = LocalUriHandler.current
    val coroutineScope = rememberCoroutineScope()

    suspend fun createPayment() {
        isLoading = true
        errorMessage = null
        payment = runCatching {
            withContext(Dispatchers.IO) { courseRepository.createPayment(course) }
        }.onFailure {
            errorMessage = it.message ?: "Không thể tạo mã thanh toán."
        }.getOrNull()
        isLoading = false
    }

    LaunchedEffect(course.id, retryKey) {
        createPayment()
    }

    LaunchedEffect(payment?.paymentId) {
        val paymentId = payment?.paymentId ?: return@LaunchedEffect
        repeat(60) {
            delay(5_000)
            if (payment?.status != PaymentState.PENDING) return@LaunchedEffect
            runCatching {
                withContext(Dispatchers.IO) {
                    courseRepository.refreshPaymentStatus(paymentId)
                }
            }.onSuccess { status ->
                payment = payment?.copy(status = status)
                if (status == PaymentState.SUCCESS) {
                    onPaymentSuccess()
                }
            }
        }
    }

    BackHandler(onBack = onBack)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8F5FB))
            .testTag("payment_screen"),
        contentPadding = PaddingValues(bottom = 32.dp)
    ) {
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceWhite)
                    .padding(horizontal = 10.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Rounded.ArrowBack,
                        contentDescription = "Quay lại"
                    )
                }
                Text(
                    text = "Thanh toán khóa học",
                    style = MaterialTheme.typography.titleLarge,
                    color = Ink,
                    modifier = Modifier.padding(start = 5.dp)
                )
            }
        }
        item {
            Column(
                modifier = Modifier
                    .padding(horizontal = 20.dp, vertical = 18.dp)
                    .fillMaxWidth()
                    .softCard(cornerRadius = 16, elevation = 3)
                    .padding(16.dp)
            ) {
                Text(
                    text = "ĐƠN HÀNG",
                    style = MaterialTheme.typography.labelMedium,
                    color = LearnVersePink,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = course.title,
                    style = MaterialTheme.typography.titleLarge,
                    color = Ink,
                    modifier = Modifier.padding(top = 4.dp)
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Tổng thanh toán",
                        style = MaterialTheme.typography.bodyLarge,
                        color = InkSoft
                    )
                    Text(
                        text = formatPrice(course.price),
                        style = MaterialTheme.typography.headlineMedium,
                        color = LearnVersePink
                    )
                }
            }
        }
        item {
            when {
                isLoading -> PaymentLoading()
                errorMessage != null -> PaymentError(
                    message = errorMessage.orEmpty(),
                    onRetry = {
                        errorMessage = null
                        retryKey += 1
                    }
                )

                payment != null -> PaymentQrContent(
                    payment = payment!!,
                    isChecking = isChecking,
                    onOpenCheckout = {
                        payment!!.checkoutUrl?.let { url ->
                            runCatching { uriHandler.openUri(url) }
                        }
                    },
                    onCheckStatus = {
                        isChecking = true
                    },
                    onBack = onBack
                )
            }
        }
    }

    if (isChecking) {
        LaunchedEffect(payment?.paymentId, isChecking) {
            val id = payment?.paymentId
            if (id != null) {
                runCatching {
                    withContext(Dispatchers.IO) {
                        courseRepository.refreshPaymentStatus(id)
                    }
                }.onSuccess { status ->
                    payment = payment?.copy(status = status)
                    if (status == PaymentState.SUCCESS) {
                        onPaymentSuccess()
                    }
                }.onFailure {
                    errorMessage = "Chưa kiểm tra được trạng thái. Hãy thử lại sau."
                }
            }
            isChecking = false
        }
    }
}

@Composable
private fun PaymentLoading() {
    Column(
        modifier = Modifier
            .padding(horizontal = 20.dp)
            .fillMaxWidth()
            .height(420.dp)
            .softCard(cornerRadius = 18, elevation = 4),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator(color = LearnVersePink)
        Text(
            text = "Đang tạo mã QR PayOS...",
            style = MaterialTheme.typography.titleMedium,
            color = Ink,
            modifier = Modifier.padding(top = 18.dp)
        )
        Text(
            text = "Quá trình này thường chỉ mất vài giây",
            style = MaterialTheme.typography.bodyMedium,
            color = InkSoft
        )
    }
}

@Composable
private fun PaymentError(
    message: String,
    onRetry: () -> Unit
) {
    Column(
        modifier = Modifier
            .padding(horizontal = 20.dp)
            .fillMaxWidth()
            .softCard(cornerRadius = 18, elevation = 4)
            .padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Rounded.Error,
            contentDescription = null,
            tint = Color(0xFFD94758),
            modifier = Modifier.size(52.dp)
        )
        Text(
            text = "Chưa tạo được mã thanh toán",
            style = MaterialTheme.typography.titleLarge,
            color = Ink,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 12.dp)
        )
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = InkSoft,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 7.dp)
        )
        Button(
            onClick = onRetry,
            colors = ButtonDefaults.buttonColors(containerColor = LearnVersePink),
            modifier = Modifier.padding(top = 18.dp)
        ) {
            Icon(Icons.Rounded.Refresh, contentDescription = null)
            Spacer(Modifier.width(7.dp))
            Text("Thử lại")
        }
    }
}

@Composable
private fun PaymentQrContent(
    payment: CoursePayment,
    isChecking: Boolean,
    onOpenCheckout: () -> Unit,
    onCheckStatus: () -> Unit,
    onBack: () -> Unit
) {
    if (payment.status == PaymentState.SUCCESS) {
        PaymentSuccess(onBack = onBack)
        return
    }

    val qrBitmap = remember(payment.qrCode) { createQrBitmap(payment.qrCode) }

    Column(
        modifier = Modifier.padding(horizontal = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .softCard(cornerRadius = 18, elevation = 6)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Color(0xFFFFEEF4))
                    .padding(horizontal = 12.dp, vertical = 7.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Rounded.QrCode2,
                    contentDescription = null,
                    tint = LearnVersePink,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(5.dp))
                Text(
                    text = "QUÉT MÃ ĐỂ THANH TOÁN",
                    style = MaterialTheme.typography.labelMedium,
                    color = LearnVersePink,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(Modifier.height(17.dp))
            qrBitmap?.let {
                Image(
                    bitmap = it.asImageBitmap(),
                    contentDescription = "Mã QR thanh toán PayOS",
                    modifier = Modifier
                        .size(260.dp)
                        .border(1.dp, Color(0xFFE6E0E8), RoundedCornerShape(12.dp))
                        .padding(10.dp)
                )
            }
            Text(
                text = "Dùng ứng dụng ngân hàng hoặc ví điện tử để quét mã",
                style = MaterialTheme.typography.bodyMedium,
                color = InkSoft,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 14.dp)
            )
            Row(
                modifier = Modifier
                    .padding(top = 14.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFFFF4D9))
                    .padding(horizontal = 12.dp, vertical = 7.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFE89A22))
                )
                Spacer(Modifier.width(7.dp))
                Text(
                    text = "Đang chờ thanh toán",
                    style = MaterialTheme.typography.labelLarge,
                    color = Color(0xFF9A6518)
                )
            }
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 18.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFFEDE8FF))
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Rounded.Lock,
                contentDescription = null,
                tint = LearnVersePurple,
                modifier = Modifier.size(22.dp)
            )
            Spacer(Modifier.width(10.dp))
            Text(
                text = "Thanh toán được bảo mật bởi PayOS. Mã có hiệu lực trong 10 phút.",
                style = MaterialTheme.typography.bodyMedium,
                color = LearnVersePurple
            )
        }
        Button(
            onClick = onCheckStatus,
            enabled = !isChecking,
            modifier = Modifier
                .fillMaxWidth()
                .height(72.dp)
                .padding(top = 14.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = LearnVersePink)
        ) {
            if (isChecking) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Icon(
                    imageVector = Icons.Rounded.Refresh,
                    contentDescription = null
                )
            }
            Spacer(Modifier.width(8.dp))
            Text("Tôi đã thanh toán · Kiểm tra")
        }
        OutlinedButton(
            onClick = onOpenCheckout,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp),
            shape = RoundedCornerShape(14.dp)
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Rounded.OpenInNew,
                contentDescription = null
            )
            Spacer(Modifier.width(8.dp))
            Text("Mở trang thanh toán PayOS")
        }
    }
}

@Composable
private fun PaymentSuccess(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .padding(horizontal = 20.dp)
            .fillMaxWidth()
            .softCard(cornerRadius = 18, elevation = 5)
            .padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Rounded.Verified,
            contentDescription = null,
            tint = Color(0xFF25A576),
            modifier = Modifier.size(76.dp)
        )
        Text(
            text = "Thanh toán thành công!",
            style = MaterialTheme.typography.headlineMedium,
            color = Ink,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 12.dp)
        )
        Text(
            text = "Khóa học đã được thêm vào tài khoản của bạn.",
            style = MaterialTheme.typography.bodyLarge,
            color = InkSoft,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 7.dp)
        )
        Button(
            onClick = onBack,
            colors = ButtonDefaults.buttonColors(containerColor = LearnVersePink),
            modifier = Modifier.padding(top = 24.dp)
        ) {
            Text("Về màn hình khóa học")
        }
    }
}

@Composable
private fun CourseInfoItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    value: String,
    label: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(13.dp))
            .background(SurfaceWhite)
            .padding(vertical = 13.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = LearnVersePurple,
            modifier = Modifier.size(21.dp)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            color = Ink,
            modifier = Modifier.padding(top = 4.dp)
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = InkSoft
        )
    }
}

@Composable
private fun DetailSection(
    title: String,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .softCard(cornerRadius = 15, elevation = 3)
            .padding(17.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            color = Ink
        )
        Spacer(Modifier.height(10.dp))
        content()
    }
}

@Composable
private fun RatingLabel(
    rating: Double,
    textColor: Color
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = Icons.Rounded.Star,
            contentDescription = null,
            tint = Color(0xFFFFB539),
            modifier = Modifier.size(16.dp)
        )
        Spacer(Modifier.width(3.dp))
        Text(
            text = String.format(Locale.US, "%.1f", rating),
            style = MaterialTheme.typography.labelMedium,
            color = textColor,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun CourseImage(
    course: CourseSummary,
    modifier: Modifier = Modifier
) {
    if (!course.thumbnail.isNullOrBlank()) {
        AsyncImage(
            model = course.thumbnail,
            contentDescription = course.title,
            modifier = modifier,
            contentScale = ContentScale.Crop,
            alpha = 0.92f
        )
    } else {
        Box(
            modifier = modifier.background(Brush.linearGradient(course.accentColors)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Rounded.PlayCircle,
                contentDescription = null,
                tint = Color.White.copy(alpha = 0.45f),
                modifier = Modifier.size(72.dp)
            )
        }
    }
}

private fun createQrBitmap(content: String?): Bitmap? {
    if (content.isNullOrBlank()) return null
    return runCatching {
        val size = 720
        val matrix = QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, size, size)
        val pixels = IntArray(size * size)
        for (y in 0 until size) {
            val offset = y * size
            for (x in 0 until size) {
                pixels[offset + x] =
                    if (matrix[x, y]) android.graphics.Color.BLACK else android.graphics.Color.WHITE
            }
        }
        Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888).apply {
            setPixels(pixels, 0, size, 0, 0, size, size)
        }
    }.getOrNull()
}

private fun formatPrice(price: Double): String {
    return NumberFormat.getCurrencyInstance(Locale.forLanguageTag("vi-VN"))
        .apply { maximumFractionDigits = 0 }
        .format(price)
}

private fun formatCompact(number: Int): String = when {
    number >= 1_000 -> "${String.format(Locale.US, "%.1f", number / 1_000f)}k"
    else -> number.toString()
}

@Composable
private fun EnrolledCourseCard(
    course: CourseSummary,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .width(260.dp)
            .height(140.dp)
            .shadow(6.dp, RoundedCornerShape(20.dp)),
        onClick = onClick,
        shape = RoundedCornerShape(20.dp),
        color = Color.Transparent
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.linearGradient(course.accentColors))
        ) {
            CourseImage(
                course = course,
                modifier = Modifier.fillMaxSize()
            )
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            listOf(Color.Black.copy(alpha = 0.2f), Color.Black.copy(alpha = 0.75f))
                        )
                    )
            )
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(14.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.White.copy(alpha = 0.25f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = course.category.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = course.title,
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = course.instructorName,
                            style = MaterialTheme.typography.labelMedium,
                            color = Color.White.copy(alpha = 0.8f),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                    Spacer(Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color.White),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.PlayCircle,
                            contentDescription = "Học tiếp",
                            tint = course.accentColors.firstOrNull() ?: LearnVersePink,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
    }
}
