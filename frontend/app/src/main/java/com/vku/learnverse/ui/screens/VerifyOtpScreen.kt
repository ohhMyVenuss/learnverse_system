package com.vku.learnverse.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vku.learnverse.ui.state.AuthUiState
import com.vku.learnverse.ui.viewmodel.AuthViewModel
import kotlinx.coroutines.delay

@Composable
fun VerifyOtpScreen(
    viewModel: AuthViewModel,
    onOtpVerified: (otp: String) -> Unit,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var otpText by remember { mutableStateOf("") }
    val focusRequester = remember { FocusRequester() }
    
    val email = viewModel.userEmail
    val uiState by viewModel.uiState.collectAsState()

    val brandPink = Color(0xFFD81B60)
    val brandPurple = Color(0xFF8E24AA)

    // Auto-focus keyboard on screen load
    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }

    // Timer countdown logic
    var timeLeft by remember { mutableStateOf(58) }
    LaunchedEffect(timeLeft) {
        if (timeLeft > 0) {
            delay(1000L)
            timeLeft--
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFFAF9FF))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Top
    ) {
        // Back Button
        Spacer(modifier = Modifier.height(16.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Start
        ) {
            IconButton(onClick = onBackClick) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = brandPurple
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Logo
        AppLogo()

        Spacer(modifier = Modifier.height(24.dp))

        // Title & Subtitle
        Text(
            text = "Verify Email",
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = brandPink
        )
        Text(
            text = "We've sent a 6-digit verification code to\n$email.",
            fontSize = 14.sp,
            color = Color(0xFF6B7280),
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 8.dp, start = 16.dp, end = 16.dp)
        )

        Spacer(modifier = Modifier.height(48.dp))

        // 6 OTP Digit Box containers
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { focusRequester.requestFocus() },
            contentAlignment = Alignment.Center
        ) {
            // Hidden text field to capture keyboard input
            BasicTextField(
                value = otpText,
                onValueChange = {
                    if (it.length <= 6) {
                        otpText = it
                    }
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .alpha(0.01f) // almost invisible
                    .focusRequester(focusRequester)
            )

            // Visual representation of the 6 digits
            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterHorizontally),
                modifier = Modifier.fillMaxWidth()
            ) {
                for (i in 0 until 6) {
                    val char = when {
                        i < otpText.length -> otpText[i].toString()
                        else -> ""
                    }
                    val isFocused = otpText.length == i

                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .border(
                                width = if (isFocused) 2.dp else 1.dp,
                                color = if (isFocused) brandPurple else Color(0xFFE5E7EB),
                                shape = RoundedCornerShape(12.dp)
                            )
                            .background(Color.White, shape = RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = char,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1F2937)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(36.dp))

        // UI Error feedback
        if (uiState is AuthUiState.Error) {
            Text(
                text = (uiState as AuthUiState.Error).error,
                color = Color.Red,
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(bottom = 12.dp)
            )
        }

        // Verify Button
        Button(
            onClick = {
                viewModel.verifyOtp(otpText) {
                    onOtpVerified(otpText)
                }
            },
            enabled = uiState !is AuthUiState.Loading && otpText.length == 6,
            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .background(
                    if (otpText.length == 6 && uiState !is AuthUiState.Loading) {
                        Brush.linearGradient(colors = listOf(brandPurple, brandPink))
                    } else {
                        Brush.linearGradient(colors = listOf(Color(0xFFE5E7EB), Color(0xFFE5E7EB)))
                    },
                    shape = RoundedCornerShape(16.dp)
                )
        ) {
            if (uiState is AuthUiState.Loading) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
            } else {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "Verify & Continue",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.size(8.dp))
                    Icon(
                        imageVector = Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = Color.White
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Countdown Timer & Resend
        Text(
            text = "Resend code in 00:${String.format("%02d", timeLeft)}",
            fontSize = 14.sp,
            color = Color(0xFF6B7280),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Resend Code",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = if (timeLeft == 0) brandPink else Color(0xFF9CA3AF),
            modifier = Modifier.clickable(enabled = timeLeft == 0) {
                // Request code again
                viewModel.forgotPassword(email)
                timeLeft = 59
            }
        )
    }
}
