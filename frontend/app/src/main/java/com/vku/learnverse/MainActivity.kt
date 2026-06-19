package com.vku.learnverse

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.vku.learnverse.ui.screens.HomeScreen
import com.vku.learnverse.ui.screens.CourseStudyWorkspace
import com.vku.learnverse.ui.screens.ForgotPasswordScreen
import com.vku.learnverse.ui.screens.ResetPasswordScreen
import com.vku.learnverse.ui.screens.SignInScreen
import com.vku.learnverse.ui.screens.SignUpScreen
import com.vku.learnverse.ui.screens.VerifyOtpScreen
import com.vku.learnverse.ui.screens.WelcomeScreen
import com.vku.learnverse.ui.theme.LearnverseTheme
import com.vku.learnverse.ui.viewmodel.AuthViewModel

class MainActivity : ComponentActivity() {

    private val authViewModel: AuthViewModel by viewModels { AuthViewModel.Factory }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LearnverseTheme {
                val navController = rememberNavController()
                
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = "welcome",
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable("welcome") {
                            WelcomeScreen(
                                onGetStartedClick = { navController.navigate("signin") },
                                onAlreadyHaveAccountClick = { navController.navigate("signin") }
                            )
                        }

                        composable("signin") {
                            SignInScreen(
                                viewModel = authViewModel,
                                onLoginSuccess = { 
                                    navController.navigate("home") {
                                        popUpTo("welcome") { inclusive = true }
                                    }
                                },
                                onForgotPasswordClick = { navController.navigate("forgotpassword") },
                                onSignUpClick = { navController.navigate("signup") }
                            )
                        }

                        composable("signup") {
                            SignUpScreen(
                                viewModel = authViewModel,
                                onSignUpSuccess = {
                                    navController.navigate("signin") {
                                        popUpTo("signup") { inclusive = true }
                                    }
                                },
                                onBackToSignInClick = { navController.popBackStack() }
                            )
                        }

                        composable("forgotpassword") {
                            ForgotPasswordScreen(
                                viewModel = authViewModel,
                                onOtpCodeSent = { navController.navigate("verifyotp") },
                                onBackClick = { navController.popBackStack() }
                            )
                        }

                        composable("verifyotp") {
                            VerifyOtpScreen(
                                viewModel = authViewModel,
                                onOtpVerified = { otp -> 
                                    navController.navigate("resetpassword/$otp") {
                                        popUpTo("forgotpassword") { inclusive = true }
                                    }
                                },
                                onBackClick = { navController.popBackStack() }
                            )
                        }

                        composable(
                            route = "resetpassword/{otp}",
                            arguments = listOf(navArgument("otp") { type = NavType.StringType })
                        ) { backStackEntry ->
                            val otp = backStackEntry.arguments?.getString("otp") ?: ""
                            ResetPasswordScreen(
                                viewModel = authViewModel,
                                otp = otp,
                                onResetSuccess = {
                                    navController.navigate("signin") {
                                        popUpTo("welcome")
                                    }
                                },
                                onBackClick = { navController.popBackStack() }
                            )
                        }

                        composable("home") {
                            HomeScreen(
                                onLogOutClick = {
                                    val application = (application as LearnverseApplication)
                                    application.container.authRepository.clearToken()
                                    navController.navigate("welcome") {
                                        popUpTo("home") { inclusive = true }
                                    }
                                },
                                navController = navController
                            )
                        }

                        composable(
                            route = "study_workspace/{courseId}",
                            arguments = listOf(navArgument("courseId") { type = NavType.LongType })
                        ) { backStackEntry ->
                            val courseId = backStackEntry.arguments?.getLong("courseId") ?: 0L
                            CourseStudyWorkspace(
                                courseId = courseId,
                                onBackClick = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}