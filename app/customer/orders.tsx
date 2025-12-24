import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import OrderCard from "../../components/OrderCard";
import { getCustomerOrders } from "../../services/database";
import { supabase } from "../../config/supabase";

export default function OrdersScreen() {
    const [filter, setFilter] = useState<"Active" | "Completed" | "History">("Active");
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    React.useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const userOrders = await getCustomerOrders(user.id);
                setOrders(userOrders);
            }
        } catch (error) {
            console.error("Error loading orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredOrders = () => {
        if (filter === "History") {
            return orders.filter((o) => o.status === "cancelled" || o.status === "completed");
        }
        // Map UI filter to DB status
        const dbStatus = filter === "Active" ? ["pending", "confirmed", "in-progress"] : [filter.toLowerCase()];
        return orders.filter((o) => dbStatus.includes(o.status));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Orders</Text>
            </View>

            <View style={styles.tabs}>
                {["Active", "Completed", "History"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, filter === tab && styles.activeTab]}
                        onPress={() => setFilter(tab as any)}
                    >
                        <Text style={[styles.tabText, filter === tab && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={getFilteredOrders()}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <OrderCard
                            order={{
                                id: item.order_number || item.id,
                                catererName: item.business?.name || "Caterer",
                                items: [
                                    `${item.event_type} Catering`,
                                    item.venue ? `📍 ${item.venue}` : '',
                                    item.number_of_people ? `👥 ${item.number_of_people} people` : '',
                                    item.service_type || ''
                                ].filter(Boolean),
                                total: "₹" + (item.total_amount || "0"),
                                status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
                                date: new Date(item.created_at).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                }),
                                image: "https://images.unsplash.com/photo-1519225468063-3f837f996c34?q=80&w=2070&auto=format&fit=crop",
                            }}
                            onPress={() => router.push(`/customer/order-details?orderId=${item.id}` as any)}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No orders found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    tabs: {
        flexDirection: "row",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    tab: {
        marginRight: 20,
        paddingBottom: 5,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#007AFF",
    },
    tabText: {
        fontSize: 16,
        color: "#666",
    },
    activeTabText: {
        color: "#007AFF",
        fontWeight: "bold",
    },
    list: {
        padding: 20,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
    },
});
