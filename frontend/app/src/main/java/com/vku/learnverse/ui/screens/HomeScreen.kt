package com.vku.learnverse.ui.screens

import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import com.airbnb.lottie.compose.*
import androidx.navigation.NavController
import com.vku.learnverse.R
import com.vku.learnverse.data.model.CourseDto
import com.vku.learnverse.ui.viewmodel.HomeUiState
import com.vku.learnverse.ui.viewmodel.HomeViewModel
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.ui.platform.LocalContext
import com.vku.learnverse.data.NotesManager
import com.vku.learnverse.data.NoteType
import com.vku.learnverse.data.SavedNote
import java.util.Calendar
import java.time.LocalDateTime
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import kotlinx.coroutines.launch
import com.vku.learnverse.LearnverseApplication

// ─── Colour palette ──────────────────────────────────────────────────────────
private val BgPage      = Color(0xFFFFFFFF)   // Pure White Background
private val BgCard      = Color(0xFFF8FAFC)   // Light Slate Gray Card
private val BgCardLight = Color(0xFFFAF9FF)   // White Card Light
private val Pink        = Color(0xFFE91E63)
private val PinkLight   = Color(0xFFF06292)
private val Purple      = Color(0xFF8A2BE2)
private val BorderDark  = Color(0xFFE2E8F0)   // Light Slate Gray Border
private val BorderPink  = Color(0x33E91E63)   // Light pink border
private val TextPrimary = Color(0xFF1E293B)   // Dark Slate Primary Text
private val TextSub     = Color(0xFF64748B)   // Slate Secondary Text
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun HomeScreen(
    modifier: Modifier = Modifier,
    onLogOutClick: () -> Unit,
    navController: NavController,
    homeViewModel: HomeViewModel = viewModel(factory = HomeViewModel.Factory)
) {
    val uiState by homeViewModel.uiState.collectAsState()
    var currentTab by remember { mutableStateOf(0) }
    var isMascotOpen by remember { mutableStateOf(false) }

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulse by infiniteTransition.animateFloat(
        initialValue = 1f, targetValue = 1.06f,
        animationSpec = infiniteRepeatable(tween(1200, easing = EaseInOutQuad), RepeatMode.Reverse),
        label = "pulse"
    )

    val context = LocalContext.current
    var streakCount by remember { mutableStateOf(0) }
    var dailyQuestCompleted by remember { mutableStateOf(false) }
    var weeklyStreakDays by remember { mutableStateOf(listOf(false, false, false, false, false, false, false)) }

    LaunchedEffect(currentTab) {
        if (currentTab == 0) {
            streakCount = com.vku.learnverse.data.StreakManager.getStreakCount(context)
            dailyQuestCompleted = com.vku.learnverse.data.StreakManager.isDailyQuestCompleted(context)
            weeklyStreakDays = com.vku.learnverse.data.StreakManager.getWeeklyStreakDays(context)
        }
    }

    Scaffold(
        containerColor = BgPage,
        bottomBar = {
            BottomNavBar(currentTab) { idx ->
                currentTab = idx
            }
        },
        floatingActionButton = {
            if (currentTab == 0) {
                FloatingMascotBubble(pulse) { isMascotOpen = true }
            }
        }
    ) { pad ->
        Box(modifier.fillMaxSize().padding(pad)) {
            if (currentTab == 0) {
                Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
                    TopHeaderSection(uiState)
                    Column(
                        Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 16.dp)
                    ) {
                        // Greeting + mascot + lời nhắc — ALL inside one speech bubble card
                        GreetingSpeechBubble(
                            fullName    = uiState.userProfile?.user?.fullName ?: "Học viên",
                            mascotMsg   = uiState.mascotMessage
                        )
                        Spacer(Modifier.height(20.dp))
                        DailyQuestsCard(pulse = pulse, isCompleted = dailyQuestCompleted)
                        Spacer(Modifier.height(16.dp))
                        WeeklyStreakCard(streakCount = streakCount, weeklyStreakDays = weeklyStreakDays)
                        Spacer(Modifier.height(16.dp))
                        InProgressCourseCard(
                            enrolledCourses = uiState.enrolledCourses,
                            navController = navController,
                            onNavigateToCourses = { currentTab = 1 }
                        )
                        Spacer(Modifier.height(24.dp))
                        RecommendedSection(uiState.courses, onNavigateToCourses = { currentTab = 1 })
                        Spacer(Modifier.height(80.dp))
                    }
                }
            } else {
                when (currentTab) {
                    1 -> CoursesScreen(navController = navController)
                    2 -> LeaderboardScreen()
                    3 -> NotesTabContent()
                    4 -> ProfileScreen(onLogOutClick = onLogOutClick)
                }
            }
            if (isMascotOpen) {
                MascotBoardDialog(
                    fullName  = uiState.userProfile?.user?.fullName ?: "Học viên",
                    onDismiss = { isMascotOpen = false }
                )
            }
        }
    }
}

// ─── TOP HEADER ──────────────────────────────────────────────────────────────
@Composable
fun TopHeaderSection(uiState: HomeUiState) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(BgCardLight)
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        // Avatar
        Box(
            Modifier.size(40.dp).clip(CircleShape)
                .border(2.dp, Pink, CircleShape)
                .background(Brush.linearGradient(listOf(PinkLight, Pink))),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = (uiState.userProfile?.user?.fullName?.firstOrNull()?.toString() ?: "U").uppercase(),
                color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp
            )
        }
        Text("LearnVerse", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = Pink)
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Box {
                Icon(Icons.Filled.Notifications, null, tint = Color(0xFF374151), modifier = Modifier.size(24.dp))
                Box(Modifier.size(8.dp).background(Color.Red, CircleShape).align(Alignment.TopEnd))
            }
            Row(
                Modifier.clip(RoundedCornerShape(16.dp)).background(Color(0xFFF3F4F6))
                    .padding(horizontal = 10.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Icon(Icons.Filled.Favorite, null, tint = Pink, modifier = Modifier.size(16.dp))
                Text("3", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color(0xFF374151))
                Icon(Icons.Filled.Add, null, tint = Pink, modifier = Modifier.size(14.dp))
            }
        }
    }
}

// ─── GREETING + SPEECH BUBBLE (merged) ───────────────────────────────────────
@Composable
fun GreetingSpeechBubble(fullName: String, mascotMsg: String?) {
    // Outer card acting as the speech bubble
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(8.dp, RoundedCornerShape(20.dp))
            .background(BgCard, RoundedCornerShape(20.dp))
            .border(
                1.5.dp,
                Brush.horizontalGradient(listOf(Pink.copy(alpha = 0.7f), Purple.copy(alpha = 0.5f))),
                RoundedCornerShape(20.dp)
            )
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left: greeting texts + mascot tip text
            Column(Modifier.weight(1f)) {
                Text(
                    text = "Welcome back,",
                    fontSize = 15.sp,
                    color = TextSub
                )
                Text(
                    text = fullName + "!",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = TextPrimary
                )
                Text(
                    text = "Ready to continue your journey?",
                    fontSize = 13.sp,
                    color = TextSub
                )
                // Lời nhắc nằm ngay trong bong bóng (hiển thị khi có)
                mascotMsg?.let { msg ->
                    Spacer(Modifier.height(12.dp))
                    HorizontalDivider(color = BorderDark, thickness = 1.dp)
                    Spacer(Modifier.height(10.dp))
                    Row(verticalAlignment = Alignment.Top) {
                        Icon(
                            Icons.Filled.Info, null,
                            tint = PinkLight,
                            modifier = Modifier.size(16.dp).padding(top = 2.dp)
                        )
                        Spacer(Modifier.width(6.dp))
                        Text(
                            text = msg,
                            color = PinkLight,
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                    }
                }
            }
            // Right: mini lottie mascot robot
            Spacer(Modifier.width(12.dp))
            Box(Modifier.size(74.dp), contentAlignment = Alignment.Center) {
                val comp by rememberLottieComposition(LottieCompositionSpec.RawRes(R.raw.ai_robot))
                LottieAnimation(comp, iterations = LottieConstants.IterateForever, modifier = Modifier.fillMaxSize())
            }
        }
    }
}

// ─── DAILY QUESTS ────────────────────────────────────────────────────────────
@Composable
fun DailyQuestsCard(pulse: Float, isCompleted: Boolean) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(6.dp, RoundedCornerShape(16.dp))
            .border(1.5.dp, Brush.horizontalGradient(listOf(Pink.copy(.8f), Purple.copy(.5f))), RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF281E29)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Filled.Star, null, tint = Pink,
                    modifier = Modifier.size(20.dp).scale(pulse))
                Text("Daily Quests", color = PinkLight, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
            Spacer(Modifier.height(8.dp))
            Text(
                text = if (isCompleted) "Nhiệm vụ hôm nay đã xong! Hãy tiếp tục duy trì nhé!" else "Complete 1 Quiz today to keep your streak alive!",
                color = PinkLight,
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium
            )
            Spacer(Modifier.height(16.dp))
            Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween, Alignment.CenterVertically) {
                Text("GOAL PROGRESS", fontSize = 11.sp, color = PinkLight, fontWeight = FontWeight.Bold)
                Text(if (isCompleted) "1 / 1" else "0 / 1",         fontSize = 11.sp, color = PinkLight, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(6.dp))
            LinearProgressIndicator(
                progress = { if (isCompleted) 1f else 0f },
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape),
                color = Pink, trackColor = Color(0xFFFAF9FF)
            )
        }
    }
}

// ─── WEEKLY STREAK ───────────────────────────────────────────────────────────
@Composable
fun WeeklyStreakCard(streakCount: Int, weeklyStreakDays: List<Boolean>) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(4.dp, RoundedCornerShape(16.dp))
            .border(1.5.dp, BorderDark, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = BgCardLight),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween, Alignment.CenterVertically) {
                Text("Weekly Streak", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1E293B))
                Text("$streakCount Days",       fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Pink)
            }
            Spacer(Modifier.height(16.dp))
            Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) {
                listOf("M","T","W","T","F","S","S").forEachIndexed { i, day ->
                    val isDone = if (i < weeklyStreakDays.size) weeklyStreakDays[i] else false
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(day, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                        Box(
                            Modifier.size(26.dp).clip(CircleShape)
                                .background(if (isDone) Pink else Color(0xFFE2E8F0)),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isDone) Icon(Icons.Filled.Check, null, tint = Color.White, modifier = Modifier.size(14.dp))
                        }
                    }
                }
            }
        }
    }
}

// ─── IN PROGRESS ─────────────────────────────────────────────────────────────
@Composable
fun InProgressCourseCard(
    enrolledCourses: List<CourseDto>,
    navController: NavController,
    onNavigateToCourses: () -> Unit
) {
    var tapped by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        if (tapped) 0.97f else 1f,
        spring(Spring.DampingRatioMediumBouncy),
        label = "scale"
    )

    if (enrolledCourses.isEmpty()) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .scale(scale)
                .shadow(6.dp, RoundedCornerShape(20.dp))
                .border(
                    1.5.dp,
                    Brush.horizontalGradient(listOf(Purple.copy(.7f), Pink.copy(.6f))),
                    RoundedCornerShape(20.dp)
                )
                .clickable(MutableInteractionSource(), null) { tapped = !tapped },
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                Modifier
                    .background(Brush.verticalGradient(listOf(Color.White, Color(0xFFF9F5FF))))
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Filled.School,
                    contentDescription = null,
                    tint = Purple,
                    modifier = Modifier.size(48.dp)
                )
                Spacer(Modifier.height(12.dp))
                Text(
                    text = "Khám phá tri thức mới",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1E293B)
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Bạn chưa đăng ký khóa học nào. Hãy khám phá kho tàng khóa học của LearnVerse ngay hôm nay!",
                    fontSize = 14.sp,
                    color = Color(0xFF64748B),
                    textAlign = TextAlign.Center,
                    lineHeight = 20.sp
                )
                Spacer(Modifier.height(20.dp))
                Button(
                    onClick = onNavigateToCourses,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                    contentPadding = PaddingValues()
                ) {
                    Box(
                        Modifier.fillMaxSize()
                            .background(Brush.horizontalGradient(listOf(Purple, Pink))),
                        Alignment.Center
                    ) {
                        Text("Khám phá ngay", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }
        }
    } else {
        val course = enrolledCourses.first()
        val courseId = course.id ?: 0L

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .scale(scale)
                .shadow(6.dp, RoundedCornerShape(20.dp))
                .border(
                    1.5.dp,
                    Brush.horizontalGradient(listOf(Purple.copy(.7f), Pink.copy(.6f))),
                    RoundedCornerShape(20.dp)
                )
                .clickable(MutableInteractionSource(), null) {
                    navController.navigate("study_workspace/$courseId")
                },
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                Modifier
                    .background(Brush.verticalGradient(listOf(Color.White, Color(0xFFFFF0F5))))
                    .padding(20.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Box(Modifier.size(36.dp).clip(CircleShape).background(Purple), Alignment.Center) {
                        Icon(Icons.Filled.PlayArrow, null, tint = Color.White, modifier = Modifier.size(20.dp))
                    }
                    Text("ĐANG HỌC", color = Purple, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
                Spacer(Modifier.height(16.dp))
                Text(
                    text = course.title ?: "Khóa học của tôi",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1E293B)
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = course.description ?: "Bắt đầu học ngay hôm nay",
                    fontSize = 14.sp,
                    color = Color(0xFF64748B),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(Modifier.height(20.dp))
                Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween, Alignment.CenterVertically) {
                    Text("Lộ trình học tập", fontSize = 14.sp, color = Color(0xFF475569), fontWeight = FontWeight.Medium)
                    Text("Bắt đầu", fontSize = 14.sp, color = Purple, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.height(6.dp))
                LinearProgressIndicator(
                    progress = { 0.15f },
                    modifier = Modifier.fillMaxWidth().height(8.dp).clip(CircleShape),
                    color = Color(0xFFC71585), trackColor = Color(0xFFF3E5F5)
                )
                Spacer(Modifier.height(20.dp))
                Button(
                    onClick = {
                        navController.navigate("study_workspace/$courseId")
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                    contentPadding = PaddingValues()
                ) {
                    Box(
                        Modifier.fillMaxSize()
                            .background(Brush.horizontalGradient(listOf(Purple, Pink))),
                        Alignment.Center
                    ) {
                        Text("Vào Học Ngay", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }
        }
    }
}

// ─── RECOMMENDED ─────────────────────────────────────────────────────────────
@Composable
fun RecommendedSection(courses: List<CourseDto>, onNavigateToCourses: () -> Unit) {
    Text("Recommended for You", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
    Spacer(Modifier.height(12.dp))
    val list = if (courses.isNotEmpty()) courses else listOf(
        CourseDto(1,"Macroeconomics 101","Understanding global markets",0.0,null,"Finance","Beginner",null,null,null,"APPROVED",null,null,null),
        CourseDto(2,"Art History","Renaissance Masterpieces",0.0,null,"Art","All Levels",null,null,null,"APPROVED",null,null,null),
        CourseDto(3,"Node.js Express","Build scalable APIs",0.0,null,"Web Dev","Intermediate",null,null,null,"APPROVED",null,null,null)
    )
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(bottom = 8.dp)
    ) {
        items(list) { course -> RecommendedCard(course, onNavigateToCourses) }
    }
}

@Composable
fun RecommendedCard(course: CourseDto, onNavigateToCourses: () -> Unit) {
    val gradients = listOf(
        listOf(Color(0xFF8A2BE2), Color(0xFF4A00E0)),
        listOf(Color(0xFFE91E63), Color(0xFFF857A6)),
        listOf(Color(0xFF00B4DB), Color(0xFF0083B0)),
        listOf(Color(0xFFF12711), Color(0xFFF5AF19))
    )
    val gradIndex = (course.id ?: 0L).toInt() % gradients.size
    val gradientBrush = Brush.linearGradient(gradients[gradIndex])

    Card(
        modifier = Modifier
            .width(240.dp)
            .shadow(4.dp, RoundedCornerShape(16.dp))
            .border(1.5.dp, BorderDark, RoundedCornerShape(16.dp))
            .clickable { onNavigateToCourses() },
        colors = CardDefaults.cardColors(containerColor = BgCard),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column {
            // Thumbnail
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(115.dp)
                    .background(gradientBrush),
                contentAlignment = Alignment.Center
            ) {
                // Category badge overlay
                Box(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(10.dp)
                        .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = course.category ?: "Course",
                        color = Color.White,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Play Icon
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.9f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.PlayArrow,
                        contentDescription = null,
                        tint = Purple,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            // Title & Description
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp)
            ) {
                Text(
                    text = course.title ?: "LearnVerse Course",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = course.description ?: "Bắt đầu học ngay",
                    fontSize = 12.sp,
                    color = TextSub,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 16.sp
                )
            }
        }
    }
}

// ─── FLOATING MASCOT BUBBLE ───────────────────────────────────────────────────
@Composable
fun FloatingMascotBubble(pulse: Float, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(72.dp)
            .scale(pulse)
            .shadow(10.dp, CircleShape)
            .background(Brush.linearGradient(listOf(Purple, Pink)), CircleShape)
            .border(2.dp, Color.White, CircleShape)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        val comp by rememberLottieComposition(LottieCompositionSpec.RawRes(R.raw.ai_robot))
        LottieAnimation(comp, iterations = LottieConstants.IterateForever, modifier = Modifier.size(54.dp))
    }
}

// ─── MASCOT BOARD DIALOG ──────────────────────────────────────────────────────
@Composable
fun MascotBoardDialog(fullName: String, onDismiss: () -> Unit) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .border(1.5.dp, BorderDark, RoundedCornerShape(24.dp)),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = BgCardLight)
        ) {
            Column(
                Modifier.fillMaxWidth().padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(Modifier.size(110.dp)) {
                    val comp by rememberLottieComposition(LottieCompositionSpec.RawRes(R.raw.ai_robot))
                    LottieAnimation(comp, iterations = LottieConstants.IterateForever, modifier = Modifier.fillMaxSize())
                }
                Spacer(Modifier.height(12.dp))
                Text("Trợ lý AI LearnVerse", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                Spacer(Modifier.height(6.dp))
                Text("Xin chào $fullName! Đây là gợi ý học tập hôm nay:", color = TextSub, fontSize = 13.sp, lineHeight = 20.sp)
                Spacer(Modifier.height(16.dp))
                Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    MascotTipItem(Icons.Filled.Info, "Học tập mỗi ngày", "Dành 15 phút/ngày tăng 80% khả năng ghi nhớ dài hạn.")
                    MascotTipItem(Icons.Filled.Star, "Chuỗi Streak 5 ngày", "Bạn đang có chuỗi 5 ngày liên tiếp, đừng gián đoạn nhé!")
                }
                Spacer(Modifier.height(20.dp))
                Button(
                    onClick = onDismiss,
                    Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Pink),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Đóng", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun MascotTipItem(icon: ImageVector, title: String, description: String) {
    Row(
        Modifier.fillMaxWidth()
            .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
            .border(1.dp, BorderDark, RoundedCornerShape(12.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null, tint = Pink, modifier = Modifier.size(22.dp))
        Spacer(Modifier.width(10.dp))
        Column {
            Text(title, color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Spacer(Modifier.height(2.dp))
            Text(description, color = TextSub, fontSize = 12.sp, lineHeight = 16.sp)
        }
    }
}

// ─── BOTTOM NAV BAR ───────────────────────────────────────────────────────────
@Composable
fun BottomNavBar(currentTab: Int, onTabSelected: (Int) -> Unit) {
    NavigationBar(
        containerColor = BgPage,
        tonalElevation = 0.dp,
        modifier = Modifier
            .shadow(12.dp)
            .border(1.dp, BorderDark, RoundedCornerShape(0.dp))
    ) {
        val items = listOf("Home", "Courses", "Leaders", "Notes", "Profile")
        val icons = listOf(
            Icons.Filled.Home,
            Icons.Filled.PlayArrow,
            Icons.Filled.Star,
            Icons.Filled.Edit,
            Icons.Filled.Person
        )
        items.forEachIndexed { i, label ->
            val selected = currentTab == i
            val sz by animateFloatAsState(if (selected) 1.2f else 1f,
                spring(Spring.DampingRatioMediumBouncy), label = "nav")
            NavigationBarItem(
                selected = selected,
                onClick = { onTabSelected(i) },
                icon = {
                    Icon(icons[i], label,
                        tint = if (selected) Pink else Color(0xFF9CA3AF),
                        modifier = Modifier.size(24.dp).scale(sz))
                },
                label = {
                    Text(label, fontSize = 10.sp,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                        color = if (selected) Pink else Color(0xFF9CA3AF))
                },
                colors = NavigationBarItemDefaults.colors(indicatorColor = BgCard)
            )
        }
    }
}

// ─── NOTES TAB CONTENT ───────────────────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotesTabContent() {
    val context = LocalContext.current
    val apiService = remember {
        (context.applicationContext as LearnverseApplication).container.apiService
    }
    val coroutineScope = rememberCoroutineScope()
    var notes by remember { mutableStateOf(NotesManager.getNotes(context)) }

    // Sync from backend on launch
    LaunchedEffect(Unit) {
        NotesManager.syncWithBackend(context, apiService)
        notes = NotesManager.getNotes(context)
    }

    var selectedSubTab by remember { mutableStateOf(0) }
    var selectedCalendarDate by remember { mutableStateOf<LocalDate?>(null) }
    var isFabExpanded by remember { mutableStateOf(false) }
    var showCreateNoteDialog by remember { mutableStateOf(false) }
    var showCreatePlanDialog by remember { mutableStateOf(false) }
    var editingNote by remember { mutableStateOf<SavedNote?>(null) }

    val filteredNotes = remember(notes, selectedSubTab, selectedCalendarDate) {
        if (selectedSubTab == 0) {
            notes.filter { it.type == NoteType.FLASHCARD || it.type == NoteType.QUIZ || it.type == NoteType.STUDY_NOTE }
        } else {
            val plans = notes.filter { it.type == NoteType.STUDY_PLAN }
            if (selectedCalendarDate != null) {
                plans.filter { note ->
                    try {
                        LocalDateTime.parse(note.eventDate).toLocalDate() == selectedCalendarDate
                    } catch (e: Exception) {
                        false
                    }
                }
            } else {
                plans
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgPage)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Title Header
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Học tập & Lịch trình",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = TextPrimary
                )
                Text(
                    text = "${filteredNotes.size} mục",
                    fontSize = 14.sp,
                    color = Pink,
                    fontWeight = FontWeight.Bold
                )
            }

            // Tabs Row
            TabRow(
                selectedTabIndex = selectedSubTab,
                containerColor = BgPage,
                contentColor = Pink,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        Modifier.tabIndicatorOffset(tabPositions[selectedSubTab]),
                        color = Pink
                    )
                },
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            ) {
                Tab(
                    selected = selectedSubTab == 0,
                    onClick = { selectedSubTab = 0 },
                    text = { Text("Ghi chú học tập", fontWeight = FontWeight.Bold, fontSize = 14.sp) }
                )
                Tab(
                    selected = selectedSubTab == 1,
                    onClick = { selectedSubTab = 1 },
                    text = { Text("Lịch trình", fontWeight = FontWeight.Bold, fontSize = 14.sp) }
                )
            }

            if (selectedSubTab == 1) {
                CalendarSection(
                    notes = notes,
                    selectedCalendarDate = selectedCalendarDate,
                    onDateSelect = { selectedCalendarDate = it }
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            if (filteredNotes.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(24.dp)
                    ) {
                        Icon(
                            imageVector = if (selectedSubTab == 0) Icons.Filled.Assignment else Icons.Filled.Event,
                            contentDescription = null,
                            tint = TextSub.copy(alpha = 0.4f),
                            modifier = Modifier.size(80.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = if (selectedSubTab == 0) "Chưa có ghi chú nào" else "Chưa có lịch trình nào",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = if (selectedSubTab == 0) {
                                "Những thẻ ghi nhớ hoặc câu trắc nghiệm bạn đánh dấu 'Chưa hiểu' hoặc ghi chú tự tạo sẽ xuất hiện ở đây để ôn tập lại."
                            } else {
                                "Lên lịch các kỳ thi, bài tập hoặc kế hoạch tự học để nhận được thông báo nhắc nhở đúng giờ."
                            },
                            fontSize = 14.sp,
                            color = TextSub,
                            textAlign = TextAlign.Center,
                            lineHeight = 20.sp
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(bottom = 80.dp)
                ) {
                    items(filteredNotes, key = { it.id }) { note ->
                        NoteCard(
                            note = note,
                            onEdit = {
                                editingNote = note
                                if (note.type == NoteType.STUDY_PLAN) {
                                    showCreatePlanDialog = true
                                } else {
                                    showCreateNoteDialog = true
                                }
                            },
                            onDelete = {
                                coroutineScope.launch {
                                    NotesManager.deleteNoteRemote(context, apiService, note.id)
                                    notes = NotesManager.getNotes(context)
                                }
                            }
                        )
                    }
                }
            }
        }

        // Expandable FAB (Google Drive style)
        Column(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(bottom = 76.dp, end = 16.dp),
            horizontalAlignment = Alignment.End,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (isFabExpanded) {
                // Option 1: Create Study Note
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.clickable {
                        isFabExpanded = false
                        editingNote = null
                        showCreateNoteDialog = true
                    }
                ) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = BgCard),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.shadow(2.dp, RoundedCornerShape(8.dp))
                    ) {
                        Text(
                            "Tạo ghi chú học tập",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                    SmallFloatingActionButton(
                        onClick = {
                            isFabExpanded = false
                            editingNote = null
                            showCreateNoteDialog = true
                        },
                        containerColor = Pink,
                        contentColor = Color.White
                    ) {
                        Icon(Icons.Filled.Assignment, contentDescription = "Tạo ghi chú")
                    }
                }

                // Option 2: Create Study Plan
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.clickable {
                        isFabExpanded = false
                        editingNote = null
                        showCreatePlanDialog = true
                    }
                ) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = BgCard),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.shadow(2.dp, RoundedCornerShape(8.dp))
                    ) {
                        Text(
                            "Lên lịch thi/Kế hoạch",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                    SmallFloatingActionButton(
                        onClick = {
                            isFabExpanded = false
                            editingNote = null
                            showCreatePlanDialog = true
                        },
                        containerColor = Purple,
                        contentColor = Color.White
                    ) {
                        Icon(Icons.Filled.Event, contentDescription = "Lên lịch")
                    }
                }
            }

            // Main FAB
            FloatingActionButton(
                onClick = { isFabExpanded = !isFabExpanded },
                containerColor = Pink,
                contentColor = Color.White
            ) {
                Icon(
                    imageVector = if (isFabExpanded) Icons.Filled.Close else Icons.Filled.Add,
                    contentDescription = "Menu thêm mới"
                )
            }
        }
    }

    // Dialogs
    if (showCreateNoteDialog) {
        CreateOrEditNoteDialog(
            note = editingNote,
            onDismiss = { showCreateNoteDialog = false },
            onSave = { title, content ->
                coroutineScope.launch {
                    val noteToSave = editingNote?.copy(
                        title = title,
                        content = content
                    ) ?: SavedNote(
                        id = "0",
                        type = NoteType.STUDY_NOTE,
                        title = title,
                        content = content
                    )
                    NotesManager.saveNoteRemote(context, apiService, noteToSave)
                    notes = NotesManager.getNotes(context)
                    showCreateNoteDialog = false
                }
            }
        )
    }

    if (showCreatePlanDialog) {
        CreateOrEditPlanDialog(
            note = editingNote,
            onDismiss = { showCreatePlanDialog = false },
            onSave = { title, content, date, time, importance, hasAlarm, alarmTime ->
                coroutineScope.launch {
                    val noteToSave = editingNote?.copy(
                        title = title,
                        content = content,
                        eventDate = date + "T" + time + ":00",
                        importance = importance,
                        hasAlarm = hasAlarm,
                        alarmTime = if (hasAlarm) alarmTime else null
                    ) ?: SavedNote(
                        id = "0",
                        type = NoteType.STUDY_PLAN,
                        title = title,
                        content = content,
                        eventDate = date + "T" + time + ":00",
                        importance = importance,
                        hasAlarm = hasAlarm,
                        alarmTime = if (hasAlarm) alarmTime else null
                    )
                    NotesManager.saveNoteRemote(context, apiService, noteToSave)
                    notes = NotesManager.getNotes(context)
                    showCreatePlanDialog = false
                }
            }
        )
    }
}

@Composable
fun NoteCard(note: SavedNote, onEdit: () -> Unit, onDelete: () -> Unit) {
    var isExpanded by remember { mutableStateOf(false) }

    val countdownText = remember(note) {
        if (note.type == NoteType.STUDY_PLAN) {
            getCountdownText(note.eventDate)
        } else ""
    }

    val importanceColor = remember(note) {
        getImportanceColor(note.importance)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(2.dp, RoundedCornerShape(16.dp))
            .border(
                1.dp,
                if (note.type == NoteType.STUDY_PLAN) importanceColor.copy(alpha = 0.4f) else BorderDark,
                RoundedCornerShape(16.dp)
            ),
        colors = CardDefaults.cardColors(containerColor = BgCard),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .clickable { isExpanded = !isExpanded }
                .padding(16.dp)
        ) {
            // Header: Type tag & action buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(
                                when (note.type) {
                                    NoteType.FLASHCARD -> Pink.copy(alpha = 0.1f)
                                    NoteType.QUIZ -> Purple.copy(alpha = 0.1f)
                                    NoteType.STUDY_NOTE -> Color(0xFF10B981).copy(alpha = 0.1f)
                                    NoteType.STUDY_PLAN -> importanceColor.copy(alpha = 0.1f)
                                }
                            )
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = when (note.type) {
                                NoteType.FLASHCARD -> "FLASHCARD"
                                NoteType.QUIZ -> "TRẮC NGHIỆM"
                                NoteType.STUDY_NOTE -> "GHI CHÚ TỰ HỌC"
                                NoteType.STUDY_PLAN -> "KẾ HOẠCH"
                            },
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = when (note.type) {
                                NoteType.FLASHCARD -> Pink
                                NoteType.QUIZ -> Purple
                                NoteType.STUDY_NOTE -> Color(0xFF10B981)
                                NoteType.STUDY_PLAN -> importanceColor
                            }
                        )
                    }

                    if (note.type == NoteType.STUDY_PLAN && countdownText.isNotBlank()) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(importanceColor)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = countdownText,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White
                            )
                        }
                    }

                    if (note.type == NoteType.STUDY_PLAN && note.hasAlarm) {
                        Icon(
                            imageVector = Icons.Filled.NotificationsActive,
                            contentDescription = "Báo thức",
                            tint = importanceColor,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    IconButton(
                        onClick = onEdit,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Edit,
                            contentDescription = "Sửa ghi chú",
                            tint = TextSub.copy(alpha = 0.7f),
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Delete,
                            contentDescription = "Xóa ghi chú",
                            tint = TextSub.copy(alpha = 0.7f),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Subtitle: Course/Lesson details or Event Date/Time
            if (note.type == NoteType.STUDY_PLAN) {
                val formattedTime = remember(note.eventDate) {
                    try {
                        val dt = java.time.LocalDateTime.parse(note.eventDate)
                        dt.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm, dd/MM/yyyy"))
                    } catch (e: Exception) {
                        note.eventDate ?: ""
                    }
                }
                Text(
                    text = "Thời gian: $formattedTime",
                    fontSize = 12.sp,
                    color = TextSub,
                    fontWeight = FontWeight.Bold
                )
            } else if (note.courseTitle.isNotBlank() || note.lessonTitle.isNotBlank()) {
                Text(
                    text = "${note.courseTitle} • ${note.lessonTitle}",
                    fontSize = 12.sp,
                    color = TextSub,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Title
            Text(
                text = note.title,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                lineHeight = 20.sp
            )

            // Content (Expandable)
            if (isExpanded) {
                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = BorderDark)
                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = note.content,
                    fontSize = 14.sp,
                    color = TextPrimary.copy(alpha = 0.9f),
                    lineHeight = 20.sp
                )

                if (note.type == NoteType.STUDY_PLAN && note.hasAlarm && !note.alarmTime.isNullOrBlank()) {
                    val formattedAlarm = remember(note.alarmTime) {
                        try {
                            val dt = java.time.LocalDateTime.parse(note.alarmTime)
                            dt.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm, dd/MM/yyyy"))
                        } catch (e: Exception) {
                            note.alarmTime ?: ""
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "🔔 Hẹn giờ nhắc: $formattedAlarm",
                        fontSize = 12.sp,
                        color = importanceColor,
                        fontWeight = FontWeight.Bold
                    )
                }
            } else {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Chạm để xem chi tiết...",
                    fontSize = 12.sp,
                    color = Pink,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
fun CreateOrEditNoteDialog(
    note: SavedNote?,
    onDismiss: () -> Unit,
    onSave: (String, String) -> Unit
) {
    var title by remember { mutableStateOf(note?.title ?: "") }
    var content by remember { mutableStateOf(note?.content ?: "") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = BgCard),
            modifier = Modifier.fillMaxWidth().padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = if (note == null) "Tạo Ghi chú học tập" else "Sửa Ghi chú học tập",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Tiêu đề ghi chú") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                )

                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = { Text("Nội dung chi tiết") },
                    modifier = Modifier.fillMaxWidth().height(120.dp),
                    shape = RoundedCornerShape(8.dp)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Hủy", color = TextSub)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (title.isNotBlank()) {
                                onSave(title, content)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Pink)
                    ) {
                        Text("Lưu", color = Color.White)
                    }
                }
            }
        }
    }
}

@Composable
fun CreateOrEditPlanDialog(
    note: SavedNote?,
    onDismiss: () -> Unit,
    onSave: (String, String, String, String, String, Boolean, String) -> Unit
) {
    val context = LocalContext.current
    var title by remember { mutableStateOf(note?.title ?: "") }
    var content by remember { mutableStateOf(note?.content ?: "") }

    val initialDate = remember(note) {
        if (note != null && !note.eventDate.isNullOrBlank()) {
            note.eventDate.substringBefore("T")
        } else {
            val c = Calendar.getInstance()
            String.format("%04d-%02d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH))
        }
    }
    val initialTime = remember(note) {
        if (note != null && !note.eventDate.isNullOrBlank()) {
            note.eventDate.substringAfter("T").substringBeforeLast(":")
        } else {
            val c = Calendar.getInstance()
            String.format("%02d:%02d", c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE))
        }
    }

    var selectedDate by remember { mutableStateOf(initialDate) }
    var selectedTime by remember { mutableStateOf(initialTime) }
    var importance by remember { mutableStateOf(note?.importance ?: "MEDIUM") }
    var hasAlarm by remember { mutableStateOf(note?.hasAlarm ?: false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = BgCard),
            modifier = Modifier.fillMaxWidth().padding(16.dp).verticalScroll(rememberScrollState())
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = if (note == null) "Lên lịch trình / Kế hoạch" else "Sửa lịch trình / Kế hoạch",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Tên kỳ thi / Kế hoạch") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                )

                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = { Text("Mô tả chi tiết") },
                    modifier = Modifier.fillMaxWidth().height(80.dp),
                    shape = RoundedCornerShape(8.dp)
                )

                Text("Chọn ngày thi / ngày học:", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextSub)
                Card(
                    modifier = Modifier.fillMaxWidth().clickable {
                        val parts = selectedDate.split("-")
                        val year = parts[0].toInt()
                        val month = parts[1].toInt() - 1
                        val day = parts[2].toInt()
                        android.app.DatePickerDialog(
                            context,
                            { _, y, m, d ->
                                selectedDate = String.format("%04d-%02d-%02d", y, m + 1, d)
                            },
                            year, month, day
                        ).show()
                    },
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, BorderDark),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(selectedDate, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Icon(Icons.Filled.DateRange, null, tint = Pink)
                    }
                }

                Text("Chọn mốc thời gian:", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextSub)
                Card(
                    modifier = Modifier.fillMaxWidth().clickable {
                        val parts = selectedTime.split(":")
                        val hour = parts[0].toInt()
                        val minute = parts[1].toInt()
                        android.app.TimePickerDialog(
                            context,
                            { _, h, m ->
                                selectedTime = String.format("%02d:%02d", h, m)
                            },
                            hour, minute, true
                        ).show()
                    },
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, BorderDark),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(selectedTime, fontWeight = FontWeight.Bold, color = TextPrimary)
                        Icon(Icons.Filled.AccessTime, null, tint = Pink)
                    }
                }

                Text("Mức độ quan trọng:", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextSub)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("HIGH", "MEDIUM", "LOW").forEach { level ->
                        val selected = importance == level
                        val levelColor = getImportanceColor(level)
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (selected) levelColor else levelColor.copy(alpha = 0.15f))
                                .border(1.5.dp, levelColor, RoundedCornerShape(8.dp))
                                .clickable { importance = level }
                                .padding(8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = when(level) {
                                    "HIGH" -> "Quan trọng"
                                    "MEDIUM" -> "Trung bình"
                                    "LOW" -> "Thấp"
                                    else -> "Trung bình"
                                },
                                color = if (selected) Color.White else levelColor,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Báo thức nhắc nhở", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                        Text("Phát thông báo đẩy đúng giờ hẹn", fontSize = 11.sp, color = TextSub)
                    }
                    Switch(
                        checked = hasAlarm,
                        onCheckedChange = { hasAlarm = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = Pink, checkedTrackColor = Pink.copy(alpha = 0.5f))
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Hủy", color = TextSub)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (title.isNotBlank()) {
                                val alarmIsoString = selectedDate + "T" + selectedTime + ":00"
                                onSave(title, content, selectedDate, selectedTime, importance, hasAlarm, alarmIsoString)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Pink)
                    ) {
                        Text("Lưu", color = Color.White)
                    }
                }
            }
        }
    }
}

private fun getImportanceColor(importance: String): Color {
    return when (importance.uppercase()) {
        "HIGH" -> Color(0xFFEF4444)
        "MEDIUM" -> Color(0xFFF97316)
        "LOW" -> Color(0xFF94A3B8)
        else -> Color(0xFF64748B)
    }
}

private fun getCountdownText(eventDateStr: String?): String {
    if (eventDateStr.isNullOrBlank()) return ""
    return try {
        val eventDateTime = java.time.LocalDateTime.parse(eventDateStr)
        val now = java.time.LocalDateTime.now()
        val daysDiff = java.time.temporal.ChronoUnit.DAYS.between(now.toLocalDate(), eventDateTime.toLocalDate())
        when {
            daysDiff < 0 -> "Đã diễn ra"
            daysDiff == 0L -> "Hôm nay"
            daysDiff == 1L -> "Ngày mai"
            else -> "Còn $daysDiff ngày"
        }
    } catch (e: Exception) {
        ""
    }
}

@Composable
fun CalendarSection(
    notes: List<SavedNote>,
    selectedCalendarDate: LocalDate?,
    onDateSelect: (LocalDate?) -> Unit
) {
    var isCalendarExpanded by remember { mutableStateOf(false) }
    var currentMonth by remember { mutableStateOf(YearMonth.now()) }
    var currentWeekDate by remember { mutableStateOf(selectedCalendarDate ?: LocalDate.now()) }

    LaunchedEffect(selectedCalendarDate) {
        if (selectedCalendarDate != null) {
            currentWeekDate = selectedCalendarDate
            currentMonth = YearMonth.from(selectedCalendarDate)
        }
    }

    val plansByDate = remember(notes) {
        notes.filter { it.type == NoteType.STUDY_PLAN }
            .mapNotNull { note ->
                try {
                    val date = LocalDateTime.parse(note.eventDate).toLocalDate()
                    date to note.importance
                } catch (e: Exception) {
                    null
                }
            }
            .groupBy({ it.first }, { it.second })
    }

    // Calculations for Month View
    val gridItems = remember(currentMonth) {
        val list = mutableListOf<LocalDate?>()
        val firstDayOfWeek = currentMonth.atDay(1).dayOfWeek.value // 1 (Mon) to 7 (Sun)
        for (i in 1 until firstDayOfWeek) {
            list.add(null)
        }
        for (d in 1..currentMonth.lengthOfMonth()) {
            list.add(currentMonth.atDay(d))
        }
        list
    }
    val rows = remember(gridItems) { gridItems.chunked(7) }

    // Calculations for Week View
    val weekDays = remember(currentWeekDate) {
        val dayOfWeek = currentWeekDate.dayOfWeek.value // 1 (Mon) to 7 (Sun)
        val monday = currentWeekDate.minusDays((dayOfWeek - 1).toLong())
        (0..6).map { monday.plusDays(it.toLong()) }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .animateContentSize(animationSpec = spring(stiffness = Spring.StiffnessLow))
            .shadow(4.dp, RoundedCornerShape(16.dp))
            .border(1.dp, BorderDark, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = BgCard),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Calendar Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = {
                    if (isCalendarExpanded) {
                        currentMonth = currentMonth.minusMonths(1)
                    } else {
                        currentWeekDate = currentWeekDate.minusWeeks(1)
                        currentMonth = YearMonth.from(currentWeekDate)
                    }
                }) {
                    Icon(Icons.Filled.ArrowBack, contentDescription = "Trước")
                }
                
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = if (isCalendarExpanded) {
                            currentMonth.format(DateTimeFormatter.ofPattern("'Tháng' MM, yyyy", java.util.Locale.forLanguageTag("vi")))
                        } else {
                            currentWeekDate.format(DateTimeFormatter.ofPattern("'Tháng' MM, yyyy", java.util.Locale.forLanguageTag("vi")))
                        },
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    if (selectedCalendarDate != null) {
                        Text(
                            text = "• Lọc: ${selectedCalendarDate.format(DateTimeFormatter.ofPattern("dd/MM"))}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Pink
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (selectedCalendarDate != null) {
                        Text(
                            text = "Hiện tất cả",
                            fontSize = 12.sp,
                            color = Pink,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier
                                .clickable {
                                    onDateSelect(null)
                                    currentWeekDate = LocalDate.now()
                                    currentMonth = YearMonth.now()
                                }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                    IconButton(onClick = { isCalendarExpanded = !isCalendarExpanded }) {
                        Icon(
                            imageVector = if (isCalendarExpanded) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                            contentDescription = if (isCalendarExpanded) "Thu gọn" else "Mở rộng",
                            tint = Pink
                        )
                    }
                    IconButton(onClick = {
                        if (isCalendarExpanded) {
                            currentMonth = currentMonth.plusMonths(1)
                        } else {
                            currentWeekDate = currentWeekDate.plusWeeks(1)
                            currentMonth = YearMonth.from(currentWeekDate)
                        }
                    }) {
                        Icon(Icons.Filled.ArrowForward, contentDescription = "Sau")
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Weekdays Headers
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                listOf("T2", "T3", "T4", "T5", "T6", "T7", "CN").forEach { day ->
                    Text(
                        text = day,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextSub,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.width(40.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Days Grid
            Column(modifier = Modifier.fillMaxWidth()) {
                if (isCalendarExpanded) {
                    rows.forEach { week ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            week.forEach { date ->
                                CalendarDayCell(
                                    date = date,
                                    isSelected = date != null && date == selectedCalendarDate,
                                    eventImportances = if (date != null) plansByDate[date] ?: emptyList() else emptyList(),
                                    onClick = {
                                        if (date != null) {
                                            onDateSelect(if (selectedCalendarDate == date) null else date)
                                        }
                                    }
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                    }
                } else {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        weekDays.forEach { date ->
                            CalendarDayCell(
                                date = date,
                                isSelected = date == selectedCalendarDate,
                                eventImportances = plansByDate[date] ?: emptyList(),
                                onClick = {
                                    onDateSelect(if (selectedCalendarDate == date) null else date)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CalendarDayCell(
    date: LocalDate?,
    isSelected: Boolean,
    eventImportances: List<String>,
    onClick: () -> Unit
) {
    if (date == null) {
        Box(modifier = Modifier.size(40.dp))
        return
    }

    val isToday = remember(date) { date == LocalDate.now() }

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier
            .size(40.dp)
            .clip(CircleShape)
            .background(
                when {
                    isSelected -> Pink
                    isToday -> Pink.copy(alpha = 0.1f)
                    else -> Color.Transparent
                }
            )
            .border(
                width = if (isToday && !isSelected) 1.dp else 0.dp,
                color = if (isToday && !isSelected) Pink else Color.Transparent,
                shape = CircleShape
            )
            .clickable { onClick() }
    ) {
        Text(
            text = date.dayOfMonth.toString(),
            fontSize = 13.sp,
            fontWeight = if (isToday || isSelected) FontWeight.Bold else FontWeight.Normal,
            color = when {
                isSelected -> Color.White
                isToday -> Pink
                else -> TextPrimary
            }
        )
        // Event indicators (dots)
        if (eventImportances.isNotEmpty()) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(2.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 2.dp)
            ) {
                eventImportances.take(3).forEach { importance ->
                    val color = when (importance.uppercase()) {
                        "HIGH" -> Color(0xFFEF4444)
                        "MEDIUM" -> Color(0xFFF97316)
                        "LOW" -> Color(0xFF94A3B8)
                        else -> Color(0xFF64748B)
                    }
                    Box(
                        modifier = Modifier
                            .size(4.dp)
                            .clip(CircleShape)
                            .background(color)
                    )
                }
            }
        } else {
            Spacer(modifier = Modifier.height(6.dp))
        }
    }
}
