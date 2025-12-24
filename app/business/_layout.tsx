import React, { useEffect, useState } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import { supabase } from "../../config/supabase";
import { getBusinessByUserId } from "../../services/database";

export default function BusinessLayout() {
    const router = useRouter();
    const segments = useSegments();
    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        checkVerification();
    }, [segments]);

    const checkVerification = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace("/business-login");
                return;
            }

            const business = await getBusinessByUserId(user.id);

            if (business?.businessInfo.verified) {
                setIsVerified(true);
            } else {
                // Allow access to pending-verification screen
                // The segments array for /business/pending-verification will look like ['business', 'pending-verification']
                const isPendingScreen = segments[1] === 'pending-verification';

                if (!isPendingScreen) {
                    router.replace("/business/pending-verification");
                }
            }
        } catch (error) {
            console.error("Error checking verification:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#4F46E5", // Indigo 600
                tabBarInactiveTintColor: "#9CA3AF", // Gray 400
                tabBarStyle: {
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 60,
                    backgroundColor: 'transparent',
                    display: isVerified ? 'flex' : 'none', // Hide tabs if not verified
                },
                tabBarBackground: () => (
                    Platform.OS === 'ios' ? (
                        <BlurView intensity={80} style={{ flex: 1 }} tint="light" />
                    ) : (
                        <View style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.95)' }} />
                    )
                ),
                tabBarItemStyle: {
                    paddingTop: 8,
                    paddingBottom: 8,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            backgroundColor: focused ? '#EEF2FF' : 'transparent',
                            padding: 8,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 40,
                        }}>
                            <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: "Orders",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            backgroundColor: focused ? '#EEF2FF' : 'transparent',
                            padding: 8,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 40,
                        }}>
                            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="menu-management"
                options={{
                    title: "Menu",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            backgroundColor: focused ? '#EEF2FF' : 'transparent',
                            padding: 8,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 40,
                        }}>
                            <Ionicons name={focused ? "restaurant" : "restaurant-outline"} size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            backgroundColor: focused ? '#EEF2FF' : 'transparent',
                            padding: 8,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 40,
                        }}>
                            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="pending-verification"
                options={{
                    href: null, // Hide from tab bar
                    tabBarStyle: { display: 'none' }, // Hide tab bar on this screen
                }}
            />
            <Tabs.Screen
                name="order-details"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
