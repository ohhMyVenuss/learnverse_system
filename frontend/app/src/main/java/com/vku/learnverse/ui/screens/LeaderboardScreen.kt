package com.vku.learnverse.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.EmojiEvents
import androidx.compose.material.icons.rounded.KeyboardArrowUp
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vku.learnverse.data.model.LeaderboardEntry
import com.vku.learnverse.data.repository.DemoLearnVerseRepository
import com.vku.learnverse.ui.components.GradientAvatar
import com.vku.learnverse.ui.components.LearnVerseHeader
import com.vku.learnverse.ui.components.softCard
import com.vku.learnverse.ui.theme.AppBackground
import com.vku.learnverse.ui.theme.Ink
import com.vku.learnverse.ui.theme.InkSoft
import com.vku.learnverse.ui.theme.LearnVersePink
import com.vku.learnverse.ui.theme.LearnVersePurple
import java.util.Locale

import androidx.compose.ui.platform.LocalContext
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.LaunchedEffect
import com.vku.learnverse.LearnverseApplication
import com.vku.learnverse.data.PointsManager

@Composable
fun LeaderboardScreen() {
    val context = LocalContext.current
    val authRepository = remember {
        (context.applicationContext as LearnverseApplication).container.authRepository
    }

    var userName by remember { mutableStateOf("Bạn") }

    LaunchedEffect(Unit) {
        kotlin.runCatching {
            authRepository.getMyProfile()
        }.onSuccess { result ->
            result.onSuccess { profileDto ->
                profileDto.user.fullName?.let { name ->
                    userName = name
                }
            }
        }
    }

    val leaders = remember(userName) {
        PointsManager.getLeaderboard(context, userName)
    }

    val userRank = remember(leaders, userName) {
        leaders.find { it.fullName == userName || (userName == "Bạn" && it.fullName == "Bạn") }?.rank ?: 1
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(AppBackground)
            .testTag("leaderboard_screen"),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 28.dp)
    ) {
        item {
            LearnVerseHeader(hearts = DemoLearnVerseRepository.profile.hearts)
        }
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 30.dp, start = 20.dp, end = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Rounded.EmojiEvents,
                    contentDescription = null,
                    tint = Color(0xFFF4B942),
                    modifier = Modifier.size(28.dp)
                )
                Spacer(Modifier.height(5.dp))
                Text(
                    text = "Bảng xếp hạng tuần",
                    style = MaterialTheme.typography.headlineMedium,
                    color = Ink,
                    textAlign = TextAlign.Center
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    text = "Những học viên nổi bật nhất tuần này.\nCùng nhau tiến bộ nhé!",
                    style = MaterialTheme.typography.bodyLarge,
                    color = InkSoft,
                    textAlign = TextAlign.Center
                )
            }
        }
        item {
            Podium(
                first = leaders[0],
                second = leaders[1],
                third = leaders[2],
                modifier = Modifier.padding(top = 24.dp)
            )
        }
        item {
            Row(
                modifier = Modifier
                    .padding(horizontal = 20.dp, vertical = 18.dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0xFFF1ECFF))
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Rounded.KeyboardArrowUp,
                    contentDescription = null,
                    tint = LearnVersePurple,
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(Color.White)
                        .padding(3.dp)
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    text = "Bạn đang xếp hạng thứ $userRank trong tuần này",
                    style = MaterialTheme.typography.labelLarge,
                    color = LearnVersePurple
                )
            }
        }
        items(
            items = leaders.drop(3),
            key = { it.id }
        ) { entry ->
            LeaderboardRow(entry)
        }
    }
}

@Composable
private fun Podium(
    first: LeaderboardEntry,
    second: LeaderboardEntry,
    third: LeaderboardEntry,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(244.dp)
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.Bottom
    ) {
        PodiumEntry(
            entry = second,
            avatarSize = 64,
            cardHeight = 104,
            colors = listOf(Color(0xFFF2E6FF), Color(0xFFCAA4FF)),
            modifier = Modifier.width(104.dp)
        )
        PodiumEntry(
            entry = first,
            avatarSize = 82,
            cardHeight = 134,
            colors = listOf(Color(0xFFFFE6EE), Color(0xFFFFA9C5)),
            modifier = Modifier.width(114.dp)
        )
        PodiumEntry(
            entry = third,
            avatarSize = 64,
            cardHeight = 92,
            colors = listOf(Color(0xFFF2F6FF), Color(0xFFC7D8FB)),
            modifier = Modifier.width(104.dp)
        )
    }
}

@Composable
private fun PodiumEntry(
    entry: LeaderboardEntry,
    avatarSize: Int,
    cardHeight: Int,
    colors: List<Color>,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box {
            GradientAvatar(
                initials = entry.initials,
                colors = entry.avatarColors,
                size = avatarSize
            )
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .size(if (entry.rank == 1) 31.dp else 27.dp)
                    .shadow(4.dp, CircleShape)
                    .clip(CircleShape)
                    .background(
                        when (entry.rank) {
                            1 -> LearnVersePink
                            2 -> LearnVersePurple
                            else -> Color(0xFF55515A)
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = entry.rank.toString(),
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }
        }
        Spacer(Modifier.height(7.dp))
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .height(cardHeight.dp)
                .shadow(9.dp, RoundedCornerShape(topStart = 14.dp, topEnd = 14.dp))
                .background(
                    Brush.verticalGradient(colors),
                    RoundedCornerShape(topStart = 14.dp, topEnd = 14.dp)
                )
                .padding(horizontal = 8.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = entry.fullName.substringBefore(" "),
                style = MaterialTheme.typography.labelLarge,
                color = Ink,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = "${formatXp(entry.xp)} XP",
                style = MaterialTheme.typography.labelLarge,
                color = if (entry.rank == 3) InkSoft else LearnVersePink,
                maxLines = 1
            )
        }
    }
}

@Composable
private fun LeaderboardRow(entry: LeaderboardEntry) {
    Row(
        modifier = Modifier
            .padding(horizontal = 20.dp, vertical = 7.dp)
            .fillMaxWidth()
            .softCard(cornerRadius = 14, elevation = 4)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = entry.rank.toString(),
            color = InkSoft,
            style = MaterialTheme.typography.labelLarge,
            modifier = Modifier.width(28.dp)
        )
        GradientAvatar(
            initials = entry.initials,
            colors = entry.avatarColors,
            size = 42,
            borderWidth = 2
        )
        Spacer(Modifier.width(14.dp))
        Text(
            text = entry.fullName,
            color = Ink,
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.weight(1f),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
        Text(
            text = "${formatXp(entry.xp)} XP",
            color = LearnVersePurple,
            style = MaterialTheme.typography.labelLarge
        )
    }
}

private fun formatXp(xp: Int): String = String.format(Locale.US, "%,d", xp)
