package com.vku.learnverse.data.repository

import androidx.compose.ui.graphics.Color
import com.vku.learnverse.data.model.Achievement
import com.vku.learnverse.data.model.CourseSummary
import com.vku.learnverse.data.model.LeaderboardEntry
import com.vku.learnverse.data.model.LearningActivity
import com.vku.learnverse.data.model.LearningActivityType
import com.vku.learnverse.data.model.UserProfileSummary
import java.time.LocalDate

object DemoLearnVerseRepository {
    val leaderboard = listOf(
        LeaderboardEntry(
            id = 1,
            fullName = "Alex Mercer",
            xp = 10_250,
            rank = 1,
            avatarColors = listOf(Color(0xFF213547), Color(0xFF9BC2C7))
        ),
        LeaderboardEntry(
            id = 2,
            fullName = "Sarah Johnson",
            xp = 8_420,
            rank = 2,
            avatarColors = listOf(Color(0xFFD49A71), Color(0xFFFFE1C7))
        ),
        LeaderboardEntry(
            id = 3,
            fullName = "Elena Rossi",
            xp = 7_900,
            rank = 3,
            avatarColors = listOf(Color(0xFFB95C78), Color(0xFFFFD9E3))
        ),
        LeaderboardEntry(
            id = 4,
            fullName = "David Kim",
            xp = 7_120,
            rank = 4,
            avatarColors = listOf(Color(0xFF365B57), Color(0xFFB6DDD5))
        ),
        LeaderboardEntry(
            id = 5,
            fullName = "Mia Tran",
            xp = 6_850,
            rank = 5,
            avatarColors = listOf(Color(0xFF3F6677), Color(0xFFCDE8EF))
        ),
        LeaderboardEntry(
            id = 6,
            fullName = "James Lee",
            xp = 6_300,
            rank = 6,
            avatarColors = listOf(Color(0xFF6E7FA5), Color(0xFFDCE6FF))
        ),
        LeaderboardEntry(
            id = 7,
            fullName = "Linh Nguyễn",
            xp = 5_940,
            rank = 7,
            avatarColors = listOf(Color(0xFF71598C), Color(0xFFE6D7F5))
        ),
        LeaderboardEntry(
            id = 8,
            fullName = "Noah Chen",
            xp = 5_610,
            rank = 8,
            avatarColors = listOf(Color(0xFF7F5C45), Color(0xFFF1D2B9))
        )
    )

    val profile = UserProfileSummary(
        id = 1,
        fullName = "Alex Mercer",
        scholarTitle = "Học giả cao cấp",
        level = 42,
        hearts = 3,
        coursesCompleted = 14,
        dayStreak = 28,
        totalXp = 12_500,
        globalRankPercent = 5,
        avatarColors = listOf(Color(0xFF1F3443), Color(0xFFBED7D7))
    )

    val activities: List<LearningActivity> = buildList {
        val today = LocalDate.now()
        var id = 1L
        for (daysAgo in 0..29) {
            val date = today.minusDays(daysAgo.toLong())
            if (daysAgo % 6 != 5 && daysAgo !in setOf(12, 19, 26)) {
                val type = when {
                    daysAgo % 9 == 0 -> LearningActivityType.STREAK_REACHED
                    daysAgo % 5 == 0 -> LearningActivityType.COURSE_ENROLLED
                    daysAgo % 2 == 0 -> LearningActivityType.QUIZ_COMPLETED
                    else -> LearningActivityType.LESSON_COMPLETED
                }
                val activity = when (type) {
                    LearningActivityType.QUIZ_COMPLETED -> LearningActivity(
                        id++,
                        date,
                        type,
                        "Hoàn thành bài kiểm tra",
                        if (daysAgo % 4 == 0) "Kotlin cơ bản · 9/10 điểm" else "UI/UX nhập môn · 8/10 điểm",
                        120 + (daysAgo % 3) * 20,
                        3
                    )

                    LearningActivityType.LESSON_COMPLETED -> LearningActivity(
                        id++,
                        date,
                        type,
                        "Học xong một bài mới",
                        if (daysAgo % 3 == 0) "Jetpack Compose Layout" else "Spring Boot REST API",
                        60,
                        2
                    )

                    LearningActivityType.COURSE_ENROLLED -> LearningActivity(
                        id++,
                        date,
                        type,
                        "Bắt đầu khóa học",
                        "Android hiện đại với Kotlin",
                        25,
                        1
                    )

                    LearningActivityType.STREAK_REACHED -> LearningActivity(
                        id++,
                        date,
                        type,
                        "Giữ vững chuỗi học",
                        "${28 - daysAgo} ngày học liên tiếp",
                        80,
                        4
                    )
                }
                add(activity)

                if (daysAgo % 7 == 0) {
                    add(
                        LearningActivity(
                            id++,
                            date,
                            LearningActivityType.LESSON_COMPLETED,
                            "Ôn tập kiến thức",
                            "Flashcard và ghi chú cá nhân",
                            35,
                            1
                        )
                    )
                }
            }
        }
    }.sortedByDescending { it.date }

    val achievements = listOf(
        Achievement(
            "Tia chớp",
            "Hoàn thành 5 quiz dưới 2 phút",
            "⚡",
            listOf(Color(0xFF7544E0), Color(0xFFC21875))
        ),
        Achievement(
            "Bền bỉ",
            "Học liên tục trong 21 ngày",
            "🔥",
            listOf(Color(0xFFFF8A65), Color(0xFFD81935))
        ),
        Achievement(
            "Điểm tuyệt đối",
            "Đạt 10/10 trong một bài quiz",
            "★",
            listOf(Color(0xFFFFC857), Color(0xFFFF8F3D))
        )
    )

    private val courseColors = listOf(
        listOf(Color(0xFF7348DE), Color(0xFFC51A78)),
        listOf(Color(0xFF2878C8), Color(0xFF58B4C9)),
        listOf(Color(0xFFF08B45), Color(0xFFE44C6A)),
        listOf(Color(0xFF345D61), Color(0xFF69A98E)),
        listOf(Color(0xFF614A9F), Color(0xFF9684DA))
    )

    val demoCourses = listOf(
        CourseSummary(
            id = 1,
            title = "Java cơ bản",
            description = "Nắm chắc cú pháp Java và lập trình hướng đối tượng từ con số 0.",
            price = 2_000.0,
            thumbnail = null,
            category = "Lập trình",
            level = "Cơ bản",
            overview = "Lộ trình thực hành Java ngắn gọn, dễ theo dõi, phù hợp cho người mới bắt đầu.",
            includes = listOf("7 bài học thực hành", "Code mẫu", "Chứng nhận hoàn thành"),
            instructorName = "TS. Nguyễn Văn An",
            rating = 4.9,
            studentCount = 1_284,
            durationHours = 8,
            accentColors = courseColors[0]
        ),
        CourseSummary(
            id = 2,
            title = "Python cho người mới",
            description = "Học Python qua ví dụ thực tế và xây dựng ứng dụng đầu tiên.",
            price = 2_200.0,
            thumbnail = null,
            category = "Lập trình",
            level = "Cơ bản",
            overview = "Từ biến, vòng lặp đến xử lý dữ liệu và dự án Python hoàn chỉnh.",
            includes = listOf("Video HD", "Bài tập cuối chương", "Tài liệu PDF"),
            instructorName = "Đội ngũ LearnVerse",
            rating = 4.8,
            studentCount = 936,
            durationHours = 7,
            accentColors = courseColors[1]
        ),
        CourseSummary(
            id = 3,
            title = "Thiết kế REST API",
            description = "Xây dựng API rõ ràng, an toàn và dễ mở rộng với Spring Boot.",
            price = 2_500.0,
            thumbnail = null,
            category = "Backend",
            level = "Nâng cao",
            overview = "Học cách thiết kế resource, xác thực JWT, validation và xử lý lỗi chuẩn.",
            includes = listOf("Dự án REST API", "Source code", "Checklist production"),
            instructorName = "TS. Nguyễn Văn An",
            rating = 4.9,
            studentCount = 742,
            durationHours = 10,
            accentColors = courseColors[2]
        ),
        CourseSummary(
            id = 4,
            title = "HTML & CSS Foundation",
            description = "Tự tay xây dựng giao diện responsive đẹp trên mọi thiết bị.",
            price = 2_100.0,
            thumbnail = null,
            category = "Web",
            level = "Cơ bản",
            overview = "Làm chủ HTML semantic, Flexbox, Grid và responsive design.",
            includes = listOf("5 mini project", "Template giao diện", "Chứng nhận"),
            instructorName = "Đội ngũ LearnVerse",
            rating = 4.7,
            studentCount = 1_560,
            durationHours = 6,
            accentColors = courseColors[3]
        )
    )
}
