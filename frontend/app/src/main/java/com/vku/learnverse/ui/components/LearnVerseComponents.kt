package com.vku.learnverse.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Favorite
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vku.learnverse.ui.theme.Ink
import com.vku.learnverse.ui.theme.LearnVersePink
import com.vku.learnverse.ui.theme.SurfaceWhite

@Composable
fun LearnVerseHeader(
    hearts: Int,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(64.dp)
            .background(SurfaceWhite.copy(alpha = 0.94f))
            .padding(horizontal = 20.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "LearnVerse",
            color = LearnVersePink,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Row(
            modifier = Modifier
                .clip(CircleShape)
                .background(Color(0xFFE8EFFD))
                .padding(horizontal = 13.dp, vertical = 7.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = hearts.toString(),
                color = Ink,
                style = MaterialTheme.typography.labelLarge
            )
            Spacer(Modifier.width(5.dp))
            Icon(
                imageVector = Icons.Rounded.Favorite,
                contentDescription = "$hearts mạng còn lại",
                tint = Color(0xFFFF4C78),
                modifier = Modifier.size(18.dp)
            )
        }
    }
}

@Composable
fun GradientAvatar(
    initials: String,
    colors: List<Color>,
    size: Int,
    modifier: Modifier = Modifier,
    borderWidth: Int = 3
) {
    Box(
        modifier = modifier
            .size(size.dp)
            .shadow(8.dp, CircleShape, ambientColor = colors.firstOrNull()?.copy(alpha = 0.24f) ?: Color.Black.copy(alpha = 0.24f))
            .clip(CircleShape)
            .background(
                Brush.linearGradient(
                    colors = colors.ifEmpty {
                        listOf(Color(0xFF506477), Color(0xFFDCE7EA))
                    }
                )
            )
            .border(borderWidth.dp, SurfaceWhite, CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .size((size * 0.62f).dp)
                .clip(CircleShape)
                .background(SurfaceWhite.copy(alpha = 0.15f))
        )
        Text(
            text = initials,
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = (size * 0.23f).sp
        )
    }
}

fun Modifier.softCard(
    cornerRadius: Int = 16,
    elevation: Int = 6
): Modifier = this
    .shadow(
        elevation = elevation.dp,
        shape = RoundedCornerShape(cornerRadius.dp),
        ambientColor = Color(0xFF73566A).copy(alpha = 0.10f),
        spotColor = Color(0xFF73566A).copy(alpha = 0.10f)
    )
    .clip(RoundedCornerShape(cornerRadius.dp))
    .background(SurfaceWhite)
