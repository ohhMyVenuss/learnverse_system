package com.vku.learnverse

import android.app.Application
import com.vku.learnverse.data.di.AppContainer
import com.vku.learnverse.data.di.DefaultAppContainer

class LearnverseApplication : Application() {
    lateinit var container: AppContainer

    override fun onCreate() {
        super.onCreate()
        container = DefaultAppContainer(this)
    }
}
