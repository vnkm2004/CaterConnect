import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../config/supabase";
import { getBusinessOrders } from "../../services/database";

type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";
type FilterType = "all" | OrderStatus;

export default function OrdersScreen() {
    const router = useRouter();
    const [filter, setFilter] = useState<FilterType>("all");
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert("Error", "Please log in to view orders");
                return;
            }

            // Get the business ID for this user
            const { data: business, error: businessError } = await supabase
                .from('businesses')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (businessError || !business) {
                console.error("Error fetching business:", businessError);
                Alert.alert("Error", "Business not found");
                setOrders([]);
                return;
            }

            console.log("Fetching orders for business ID:", business.id);
            const businessOrders = await getBusinessOrders(business.id);
            console.log("Business orders:", businessOrders);
            setOrders(businessOrders);
        } catch (error: any) {
            console.error("Error loading orders:", error);
            Alert.alert("Error", "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    };

    const getFilteredOrders = () => {
        if (filter === "all") return orders;
        return orders.filter((order) => order.status === filter);
    };

    const getFilterCount = (filterType: FilterType) => {
        if (filterType === "all") return orders.length;
        return orders.filter((order) => order.status === filterType).length;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "#FF9500";
            case "confirmed": return "#007AFF";
            case "completed": return "#34C759";
            case "cancelled": return "#FF3B30";
            default: return "#8E8E93";
        }
    };

    const renderOrderCard = ({ item }: { item: any }) => {
        const sessionCount = item.sessions?.length || 0;
        const customerName = item.customer?.name || "Unknown Customer";

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => router.push(`/business/order-details?orderId=${item.id}` as any)}
            >
                <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                        <Text style={styles.customerName}>{customerName}</Text>
                        <Text style={styles.eventType}>{item.event_type} Catering</Text>
                        {item.venue && (
                            <Text style={styles.venueText}>📍 {item.venue}</Text>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.orderDetails}>
                    <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>{formatDate(item.created_at)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>{sessionCount} session{sessionCount !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="people-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>{item.number_of_people || 0} people</Text>
                    </View>
                </View>

                <View style={styles.orderFooter}>
                    <Text style={styles.serviceType}>{item.service_type}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Orders</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <Ionicons name="search-outline" size={24} color="#1a1a1a" />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[
                        { key: "all", label: "All" },
                        { key: "pending", label: "Pending" },
                        { key: "confirmed", label: "Confirmed" },
                        { key: "completed", label: "Completed" },
                        { key: "cancelled", label: "Cancelled" },
                    ]}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterTab,
                                filter === item.key && styles.activeFilterTab,
                            ]}
                            onPress={() => setFilter(item.key as FilterType)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    filter === item.key && styles.activeFilterText,
                                ]}
                            >
                                {item.label}
                            </Text>
                            <View
                                style={[
                                    styles.countBadge,
                                    filter === item.key && styles.activeCountBadge,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.countText,
                                        filter === item.key && styles.activeCountText,
                                    ]}
                                >
                                    {getFilterCount(item.key as FilterType)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.filterList}
                />
            </View>

            {/* Orders List */}
            <FlatList
                data={getFilteredOrders()}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderCard}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No orders found</Text>
                        <Text style={styles.emptySubtext}>
                            Orders will appear here once customers place them
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    searchButton: {
        padding: 8,
    },
    filterContainer: {
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    filterList: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    filterTab: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
    },
    activeFilterTab: {
        backgroundColor: "#007AFF",
    },
    filterText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginRight: 6,
    },
    activeFilterText: {
        color: "#fff",
    },
    countBadge: {
        backgroundColor: "#e0e0e0",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 24,
        alignItems: "center",
    },
    activeCountBadge: {
        backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    countText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#666",
    },
    activeCountText: {
        color: "#fff",
    },
    list: {
        padding: 20,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#999",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#ccc",
        marginTop: 8,
        textAlign: "center",
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
    },
    orderCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    orderInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    eventType: {
        fontSize: 14,
        color: "#666",
    },
    venueText: {
        fontSize: 13,
        color: "#999",
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
    },
    orderDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        color: "#666",
    },
    orderFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    serviceType: {
        fontSize: 13,
        fontWeight: "500",
        color: "#007AFF",
    },
});
