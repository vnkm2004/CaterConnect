import React, { useState } from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../config/supabase";

// Required for OAuth to work properly
WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    style?: any;
    buttonText?: string;
}

export default function GoogleSignInButton({
    onSuccess,
    onError,
    buttonText = "Sign in with Google",
    style,
}: GoogleSignInButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);

            // Start OAuth flow with Google
            // Supabase will handle the redirect to its callback URL
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    // Don't specify redirectTo - let Supabase use its default callback
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            // Open the OAuth URL in the browser
            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    "https://urcmzszkmbmvrdqwzmgp.supabase.co/auth/v1/callback"
                );

                if (result.type === "success") {
                    // Extract the URL from the result
                    const url = result.url;

                    // Parse the URL to extract tokens
                    const parsedUrl = new URL(url);
                    const access_token = parsedUrl.searchParams.get("access_token");
                    const refresh_token = parsedUrl.searchParams.get("refresh_token");

                    if (access_token && refresh_token) {
                        // Set the session with the tokens
                        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token,
                        });

                        if (sessionError) throw sessionError;

                        if (sessionData?.session) {
                            onSuccess?.();
                        } else {
                            throw new Error("Failed to establish session");
                        }
                    } else {
                        throw new Error("No tokens received from authentication");
                    }
                } else if (result.type === "cancel") {
                    Alert.alert("Cancelled", "Google sign-in was cancelled");
                }
            }
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            const errorMessage = error.message || "Failed to sign in with Google";
            Alert.alert("Error", errorMessage);
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, style, loading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#757575" />
            ) : (
                <View style={styles.buttonContent}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.googleIcon}>G</Text>
                    </View>
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 50,
        backgroundColor: "#ffffff",
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#dadce0",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainer: {
        width: 20,
        height: 20,
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    googleIcon: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4285F4",
    },
    buttonText: {
        color: "#3c4043",
        fontSize: 16,
        fontWeight: "500",
    },
});
