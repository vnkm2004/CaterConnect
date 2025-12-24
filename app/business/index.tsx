import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import StatCard from "../../components/StatCard";
import BusinessOrderCard from "../../components/BusinessOrderCard";
import { getBusiness, getBusinessOrders } from "../../services/database";
import { supabase } from "../../config/supabase";

export default function BusinessDashboard() {
    const router = useRouter();
    const [stats, setStats] = React.useState({
        revenue: "₹0",
        activeOrders: 0,
        pendingRequests: 0,
        rating: 0,
    });
    const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadBusinessData();
    }, []);

    const loadBusinessData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Load business stats
            const business = await getBusiness(user.id);
            if (business) {
                setStats({
                    revenue: "₹0", // TODO: Calculate revenue
                    activeOrders: business.stats.totalOrders, // Using total for now, should filter
                    pendingRequests: 0, // TODO: Count pending
                    rating: business.stats.rating,
                });
            }

            // Load recent orders
            const orders = await getBusinessOrders(user.id);
            setRecentOrders(orders.slice(0, 5)); // Show top 5
        } catch (error) {
            console.error("Error loading business data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.businessName}>Your Business</Text>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color="#1F2937" />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>3</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Stats Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <StatCard
                        icon="cash-outline"
                        label="Total Revenue"
                        value={stats.revenue}
                        color="#059669" // Emerald 600
                        trend={{ value: "+12.5%", isPositive: true }}
                    />
                    <StatCard
                        icon="restaurant-outline"
                        label="Total Orders"
                        value={stats.activeOrders}
                        color="#4F46E5" // Indigo 600
                    />
                    <StatCard
                        icon="time-outline"
                        label="Pending Requests"
                        value={stats.pendingRequests}
                        color="#D97706" // Amber 600
                    />
                    <StatCard
                        icon="star-outline"
                        label="Average Rating"
                        value={stats.rating}
                        color="#EAB308" // Yellow 500
                    />
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <View style={[styles.actionIcon, { backgroundColor: "#EEF2FF" }]}>
                                <Ionicons name="add" size={24} color="#4F46E5" />
                            </View>
                            <Text style={styles.actionText}>Add Item</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push("/business/orders" as any)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: "#ECFDF5" }]}>
                                <Ionicons name="receipt-outline" size={24} color="#059669" />
                            </View>
                            <Text style={styles.actionText}>Orders</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => router.push("/business/profile" as any)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: "#F3F4F6" }]}>
                                <Ionicons name="settings-outline" size={24} color="#4B5563" />
                            </View>
                            <Text style={styles.actionText}>Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Orders */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Orders</Text>
                        <TouchableOpacity onPress={() => router.push("/business/orders" as any)}>
                            <Text style={styles.seeAll}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <ActivityIndicator color="#4F46E5" />
                    ) : recentOrders.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="clipboard-outline" size={48} color="#9CA3AF" />
                            <Text style={styles.emptyText}>No recent orders</Text>
                        </View>
                    ) : (
                        recentOrders.map((order) => (
                            <BusinessOrderCard
                                key={order.orderId}
                                order={{
                                    id: order.orderId,
                                    customerName: "Customer", // TODO: Fetch customer name
                                    eventType: order.eventType,
                                    eventDate: new Date(order.createdAt).toLocaleDateString(),
                                    total: "₹" + (order.totalAmount || "0"),
                                    status: order.status,
                                }}
                                onPress={() => router.push(`/business/order-details?orderId=${order.orderId}` as any)}
                            />
                        ))
                    )}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB", // Gray 50
    },
    header: {
        backgroundColor: "#fff",
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    greeting: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    businessName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginTop: 2,
    },
    notificationButton: {
        padding: 8,
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
    },
    badge: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "#EF4444",
        borderRadius: 6,
        width: 8,
        height: 8,
    },
    badgeText: {
        display: "none", // Hiding text for a cleaner dot look
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 24,
        paddingBottom: 8,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    seeAll: {
        fontSize: 14,
        color: "#4F46E5",
        fontWeight: "600",
    },
    quickActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    actionText: {
        fontSize: 13,
        color: "#374151",
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        padding: 32,
    },
    emptyText: {
        color: "#9CA3AF",
        marginTop: 8,
        fontSize: 14,
    },
});
