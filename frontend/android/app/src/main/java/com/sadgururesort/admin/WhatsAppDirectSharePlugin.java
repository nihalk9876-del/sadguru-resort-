package com.sadgururesort.admin;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;

@CapacitorPlugin(name = "WhatsAppDirectShare")
public class WhatsAppDirectSharePlugin extends Plugin {

    @PluginMethod
    public void shareToChat(PluginCall call) {
        String phone = call.getString("phone");
        String message = call.getString("message", "");
        String filePath = call.getString("filePath");

        if (phone == null || phone.trim().isEmpty()) {
            call.reject("Phone number is required");
            return;
        }

        // Clean phone number: keep only digits
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        if (cleanPhone.length() == 10) {
            cleanPhone = "91" + cleanPhone;
        }

        try {
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("image/png");

            // Check if WhatsApp or WhatsApp Business is installed
            String packageName = "com.whatsapp";
            if (!isAppInstalled(packageName) && isAppInstalled("com.whatsapp.w4b")) {
                packageName = "com.whatsapp.w4b";
            }
            intent.setPackage(packageName);

            // JID directly selects recipient phone number so user does NOT have to select manually!
            String jid = cleanPhone + "@s.whatsapp.net";
            intent.putExtra("jid", jid);
            intent.putExtra(Intent.EXTRA_TEXT, message);

            if (filePath != null && !filePath.isEmpty()) {
                File file = null;
                if (filePath.startsWith("file://")) {
                    file = new File(Uri.parse(filePath).getPath());
                } else if (filePath.startsWith("content://")) {
                    Uri contentUri = Uri.parse(filePath);
                    intent.putExtra(Intent.EXTRA_STREAM, contentUri);
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                } else {
                    file = new File(filePath);
                }

                if (file != null && file.exists()) {
                    Uri fileUri = FileProvider.getUriForFile(
                        getContext(),
                        getContext().getPackageName() + ".fileprovider",
                        file
                    );
                    intent.putExtra(Intent.EXTRA_STREAM, fileUri);
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                }
            }

            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            // Fallback: If direct package JID send fails, open wa.me URL directly
            try {
                String waUrl = "https://wa.me/" + cleanPhone + "?text=" + Uri.encode(message);
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(waUrl));
                browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(browserIntent);
                call.resolve();
            } catch (Exception ex) {
                call.reject("Failed to open WhatsApp: " + ex.getMessage());
            }
        }
    }

    private boolean isAppInstalled(String packageName) {
        try {
            getContext().getPackageManager().getPackageInfo(packageName, PackageManager.GET_ACTIVITIES);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
