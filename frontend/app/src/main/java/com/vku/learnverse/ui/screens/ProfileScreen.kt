package com.vku.learnverse.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.material.icons.automirrored.rounded.MenuBook
import androidx.compose.material.icons.automirrored.rounded.TrendingUp
import androidx.compose.material.icons.rounded.AddCircle
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Favorite
import androidx.compose.material.icons.rounded.LocalFireDepartment
import androidx.compose.material.icons.rounded.Public
import androidx.compose.material.icons.rounded.School
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material.icons.rounded.WorkspacePremium
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vku.learnverse.LearnverseApplication
import com.vku.learnverse.data.model.Achievement
import com.vku.learnverse.data.model.LearningActivity
import com.vku.learnverse.data.model.LearningActivityType
import com.vku.learnverse.data.model.UserProfileSummary
import com.vku.learnverse.data.repository.DemoLearnVerseRepository
import com.vku.learnverse.ui.components.GradientAvatar
import com.vku.learnverse.ui.components.LearnVerseHeader
import com.vku.learnverse.ui.components.softCard
import com.vku.learnverse.ui.theme.BlueMist
import com.vku.learnverse.ui.theme.Ink
import com.vku.learnverse.ui.theme.InkSoft
import com.vku.learnverse.ui.theme.LearnVersePink
import com.vku.learnverse.ui.theme.LearnVersePurple
import com.vku.learnverse.ui.theme.LearnVerseRed
import com.vku.learnverse.ui.theme.PeachMist
import com.vku.learnverse.ui.theme.PinkMist
import com.vku.learnverse.ui.theme.ProfileBackground
import com.vku.learnverse.ui.theme.PurpleMist
import com.vku.learnverse.ui.theme.SurfaceWhite
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun ProfileScreen(
    onLogOutClick: () -> Unit
) {
    val context = LocalContext.current
    val authRepository = remember {
        (context.applicationContext as LearnverseApplication).container.authRepository
    }

    var profile by remember { mutableStateOf(DemoLearnVerseRepository.profile) }
    val activities = DemoLearnVerseRepository.activities

    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            authRepository.getMyProfile()
        }.onSuccess { profileDto ->
            profile = UserProfileSummary(
                id = profileDto.id,
                fullName = profileDto.user.fullName ?: "Học viên",
                scholarTitle = "Học giả LearnVerse",
                level = 42,
                hearts = 3,
                coursesCompleted = 14,
                dayStreak = 28,
                totalXp = 12_500,
                globalRankPercent = 5,
                avatarColors = listOf(Color(0xFF1F3443), Color(0xFFBED7D7))
            )
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ProfileBackground)
            .testTag("profile_screen"),
        contentPadding = PaddingValues(bottom = 32.dp)
    ) {
        item { LearnVerseHeader(hearts = profile.hearts) }
        item { ProfileHero(profile) }
        item {
            WalletCard(
                hearts = profile.hearts,
                modifier = Modifier.padding(horizontal = 20.dp)
            )
        }
        item {
            SectionTitle(
                title = "Hành trình học tập",
                modifier = Modifier.padding(top = 28.dp)
            )
        }
        item {
            StatisticsGrid(profile)
        }
        item {
            SectionTitle(
                title = "Hoạt động 30 ngày qua",
                action = "Xem chi tiết",
                modifier = Modifier.padding(top = 28.dp)
            )
        }
        item {
            MonthlyActivityCard(
                activities = activities,
                modifier = Modifier
                    .padding(horizontal = 20.dp)
                    .testTag("monthly_activity_card")
            )
        }
        item {
            SectionTitle(
                title = "Hoạt động gần đây",
                modifier = Modifier.padding(top = 26.dp)
            )
        }
        items(
            items = activities.take(4),
            key = { "activity_${it.id}" }
        ) { activity ->
            RecentActivityRow(
                activity = activity,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 6.dp)
            )
        }
        item {
            SectionTitle(
                title = "Thành tựu",
                action = "Xem tất cả",
                modifier = Modifier.padding(top = 28.dp)
            )
        }
        item {
            AchievementsRow(DemoLearnVerseRepository.achievements)
        }
        item {
            PremiumCard(
                modifier = Modifier.padding(
                    start = 20.dp,
                    top = 28.dp,
                    end = 20.dp,
                    bottom = 14.dp
                )
            )
        }
        item {
            Button(
                onClick = {
                    authRepository.clearToken()
                    onLogOutClick()
                },
                colors = ButtonDefaults.buttonColors(containerColor = LearnVerseRed),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 14.dp)
                    .height(54.dp),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(
                    text = "Đăng xuất",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }
        }
    }
}

@Composable
private fun ProfileHero(profile: UserProfileSummary) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                Brush.verticalGradient(
                    listOf(Color(0xFFF2E6ED), ProfileBackground)
                )
            )
            .padding(top = 42.dp, bottom = 22.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        GradientAvatar(
            initials = profile.initials,
            colors = profile.avatarColors,
            size = 126,
            borderWidth = 4
        )
        Spacer(Modifier.height(15.dp))
        Text(
            text = profile.fullName,
            style = MaterialTheme.typography.headlineMedium,
            color = Ink,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.height(2.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Rounded.Star,
                contentDescription = null,
                tint = LearnVersePurple,
                modifier = Modifier.size(17.dp)
            )
            Spacer(Modifier.width(5.dp))
            Text(
                text = "${profile.scholarTitle} · Cấp ${profile.level}",
                style = MaterialTheme.typography.labelLarge,
                color = LearnVersePurple
            )
        }
    }
}

@Composable
private fun WalletCard(
    hearts: Int,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .softCard(cornerRadius = 14, elevation = 5)
            .padding(horizontal = 20.dp, vertical = 22.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(50.dp)
                .clip(CircleShape)
                .background(Color(0xFFFFEAEA)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Rounded.Favorite,
                contentDescription = null,
                tint = Color(0xFFD51E32),
                modifier = Modifier.size(25.dp)
            )
        }
        Spacer(Modifier.width(13.dp))
        Column(Modifier.weight(1f)) {
            Text(
                text = "VÍ CỦA TÔI",
                style = MaterialTheme.typography.labelLarge,
                color = InkSoft
            )
            Text(
                text = "Số mạng còn lại",
                style = MaterialTheme.typography.bodyLarge,
                color = Ink
            )
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = hearts.toString(),
                    style = MaterialTheme.typography.headlineMedium,
                    color = Ink
                )
                Spacer(Modifier.width(6.dp))
                Icon(
                    imageVector = Icons.Rounded.Favorite,
                    contentDescription = null,
                    tint = Color(0xFFFF3E66),
                    modifier = Modifier.size(30.dp)
                )
            }
            Text(
                text = "Nạp ngay",
                style = MaterialTheme.typography.labelMedium,
                color = LearnVersePink,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun StatisticsGrid(profile: UserProfileSummary) {
    Column(
        modifier = Modifier.padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            StatisticCard(
                icon = Icons.Rounded.School,
                iconBackground = PurpleMist,
                iconColor = LearnVersePurple,
                value = profile.coursesCompleted.toString(),
                label = "KHÓA HỌC\nHOÀN THÀNH",
                modifier = Modifier.weight(1f)
            )
            StatisticCard(
                icon = Icons.Rounded.LocalFireDepartment,
                iconBackground = PeachMist,
                iconColor = Color(0xFFF59D38),
                value = profile.dayStreak.toString(),
                label = "NGÀY HỌC\nLIÊN TIẾP",
                modifier = Modifier.weight(1f)
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            StatisticCard(
                icon = Icons.AutoMirrored.Rounded.TrendingUp,
                iconBackground = PinkMist,
                iconColor = LearnVersePink,
                value = "${String.format(Locale.US, "%.1f", profile.totalXp / 1000f)}k",
                label = "TỔNG XP\nĐÃ NHẬN",
                modifier = Modifier.weight(1f)
            )
            StatisticCard(
                icon = Icons.Rounded.Public,
                iconBackground = Color(0xFFE7E7E7),
                iconColor = Color(0xFF676767),
                value = "Top ${profile.globalRankPercent}%",
                label = "XẾP HẠNG\nTOÀN CẦU",
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun StatisticCard(
    icon: ImageVector,
    iconBackground: Color,
    iconColor: Color,
    value: String,
    label: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .height(158.dp)
            .softCard(cornerRadius = 13, elevation = 4)
            .padding(14.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(43.dp)
                .clip(CircleShape)
                .background(iconBackground),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconColor,
                modifier = Modifier.size(23.dp)
            )
        }
        Spacer(Modifier.height(10.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge,
            color = Ink
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = InkSoft,
            textAlign = TextAlign.Center,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun SectionTitle(
    title: String,
    modifier: Modifier = Modifier,
    action: String? = null
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = Ink
        )
        if (action != null) {
            Text(
                text = action,
                style = MaterialTheme.typography.labelMedium,
                color = LearnVersePink,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun MonthlyActivityCard(
    activities: List<LearningActivity>,
    modifier: Modifier = Modifier
) {
    val today = LocalDate.now()
    val startDate = today.minusDays(29)
    val activityByDate = activities.groupBy { it.date }
    val days = (0..29).map { startDate.plusDays(it.toLong()) }
    val totalXp = activities.sumOf { it.xpEarned }
    val activeDays = activityByDate.keys.count { it in startDate..today }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .softCard(cornerRadius = 16, elevation = 5)
            .padding(18.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Tháng này",
                    style = MaterialTheme.typography.titleMedium,
                    color = Ink
                )
                Text(
                    text = "$activeDays ngày hoạt động",
                    style = MaterialTheme.typography.bodyMedium,
                    color = InkSoft
                )
            }
            Row(
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Color(0xFFFFE8F1))
                    .padding(horizontal = 11.dp, vertical = 7.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Rounded.TrendingUp,
                    contentDescription = null,
                    tint = LearnVersePink,
                    modifier = Modifier.size(17.dp)
                )
                Spacer(Modifier.width(4.dp))
                Text(
                    text = "+${formatXp(totalXp)} XP",
                    style = MaterialTheme.typography.labelMedium,
                    color = LearnVersePink,
                    fontWeight = FontWeight.Bold
                )
            }
        }
        Spacer(Modifier.height(20.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            days.chunked(6).forEach { week ->
                Column(
                    verticalArrangement = Arrangement.spacedBy(7.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    week.forEach { date ->
                        val dayActivities = activityByDate[date].orEmpty()
                        ActivityDay(
                            day = date.dayOfMonth,
                            intensity = dayActivities.maxOfOrNull { it.intensity } ?: 0
                        )
                    }
                }
            }
        }
        Spacer(Modifier.height(17.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "Ít",
                    style = MaterialTheme.typography.labelMedium,
                    color = InkSoft
                )
                Spacer(Modifier.width(7.dp))
                (0..4).forEach { intensity ->
                    Box(
                        modifier = Modifier
                            .padding(end = 4.dp)
                            .size(12.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(activityColor(intensity))
                    )
                }
                Text(
                    text = "Nhiều",
                    style = MaterialTheme.typography.labelMedium,
                    color = InkSoft
                )
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Rounded.CalendarMonth,
                    contentDescription = null,
                    tint = LearnVersePurple,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(Modifier.width(4.dp))
                Text(
                    text = "30 ngày",
                    style = MaterialTheme.typography.labelMedium,
                    color = LearnVersePurple
                )
            }
        }
    }
}

@Composable
private fun ActivityDay(
    day: Int,
    intensity: Int
) {
    Box(
        modifier = Modifier
            .size(39.dp)
            .clip(RoundedCornerShape(9.dp))
            .background(activityColor(intensity)),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = day.toString(),
            style = MaterialTheme.typography.labelMedium,
            color = if (intensity >= 3) Color.White else InkSoft,
            fontWeight = if (intensity > 0) FontWeight.Bold else FontWeight.Normal
        )
    }
}

private fun activityColor(intensity: Int): Color = when (intensity) {
    1 -> Color(0xFFF7CFE0)
    2 -> Color(0xFFECA2C3)
    3 -> Color(0xFFD75A99)
    4 -> LearnVersePink
    else -> Color(0xFFF1EDF2)
}

@Composable
private fun RecentActivityRow(
    activity: LearningActivity,
    modifier: Modifier = Modifier
) {
    val visual = when (activity.type) {
        LearningActivityType.QUIZ_COMPLETED ->
            Triple(Icons.Rounded.CheckCircle, Color(0xFFE1F5EC), Color(0xFF2E9B71))

        LearningActivityType.LESSON_COMPLETED ->
            Triple(Icons.AutoMirrored.Rounded.MenuBook, BlueMist, Color(0xFF5279CE))

        LearningActivityType.COURSE_ENROLLED ->
            Triple(Icons.Rounded.AddCircle, PurpleMist, LearnVersePurple)

        LearningActivityType.STREAK_REACHED ->
            Triple(Icons.Rounded.LocalFireDepartment, PeachMist, Color(0xFFF08A35))
    }

    Row(
        modifier = modifier
            .fillMaxWidth()
            .softCard(cornerRadius = 14, elevation = 3)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(visual.second),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = visual.first,
                contentDescription = null,
                tint = visual.third,
                modifier = Modifier.size(23.dp)
            )
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(
                text = activity.title,
                style = MaterialTheme.typography.labelLarge,
                color = Ink,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = activity.detail,
                style = MaterialTheme.typography.bodyMedium,
                color = InkSoft,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = displayDate(activity.date),
                style = MaterialTheme.typography.labelMedium,
                color = Color(0xFF8C8490)
            )
        }
        Text(
            text = "+${activity.xpEarned} XP",
            style = MaterialTheme.typography.labelMedium,
            color = LearnVersePink,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun AchievementsRow(achievements: List<Achievement>) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 20.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(achievements, key = { it.title }) { achievement ->
            AchievementCard(achievement)
        }
    }
}

@Composable
private fun AchievementCard(achievement: Achievement) {
    Column(
        modifier = Modifier
            .width(186.dp)
            .height(158.dp)
            .softCard(cornerRadius = 14, elevation = 4)
            .padding(16.dp),
        horizontalAlignment = Alignment.Start
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .shadow(5.dp, RoundedCornerShape(12.dp))
                .clip(RoundedCornerShape(12.dp))
                .background(Brush.linearGradient(achievement.colors)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = achievement.icon,
                color = Color.White,
                fontSize = 25.sp
            )
        }
        Spacer(Modifier.height(10.dp))
        Text(
            text = achievement.title,
            style = MaterialTheme.typography.titleMedium,
            color = Ink
        )
        Text(
            text = achievement.description,
            style = MaterialTheme.typography.labelMedium,
            color = InkSoft,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
private fun PremiumCard(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .shadow(12.dp, RoundedCornerShape(16.dp))
            .clip(RoundedCornerShape(16.dp))
            .background(
                Brush.horizontalGradient(
                    listOf(Color(0xFF7149DE), Color(0xFFC51477))
                )
            )
            .padding(horizontal = 22.dp, vertical = 27.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Rounded.WorkspacePremium,
            contentDescription = null,
            tint = Color(0xFFFFD96A),
            modifier = Modifier.size(34.dp)
        )
        Spacer(Modifier.height(6.dp))
        Text(
            text = "Nâng cấp Premium",
            style = MaterialTheme.typography.titleLarge,
            color = Color.White
        )
        Text(
            text = "Mở khóa trái tim không giới hạn, học không quảng cáo và nhận trợ giảng AI cá nhân.",
            style = MaterialTheme.typography.bodyLarge,
            color = Color.White.copy(alpha = 0.92f),
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 5.dp)
        )
        Spacer(Modifier.height(18.dp))
        Button(
            onClick = { },
            colors = ButtonDefaults.buttonColors(
                containerColor = SurfaceWhite,
                contentColor = LearnVersePink
            ),
            shape = CircleShape,
            contentPadding = PaddingValues(horizontal = 25.dp, vertical = 12.dp)
        ) {
            Text(
                text = "Dùng thử miễn phí 7 ngày",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

private fun displayDate(date: LocalDate): String {
    val today = LocalDate.now()
    return when (date) {
        today -> "Hôm nay"
        today.minusDays(1) -> "Hôm qua"
        else -> date.format(DateTimeFormatter.ofPattern("dd 'tháng' MM", Locale.forLanguageTag("vi-VN")))
    }
}

private fun formatXp(xp: Int): String = String.format(Locale.US, "%,d", xp)
