package com.sadgururesort.admin;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Prevent background native crashes from closing the app
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            Log.e("SadguruApp", "Caught unhandled exception to prevent app close: " + throwable.getMessage(), throwable);
        });

        registerPlugin(WhatsAppDirectSharePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
