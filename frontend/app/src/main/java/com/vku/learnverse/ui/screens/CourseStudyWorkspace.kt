package com.vku.learnverse.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.vku.learnverse.LearnverseApplication
import com.vku.learnverse.data.model.FlashcardDto
import com.vku.learnverse.data.model.LessonDto
import com.vku.learnverse.data.model.QuestionDto
import com.vku.learnverse.data.model.QuizDto
import com.vku.learnverse.data.model.QuizAttemptDto
import com.vku.learnverse.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CourseStudyWorkspace(
    courseId: Long,
    onBackClick: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    
    val courseRepository = remember {
        (context.applicationContext as LearnverseApplication).container.courseRepository
    }
    val apiService = remember {
        (context.applicationContext as LearnverseApplication).container.apiService
    }

    var lessons by remember { mutableStateOf<List<LessonDto>>(emptyList()) }
    var selectedLessonIndex by remember { mutableStateOf(0) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var courseTitle by remember { mutableStateOf("Đang tải khóa học...") }
    var watchedLessonIds by remember { mutableStateOf(emptySet<Long>()) }

    // Read initial watched states
    LaunchedEffect(lessons) {
        val sp = context.getSharedPreferences("lesson_progress", android.content.Context.MODE_PRIVATE)
        val set = sp.all
            .filter { it.key.startsWith("watched_lesson_") && it.value == true }
            .mapNotNull { it.key.removePrefix("watched_lesson_").toLongOrNull() }
            .toSet()
        watchedLessonIds = set
    }

    val onWatchedToggle: (Long, Boolean) -> Unit = { lessonId, watched ->
        val sp = context.getSharedPreferences("lesson_progress", android.content.Context.MODE_PRIVATE)
        sp.edit().putBoolean("watched_lesson_$lessonId", watched).apply()
        watchedLessonIds = if (watched) {
            com.vku.learnverse.data.StreakManager.recordStudyActivity(context)
            com.vku.learnverse.data.PointsManager.addXp(context, 50)
            watchedLessonIds + lessonId
        } else {
            watchedLessonIds - lessonId
        }
    }

    // Fetch lessons and course details
    LaunchedEffect(courseId) {
        isLoading = true
        errorMessage = null
        try {
            val courseRes = courseRepository.getCourseById(courseId)
            courseRes.onSuccess { courseDto ->
                courseTitle = courseDto.title ?: "Chi tiết bài học"
            }
            
            val lessonsRes = courseRepository.getLessonsByCourse(courseId)
            lessonsRes.onSuccess { fetchedLessons ->
                lessons = fetchedLessons.sortedBy { it.orderIndex ?: 0 }
            }.onFailure { error ->
                errorMessage = "Không thể tải danh sách bài học: ${error.message}"
            }
        } catch (e: Exception) {
            errorMessage = "Đã xảy ra lỗi: ${e.message}"
        } finally {
            isLoading = false
        }
    }

    BackHandler(onBack = onBackClick)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = courseTitle,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        color = Ink
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Quay lại",
                            tint = Ink
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = AppBackground
    ) { paddingValues ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = LearnVersePink)
            }
        } else if (errorMessage != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Error,
                        contentDescription = null,
                        tint = LearnVerseRed,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = errorMessage ?: "",
                        textAlign = TextAlign.Center,
                        style = MaterialTheme.typography.bodyLarge,
                        color = InkSoft
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = {
                            coroutineScope.launch {
                                isLoading = true
                                errorMessage = null
                                val lessonsRes = courseRepository.getLessonsByCourse(courseId)
                                lessonsRes.onSuccess { fetchedLessons ->
                                    lessons = fetchedLessons.sortedBy { it.orderIndex ?: 0 }
                                }.onFailure { error ->
                                    errorMessage = "Không thể tải danh sách bài học: ${error.message}"
                                }
                                isLoading = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = LearnVersePurple)
                    ) {
                        Text("Thử lại")
                    }
                }
            }
        } else if (lessons.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = LearnVerseBlue,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Khóa học này chưa có nội dung bài học.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = InkSoft
                    )
                }
            }
        } else {
            val currentLesson = lessons[selectedLessonIndex]
            
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                // Horizontal list of lessons
                LessonNavigationRow(
                    lessons = lessons,
                    selectedIndex = selectedLessonIndex,
                    watchedLessonIds = watchedLessonIds,
                    onLessonSelected = { index ->
                        selectedLessonIndex = index
                    }
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Lesson Workspace (Video, Tabs for Flashcards, Quiz)
                LessonWorkspace(
                    lesson = currentLesson,
                    courseTitle = courseTitle,
                    watchedLessonIds = watchedLessonIds,
                    onWatchedToggle = onWatchedToggle,
                    apiService = apiService
                )
            }
        }
    }
}

@Composable
fun LessonNavigationRow(
    lessons: List<LessonDto>,
    selectedIndex: Int,
    watchedLessonIds: Set<Long>,
    onLessonSelected: (Int) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = "Danh sách bài học (${lessons.size})",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = InkSoft,
                modifier = Modifier.padding(bottom = 8.dp, start = 4.dp)
            )
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = 4.dp)
            ) {
                itemsIndexed(lessons) { index, lesson ->
                    val isSelected = index == selectedIndex
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                if (isSelected) Brush.horizontalGradient(
                                    listOf(LearnVersePurple, LearnVerseBlue)
                                ) else Brush.horizontalGradient(
                                    listOf(Color(0xFFF1F5F9), Color(0xFFF8FAFC))
                                )
                            )
                            .clickable { onLessonSelected(index) }
                            .padding(horizontal = 14.dp, vertical = 10.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            val isWatched = watchedLessonIds.contains(lesson.id)
                            Icon(
                                imageVector = if (isWatched) Icons.Default.CheckCircle else if (isSelected) Icons.Default.PlayCircleFilled else Icons.Default.PlayCircleOutline,
                                contentDescription = null,
                                tint = if (isWatched && !isSelected) Color(0xFF22C55E) else if (isSelected) Color.White else InkSoft,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Bài ${lesson.orderIndex ?: (index + 1)}: ${lesson.title}",
                                color = if (isSelected) Color.White else Ink,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.widthIn(max = 140.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LessonWorkspace(
    lesson: LessonDto,
    courseTitle: String,
    watchedLessonIds: Set<Long>,
    onWatchedToggle: (Long, Boolean) -> Unit,
    apiService: com.vku.learnverse.data.api.ApiService
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabTitles = listOf("Bài giảng", "Lý thuyết", "Trắc nghiệm")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        // Render Video Player if URL is present and selectedTab is 0
        if (selectedTab == 0 && !lesson.videoUrl.isNullOrBlank()) {
            VideoPlayerView(
                url = lesson.videoUrl,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }

        // Tab selection row
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(14.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.Transparent,
                divider = {},
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = LearnVersePink
                    )
                }
            ) {
                tabTitles.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = {
                            Text(
                                text = title,
                                fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Medium,
                                color = if (selectedTab == index) LearnVersePink else InkSoft
                            )
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Render tab contents
        when (selectedTab) {
            0 -> VideoTabContent(lesson, watchedLessonIds, onWatchedToggle)
            1 -> FlashcardsTabContent(lesson.flashcards ?: emptyList(), courseTitle, lesson.title)
            2 -> QuizTabContent(lesson.quiz, lesson, courseTitle, apiService)
        }
    }
}

@Composable
fun VideoTabContent(
    lesson: LessonDto,
    watchedLessonIds: Set<Long>,
    onWatchedToggle: (Long, Boolean) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(
                text = lesson.title,
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = Ink
            )
            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider(color = OutlineSoft)
            Spacer(modifier = Modifier.height(12.dp))

            // Checkbox/Toggle for marking as watched
            val isWatched = watchedLessonIds.contains(lesson.id)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isWatched) Color(0xFFDCFCE7) else Color(0xFFF1F5F9))
                    .clickable {
                        onWatchedToggle(lesson.id, !isWatched)
                    }
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = if (isWatched) Color(0xFF22C55E) else InkSoft.copy(alpha = 0.4f),
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = if (isWatched) "Đã hoàn thành bài học này" else "Đánh dấu đã hoàn thành bài học",
                    color = if (isWatched) Color(0xFF15803D) else Ink,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            
            if (lesson.videoUrl.isNullOrBlank()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp)
                        .background(Color(0xFFF8FAFC), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.VideocamOff,
                            contentDescription = null,
                            tint = InkSoft,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Bài học này không có video bài giảng.",
                            color = InkSoft,
                            fontSize = 14.sp
                        )
                    }
                }
            } else {
                Text(
                    text = "Đang phát video bài học bên trên. Bạn có thể sử dụng bảng điều khiển phát để tùy chỉnh tốc độ, tua nhanh hoặc tạm dừng video.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = InkSoft,
                    lineHeight = 20.sp
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Tóm tắt lý thuyết",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = Ink
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = lesson.content ?: "Không có mô tả lý thuyết đi kèm.",
                style = MaterialTheme.typography.bodyLarge,
                color = InkSoft,
                lineHeight = 22.sp
            )
        }
    }
}

@Composable
fun VideoPlayerView(url: String, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val exoPlayer = remember(url) {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(url))
            prepare()
            playWhenReady = true
        }
    }

    DisposableEffect(exoPlayer) {
        onDispose {
            exoPlayer.release()
        }
    }

    AndroidView(
        factory = { ctx ->
            PlayerView(ctx).apply {
                player = exoPlayer
                useController = true
            }
        },
        modifier = modifier
            .fillMaxWidth()
            .height(220.dp)
            .clip(RoundedCornerShape(16.dp))
            .shadow(4.dp, RoundedCornerShape(16.dp))
    )
}

@Composable
fun FlashcardsTabContent(
    flashcards: List<FlashcardDto>,
    courseTitle: String,
    lessonTitle: String
) {
    if (flashcards.isEmpty()) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Book,
                        contentDescription = null,
                        tint = InkSoft,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Bài học này không có thẻ lý thuyết (flashcards).",
                        color = InkSoft,
                        fontSize = 14.sp
                    )
                }
            }
        }
        return
    }

    var currentIndex by remember { mutableStateOf(0) }
    val currentCard = flashcards[currentIndex]

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Ôn tập lý thuyết qua thẻ ghi nhớ",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = Ink,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        // Interactive 3D flip card component
        InteractiveFlipCard(
            front = currentCard.frontText ?: "",
            back = currentCard.backText ?: "",
            key = currentCard.id ?: currentIndex.toLong()
        )

        val context = LocalContext.current
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Button(
                onClick = {
                    com.vku.learnverse.data.NotesManager.saveNote(
                        context,
                        com.vku.learnverse.data.SavedNote(
                            id = "flashcard_${currentCard.id ?: currentIndex}",
                            courseTitle = courseTitle,
                            lessonTitle = lessonTitle,
                            type = com.vku.learnverse.data.NoteType.FLASHCARD,
                            title = currentCard.frontText ?: "Thẻ ghi nhớ",
                            content = currentCard.backText ?: ""
                        )
                    )
                    Toast.makeText(context, "Đã lưu vào Ghi chú của bạn", Toast.LENGTH_SHORT).show()
                    com.vku.learnverse.data.StreakManager.recordStudyActivity(context)
                    com.vku.learnverse.data.PointsManager.addXp(context, 15)
                    if (currentIndex < flashcards.size - 1) {
                        currentIndex++
                    }
                },
                modifier = Modifier.weight(1f).height(46.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFEE2E2)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = null,
                        tint = Color(0xFFB91C1C),
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Chưa hiểu", color = Color(0xFFB91C1C), fontWeight = FontWeight.Bold)
                }
            }

            Button(
                onClick = {
                    Toast.makeText(context, "Tuyệt vời!", Toast.LENGTH_SHORT).show()
                    com.vku.learnverse.data.StreakManager.recordStudyActivity(context)
                    com.vku.learnverse.data.PointsManager.addXp(context, 15)
                    if (currentIndex < flashcards.size - 1) {
                        currentIndex++
                    }
                },
                modifier = Modifier.weight(1f).height(46.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDCFCE7)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = Color(0xFF15803D),
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Đã hiểu", color = Color(0xFF15803D), fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Navigation controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(
                onClick = { if (currentIndex > 0) currentIndex-- },
                enabled = currentIndex > 0,
                colors = ButtonDefaults.buttonColors(
                    containerColor = LearnVersePurple,
                    disabledContainerColor = Color(0xFFE2E8F0)
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(imageVector = Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Trước")
            }

            Text(
                text = "${currentIndex + 1} / ${flashcards.size}",
                fontWeight = FontWeight.Bold,
                color = Ink,
                fontSize = 16.sp
            )

            Button(
                onClick = { if (currentIndex < flashcards.size - 1) currentIndex++ },
                enabled = currentIndex < flashcards.size - 1,
                colors = ButtonDefaults.buttonColors(
                    containerColor = LearnVersePurple,
                    disabledContainerColor = Color(0xFFE2E8F0)
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Sau")
                Spacer(modifier = Modifier.width(4.dp))
                Icon(imageVector = Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
            }
        }
    }
}

@Composable
fun InteractiveFlipCard(front: String, back: String, key: Long) {
    var isFlipped by remember(key) { mutableStateOf(false) }
    val rotation by animateFloatAsState(
        targetValue = if (isFlipped) 180f else 0f,
        animationSpec = tween(durationMillis = 500),
        label = "rotation"
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(260.dp)
            .graphicsLayer {
                rotationY = rotation
                cameraDistance = 12 * density
            }
            .clickable { isFlipped = !isFlipped }
    ) {
        if (rotation <= 90f) {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxSize()
                    .border(1.5.dp, Color(0xFFF1F5F9), RoundedCornerShape(20.dp))
                    .shadow(6.dp, RoundedCornerShape(20.dp))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "THUẬT NGỮ / CÂU HỎI",
                            color = LearnVersePink,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            letterSpacing = 1.5.sp
                        )
                        Spacer(modifier = Modifier.height(20.dp))
                        Text(
                            text = front,
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = Ink,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Text(
                            text = "Chạm để lật ngược xem đáp án",
                            color = InkSoft,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        } else {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFAF9FF)),
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer {
                        rotationY = 180f
                    }
                    .border(1.5.dp, LearnVersePink.copy(alpha = 0.2f), RoundedCornerShape(20.dp))
                    .shadow(6.dp, RoundedCornerShape(20.dp))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "GIẢI THÍCH / ĐÁP ÁN",
                            color = LearnVersePurple,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            letterSpacing = 1.5.sp
                        )
                        Spacer(modifier = Modifier.height(20.dp))
                        Text(
                            text = back,
                            style = MaterialTheme.typography.bodyLarge,
                            color = Ink,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Text(
                            text = "Chạm để lật lại mặt trước",
                            color = InkSoft,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun QuizTabContent(
    quiz: QuizDto?,
    lesson: LessonDto,
    courseTitle: String,
    apiService: com.vku.learnverse.data.api.ApiService
) {
    val context = LocalContext.current
    if (quiz == null) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Quiz,
                        contentDescription = null,
                        tint = InkSoft,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Bài học này không có đề trắc nghiệm ôn tập.",
                        color = InkSoft,
                        fontSize = 14.sp
                    )
                }
            }
        }
        return
    }

    val coroutineScope = rememberCoroutineScope()
    var currentAttempt by remember { mutableStateOf<QuizAttemptDto?>(null) }
    var currentQuestionIndex by remember { mutableStateOf(0) }
    
    // Quiz state: 'NOT_STARTED', 'PLAYING', 'COMPLETED'
    var gameState by remember { mutableStateOf("NOT_STARTED") }
    var isSubmitting by remember { mutableStateOf(false) }

    // Feedback for the current question
    var selectedOptionIndex by remember { mutableStateOf<Int?>(null) }
    var correctAnswerIndex by remember { mutableStateOf<Int?>(null) }
    var hasAnswered by remember { mutableStateOf(false) }

    val questions = quiz.questions ?: emptyList()

    when (gameState) {
        "NOT_STARTED" -> {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Assignment,
                        contentDescription = null,
                        tint = LearnVersePurple,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = quiz.title ?: "Trắc nghiệm ôn tập",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                        color = Ink,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = quiz.description ?: "Kiểm tra kiến thức đã học qua bộ câu hỏi này.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = InkSoft,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Số câu hỏi", fontSize = 12.sp, color = InkSoft)
                            Text("${quiz.numberOfQuestions ?: questions.size}", fontWeight = FontWeight.Bold, color = Ink)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Mức độ", fontSize = 12.sp, color = InkSoft)
                            Text(quiz.difficultyLevel ?: "Trung bình", fontWeight = FontWeight.Bold, color = Ink)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Chủ đề", fontSize = 12.sp, color = InkSoft)
                            Text(quiz.subject ?: "Chung", fontWeight = FontWeight.Bold, color = Ink)
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    Button(
                        onClick = {
                            coroutineScope.launch {
                                isSubmitting = true
                                try {
                                    val response = apiService.startQuiz(quiz.id)
                                    if (response.isSuccessful && response.body() != null) {
                                        currentAttempt = response.body()
                                        currentQuestionIndex = 0
                                        gameState = "PLAYING"
                                        hasAnswered = false
                                        selectedOptionIndex = null
                                        correctAnswerIndex = null
                                    } else {
                                        Toast.makeText(context, "Lỗi khi bắt đầu làm bài!", Toast.LENGTH_SHORT).show()
                                    }
                                } catch (e: Exception) {
                                    Toast.makeText(context, "Lỗi mạng: ${e.message}", Toast.LENGTH_SHORT).show()
                                } finally {
                                    isSubmitting = false
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = LearnVersePink)
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                        } else {
                            Text("Bắt đầu làm bài", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
        "PLAYING" -> {
            if (questions.isEmpty() || currentQuestionIndex >= questions.size) {
                gameState = "COMPLETED"
                return
            }

            val question = questions[currentQuestionIndex]

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    // Question progress header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Câu ${currentQuestionIndex + 1} / ${questions.size}",
                            style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                            color = LearnVersePink
                        )
                        Text(
                            text = "Điểm: ${question.points ?: 10}",
                            style = MaterialTheme.typography.labelMedium,
                            color = InkSoft
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Text(
                        text = question.questionText ?: "",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = Ink,
                        lineHeight = 22.sp
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Option list
                    val options = question.options ?: emptyList()
                    options.sortedBy { it.optionIndex ?: 0 }.forEach { option ->
                        val index = option.optionIndex ?: 0
                        val isThisSelected = selectedOptionIndex == index
                        
                        val containerColor = when {
                            !hasAnswered -> Color(0xFFF8FAFC)
                            index == correctAnswerIndex -> Color(0xFFDCFCE7) // Correct answer is always green
                            isThisSelected -> Color(0xFFFEE2E2) // Incorrect selected is red
                            else -> Color(0xFFF8FAFC)
                        }

                        val borderColor = when {
                            !hasAnswered && isThisSelected -> LearnVersePurple
                            !hasAnswered -> Color(0xFFE2E8F0)
                            index == correctAnswerIndex -> Color(0xFF22C55E)
                            isThisSelected -> Color(0xFFEF4444)
                            else -> Color(0xFFE2E8F0)
                        }

                        val textColor = when {
                            index == correctAnswerIndex && hasAnswered -> Color(0xFF15803D)
                            isThisSelected && hasAnswered -> Color(0xFFB91C1C)
                            else -> Ink
                        }

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(containerColor)
                                .border(1.5.dp, borderColor, RoundedCornerShape(12.dp))
                                .clickable(enabled = !hasAnswered) {
                                    selectedOptionIndex = index
                                }
                                .padding(16.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                val optionLetter = when (index) {
                                    0 -> "A"
                                    1 -> "B"
                                    2 -> "C"
                                    3 -> "D"
                                    else -> "?"
                                }
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(CircleShape)
                                        .background(
                                            if (isThisSelected) LearnVersePurple else Color(0xFFE2E8F0)
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = optionLetter,
                                        color = if (isThisSelected) Color.White else InkSoft,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = option.optionText ?: "",
                                    color = textColor,
                                    fontSize = 14.sp,
                                    fontWeight = if (isThisSelected || (index == correctAnswerIndex && hasAnswered)) FontWeight.Bold else FontWeight.Normal,
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Buttons
                    if (!hasAnswered) {
                        Button(
                            onClick = {
                                if (selectedOptionIndex == null) return@Button
                                coroutineScope.launch {
                                    isSubmitting = true
                                    try {
                                        val attemptId = currentAttempt?.id ?: return@launch
                                        val response = apiService.submitQuestionAnswer(
                                            attemptId = attemptId,
                                            questionId = question.id ?: return@launch,
                                            selectedOptionIndex = selectedOptionIndex!!
                                        )
                                        if (response.isSuccessful && response.body() != null) {
                                            val result = response.body()!!
                                            correctAnswerIndex = result.correctAnswerIndex
                                            hasAnswered = true
                                        } else {
                                            Toast.makeText(context, "Lỗi nộp câu trả lời!", Toast.LENGTH_SHORT).show()
                                        }
                                    } catch (e: Exception) {
                                        Toast.makeText(context, "Lỗi mạng: ${e.message}", Toast.LENGTH_SHORT).show()
                                    } finally {
                                        isSubmitting = false
                                    }
                                }
                            },
                            enabled = selectedOptionIndex != null && !isSubmitting,
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = LearnVersePurple,
                                disabledContainerColor = Color(0xFFE2E8F0)
                            )
                        ) {
                            if (isSubmitting) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                            } else {
                                Text("Nộp câu trả lời", fontWeight = FontWeight.Bold)
                            }
                        }
                    } else {
                        val onNextClick = {
                            if (currentQuestionIndex < questions.size - 1) {
                                currentQuestionIndex++
                                hasAnswered = false
                                selectedOptionIndex = null
                                correctAnswerIndex = null
                            } else {
                                coroutineScope.launch {
                                    isSubmitting = true
                                    try {
                                        val attemptId = currentAttempt?.id ?: return@launch
                                        val response = apiService.completeQuiz(attemptId)
                                        if (response.isSuccessful && response.body() != null) {
                                            currentAttempt = response.body()
                                            gameState = "COMPLETED"
                                            com.vku.learnverse.data.PointsManager.addXp(context, 100)
                                        } else {
                                            Toast.makeText(context, "Lỗi hoàn thành bài học!", Toast.LENGTH_SHORT).show()
                                            gameState = "COMPLETED"
                                        }
                                    } catch (e: Exception) {
                                        Toast.makeText(context, "Lỗi kết nối", Toast.LENGTH_SHORT).show()
                                        gameState = "COMPLETED"
                                    } finally {
                                        isSubmitting = false
                                    }
                                }
                            }
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Button(
                                onClick = {
                                    val optionsText = question.options?.sortedBy { it.optionIndex ?: 0 }?.mapIndexed { idx, opt ->
                                        val prefix = when (idx) {
                                            0 -> "A"
                                            1 -> "B"
                                            2 -> "C"
                                            3 -> "D"
                                            else -> "-"
                                        }
                                        "$prefix. ${opt.optionText}"
                                    }?.joinToString("\n") ?: ""

                                    val correctOptionLetter = when (correctAnswerIndex) {
                                        0 -> "A"
                                        1 -> "B"
                                        2 -> "C"
                                        3 -> "D"
                                        else -> "?"
                                    }

                                    val noteContent = "$optionsText\n\n👉 Đáp án đúng: $correctOptionLetter"

                                    com.vku.learnverse.data.NotesManager.saveNote(
                                        context,
                                        com.vku.learnverse.data.SavedNote(
                                            id = "quiz_${question.id ?: currentQuestionIndex}",
                                            courseTitle = courseTitle,
                                            lessonTitle = lesson.title,
                                            type = com.vku.learnverse.data.NoteType.QUIZ,
                                            title = question.questionText ?: "Câu hỏi trắc nghiệm",
                                            content = noteContent
                                        )
                                    )
                                    Toast.makeText(context, "Đã lưu vào Ghi chú của bạn", Toast.LENGTH_SHORT).show()
                                    com.vku.learnverse.data.StreakManager.recordStudyActivity(context)
                                    com.vku.learnverse.data.PointsManager.addXp(context, 20)
                                    onNextClick()
                                },
                                modifier = Modifier.weight(1f).height(48.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFEE2E2))
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = null,
                                        tint = Color(0xFFB91C1C),
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Chưa hiểu", color = Color(0xFFB91C1C), fontWeight = FontWeight.Bold)
                                }
                            }

                            Button(
                                onClick = {
                                    com.vku.learnverse.data.StreakManager.recordStudyActivity(context)
                                    com.vku.learnverse.data.PointsManager.addXp(context, 20)
                                    onNextClick()
                                },
                                modifier = Modifier.weight(1f).height(48.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDCFCE7))
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = Color(0xFF15803D),
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    val isLast = currentQuestionIndex == questions.size - 1
                                    Text(
                                        text = if (isLast) "Xem kết quả" else "Đã hiểu",
                                        color = Color(0xFF15803D),
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
        "COMPLETED" -> {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = Color(0xFF22C55E),
                        modifier = Modifier.size(72.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Hoàn thành bài kiểm tra!",
                        style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                        color = Ink,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Chúc mừng bạn đã hoàn thành phần ôn tập trắc nghiệm.",
                        color = InkSoft,
                        textAlign = TextAlign.Center,
                        fontSize = 14.sp
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF8FAFC), RoundedCornerShape(16.dp))
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Tổng điểm", fontSize = 12.sp, color = InkSoft)
                            Text("${currentAttempt?.totalScore ?: 0}", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold), color = Ink)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Tỷ lệ đúng", fontSize = 12.sp, color = InkSoft)
                            val percent = currentAttempt?.percentage ?: 0.0
                            Text(
                                text = "${String.format("%.1f", percent)}%",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = if (percent >= 80) Color(0xFF22C55E) else LearnVersePurple
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(28.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                gameState = "NOT_STARTED"
                                currentAttempt = null
                            },
                            modifier = Modifier.weight(1f).height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Ink)
                        ) {
                            Text("Làm lại", fontWeight = FontWeight.Bold)
                        }

                        Button(
                            onClick = {
                                gameState = "NOT_STARTED"
                                currentAttempt = null
                            },
                            modifier = Modifier.weight(1f).height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = LearnVersePurple)
                        ) {
                            Text("Đóng", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
