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
    Image,
    ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as Network from 'expo-network';
import * as Linking from 'expo-linking';
import { supabase } from "../config/supabase";
import { createBusiness } from "../services/database";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { Ionicons } from "@expo/vector-icons";

export default function BusinessLoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const router = useRouter();

    const handleLogin = async () => {
        // ... (Keep existing logic)
        try {
            const networkState = await Network.getNetworkStateAsync();
            if (!networkState.isConnected || !networkState.isInternetReachable) {
                Alert.alert("No Internet Connection", "Please check your internet connection.");
                return;
            }
        } catch (e) {
            console.warn("Network check failed:", e);
        }

        if (!email || !password) {
            Alert.alert("Error", "Please enter email and password");
            return;
        }

        if (isSignUp && (!businessName || !phone || !address)) {
            Alert.alert("Error", "Please fill in all business details");
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                const redirectUrl = Linking.createURL('/');
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: redirectUrl },
                });

                if (signUpError) throw signUpError;
                if (!data.user) throw new Error("No user created");

                await createBusiness(data.user.id, email, businessName, phone, address);

                const { data: businessData } = await supabase
                    .from('businesses')
                    .select('custom_id')
                    .eq('user_id', data.user.id)
                    .single();

                const customId = businessData?.custom_id || 'N/A';

                Alert.alert(
                    "Success",
                    `Account created successfully!\n\nYour Business ID: ${customId}\n\nPlease save this ID for future reference.\n\nWaiting for admin verification...`,
                    [{
                        text: "OK",
                        onPress: () => {
                            setIsSignUp(false);
                            router.replace("/business/pending-verification" as any);
                        }
                    }]
                );
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: business } = await supabase
                        .from("businesses")
                        .select("verified")
                        .eq("user_id", user.id)
                        .single();

                    if (business?.verified) {
                        router.replace("/business" as any);
                    } else {
                        router.replace("/business/pending-verification" as any);
                    }
                }
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignInSuccess = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) throw new Error("No user email found");

            const { data: existingBusiness, error: fetchError } = await supabase
                .from("businesses")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

            if (existingBusiness) {
                if (existingBusiness.verified) {
                    router.replace("/business" as any);
                } else {
                    router.replace("/business/pending-verification" as any);
                }
            } else {
                Alert.alert(
                    "Complete Your Profile",
                    "Please provide your business details to continue.",
                    [{
                        text: "OK",
                        onPress: () => {
                            setIsSignUp(true);
                            setEmail(user.email || "");
                        },
                    }]
                );
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to complete sign-in");
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
            Alert.alert("Success", "Password reset link sent");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Image
                        source={require("../assets/images/login-illustration.png")}
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Welcome back!</Text>
                    <Text style={styles.subtitle}>
                        {isSignUp ? "Create your business account" : "Log in to your existing account"}
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <View style={[
                            styles.inputContainer,
                            focusedInput === 'email' && styles.inputContainerFocused
                        ]}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={focusedInput === 'email' ? "#0066FF" : "#9CA3AF"}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={[
                            styles.inputContainer,
                            focusedInput === 'password' && styles.inputContainerFocused
                        ]}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={focusedInput === 'password' ? "#0066FF" : "#9CA3AF"}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>
                        {!isSignUp && (
                            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {isSignUp && (
                        <>
                            <View style={styles.inputGroup}>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'businessName' && styles.inputContainerFocused
                                ]}>
                                    <Ionicons name="business-outline" size={20} color={focusedInput === 'businessName' ? "#0066FF" : "#9CA3AF"} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Business Name"
                                        placeholderTextColor="#9CA3AF"
                                        value={businessName}
                                        onChangeText={setBusinessName}
                                        onFocus={() => setFocusedInput('businessName')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'phone' && styles.inputContainerFocused
                                ]}>
                                    <Ionicons name="call-outline" size={20} color={focusedInput === 'phone' ? "#0066FF" : "#9CA3AF"} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Phone Number"
                                        placeholderTextColor="#9CA3AF"
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                        onFocus={() => setFocusedInput('phone')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'address' && styles.inputContainerFocused
                                ]}>
                                    <Ionicons name="location-outline" size={20} color={focusedInput === 'address' ? "#0066FF" : "#9CA3AF"} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Business Address"
                                        placeholderTextColor="#9CA3AF"
                                        value={address}
                                        onChangeText={setAddress}
                                        onFocus={() => setFocusedInput('address')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {isSignUp ? "CREATE" : "LOG IN"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>Or connect using</Text>
                        <View style={styles.divider} />
                    </View>

                    <GoogleSignInButton
                        onSuccess={handleGoogleSignInSuccess}
                        buttonText="Google"
                        style={styles.googleButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        </Text>
                        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                            <Text style={styles.footerLink}>
                                {isSignUp ? " Login here" : " Sign Up"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        alignItems: "center",
        paddingTop: 60,
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    illustration: {
        width: 280,
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
    },
    form: {
        paddingHorizontal: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 25, // Pill shape
        height: 50,
        paddingHorizontal: 16,
    },
    inputContainerFocused: {
        borderColor: "#0066FF",
        backgroundColor: "#F9FAFB",
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#111827",
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginTop: 8,
        marginRight: 4,
    },
    forgotPasswordText: {
        color: "#374151",
        fontSize: 13,
        fontWeight: "500",
    },
    button: {
        height: 50,
        backgroundColor: "#0047AB", // Darker blue for contrast
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#0047AB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: "#93C5FD",
        shadowOpacity: 0,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 30,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E7EB",
    },
    dividerText: {
        marginHorizontal: 16,
        color: "#9CA3AF",
        fontSize: 14,
    },
    googleButton: {
        marginBottom: 30,
        borderRadius: 25,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: "auto",
    },
    footerText: {
        color: "#6B7280",
        fontSize: 14,
    },
    footerLink: {
        color: "#0066FF",
        fontSize: 14,
        fontWeight: "600",
    },
});
