import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { OrderProvider } from "../../contexts/OrderContext";
import { View, Platform } from "react-native";
import { BlurView } from "expo-blur";

export default function CustomerLayout() {
    return (
        <OrderProvider>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: "#4F46E5", // Indigo 600
                    tabBarInactiveTintColor: "#9CA3AF", // Gray 400
                    tabBarStyle: {
                        borderTopWidth: 0,
                        elevation: 0,
                        height: 60,
                        backgroundColor: '#fff', // Set a solid background
                        paddingBottom: 5, // Add some padding for safe area
                        // tabBarBackground removed to use standard solid background
                    },
                    tabBarItemStyle: {
                        paddingTop: 8,
                        paddingBottom: 8,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ color, focused }) => (
                            <View style={{
                                backgroundColor: focused ? '#EEF2FF' : 'transparent',
                                padding: 8,
                                borderRadius: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 40,
                            }}>
                                <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="orders"
                    options={{
                        title: "Orders",
                        headerShown: false,
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
                    name="about"
                    options={{
                        title: "About",
                        tabBarIcon: ({ color, focused }) => (
                            <View style={{
                                backgroundColor: focused ? '#EEF2FF' : 'transparent',
                                padding: 8,
                                borderRadius: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 40,
                            }}>
                                <Ionicons name={focused ? "information-circle" : "information-circle-outline"} size={24} color={color} />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="(tabs)"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="select-event-type"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="select-caterer"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="caterer-details"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="create-order/food-preference"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="create-order/menu-options"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="create-order/manual-menu"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="create-order/select-service"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="create-order/venue-input"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="order-success"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="order-details"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="order-menu"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="data"
                    options={{
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="edit-order-menu"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>
        </OrderProvider >
    );
}

