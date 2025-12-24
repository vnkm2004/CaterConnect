import React, { useState } from "react";
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../config/supabase";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function CustomerLoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter email and password");
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                // Validate phone number for signup
                if (!phone) {
                    Alert.alert("Error", "Please enter your phone number");
                    setLoading(false);
                    return;
                }

                // Sign up new customer
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (signUpError) throw signUpError;
                if (!data.user) throw new Error("Failed to create account");

                // Create customer profile with phone number
                const { error: profileError } = await supabase
                    .from('customers')
                    .insert({
                        id: data.user.id,
                        email: email,
                        phone: phone,
                    });

                if (profileError) throw profileError;

                // Fetch the custom_id that was auto-generated
                const { data: customerData, error: fetchError } = await supabase
                    .from('customers')
                    .select('custom_id')
                    .eq('id', data.user.id)
                    .single();

                const customId = customerData?.custom_id || 'N/A';

                Alert.alert(
                    "Success",
                    `Account created successfully!\n\nYour Customer ID: ${customId}\n\nPlease save this ID for future reference.`,
                    [{
                        text: "OK",
                        onPress: () => {
                            setIsSignUp(false);
                            router.replace("/customer" as any);
                        }
                    }]
                );
            } else {
                // Sign in existing customer
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                router.replace("/customer" as any);
            }
        } catch (error: any) {
            console.error("Authentication error:", error);
            Alert.alert("Error", error.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;

            Alert.alert(
                "Success",
                "Password reset link has been sent to your email"
            );
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignInSuccess = () => {
        router.replace("/customer" as any);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.loginBox}>
                <Text style={styles.title}>Customer Login</Text>
                <Text style={styles.subtitle}>Login to your account</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                {isSignUp && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your 10-digit phone number"
                            placeholderTextColor="#999"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>
                )}

                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isSignUp ? "Sign Up" : "Login"}
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.divider} />
                </View>

                <GoogleSignInButton
                    onSuccess={handleGoogleSignInSuccess}
                    buttonText="Sign in with Google"
                />

                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setIsSignUp(!isSignUp)}
                    disabled={loading}
                >
                    <Text style={styles.toggleText}>
                        {isSignUp
                            ? "Already have an account? Login"
                            : "Don't have an account? Sign Up"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loginBox: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        height: 50,
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#333",
    },
    button: {
        height: 50,
        backgroundColor: "#007AFF",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonDisabled: {
        backgroundColor: "#99c4ff",
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 10,
    },
    forgotPasswordText: {
        color: "#007AFF",
        fontSize: 14,
    },
    toggleButton: {
        marginTop: 20,
        padding: 10,
    },
    toggleText: {
        color: "#007AFF",
        fontSize: 14,
        textAlign: "center",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#e0e0e0",
    },
    dividerText: {
        marginHorizontal: 16,
        color: "#999",
        fontSize: 14,
        fontWeight: "500",
    },
});
