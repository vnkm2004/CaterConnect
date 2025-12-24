import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getOrderDetails, updateOrderStatus, MenuFile } from "../services/database";
import { supabase } from "../config/supabase";

export default function OrderDetails() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [orderData, setOrderData] = useState<any>(null);
    const [userType, setUserType] = useState<"customer" | "business" | null>(null);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert("Error", "Please log in to view order details");
                router.back();
                return;
            }

            const order = await getOrderDetails(orderId as string);
            setOrderData(order);

            // Determine if user is customer or business
            if (order.customer_id === user.id) {
                setUserType("customer");
            } else if (order.business_id === user.id) {
                setUserType("business");
            }
        } catch (error: any) {
            console.error("Error loading order:", error);
            Alert.alert("Error", "Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            await updateOrderStatus(orderId as string, newStatus);
            Alert.alert("Success", `Order status updated to ${newStatus}`);
            loadOrderDetails();
        } catch (error: any) {
            Alert.alert("Error", "Failed to update order status");
        }
    };

    const handleOpenFile = async (fileUrl: string) => {
        try {
            const supported = await Linking.canOpenURL(fileUrl);
            if (supported) {
                await Linking.openURL(fileUrl);
            } else {
                Alert.alert("Error", "Cannot open this file type");
            }
        } catch (error) {
            console.error("Error opening file:", error);
            Alert.alert("Error", "Failed to open file");
        }
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending": return "time-outline";
            case "confirmed": return "checkmark-circle-outline";
            case "completed": return "checkmark-done-circle-outline";
            case "cancelled": return "close-circle-outline";
            default: return "help-circle-outline";
        }
    };

    // Group menu items by session
    const getMenuItemsBySession = (sessionIndex: number) => {
        if (!orderData?.menuItems) return [];
        return orderData.menuItems.filter((item: any) => item.session_index === sessionIndex);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    if (!orderData) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
                <Text style={styles.errorText}>Order not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.title}>Order Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Order ID and Status */}
                <View style={styles.section}>
                    <View style={styles.orderHeader}>
                        <View>
                            <Text style={styles.orderIdLabel}>Order ID</Text>
                            <Text style={styles.orderId}>#{orderData.id.slice(0, 8)}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderData.status) }]}>
                            <Ionicons name={getStatusIcon(orderData.status)} size={16} color="#fff" />
                            <Text style={styles.statusText}>{orderData.status.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* Customer/Business Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {userType === "customer" ? "Caterer Information" : "Customer Information"}
                    </Text>
                    {userType === "customer" && orderData.businesses && (
                        <View style={styles.infoCard}>
                            <Ionicons name="restaurant-outline" size={24} color="#007AFF" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoName}>{orderData.businesses.name}</Text>
                                <Text style={styles.infoDetail}>{orderData.businesses.phone}</Text>
                                <Text style={styles.infoDetail}>{orderData.businesses.address}</Text>
                            </View>
                        </View>
                    )}
                    {userType === "business" && orderData.customers && (
                        <View style={styles.infoCard}>
                            <Ionicons name="person-outline" size={24} color="#007AFF" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoName}>{orderData.customers.name}</Text>
                                <Text style={styles.infoDetail}>{orderData.customers.phone}</Text>
                                <Text style={styles.infoDetail}>{orderData.customers.email}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Event Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Event Details</Text>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={styles.detailLabel}>Event Type:</Text>
                        <Text style={styles.detailValue}>{orderData.event_type}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="restaurant-outline" size={20} color="#666" />
                        <Text style={styles.detailLabel}>Food Preference:</Text>
                        <Text style={styles.detailValue}>{orderData.food_preference}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="briefcase-outline" size={20} color="#666" />
                        <Text style={styles.detailLabel}>Service Type:</Text>
                        <Text style={styles.detailValue}>{orderData.service_type}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={20} color="#666" />
                        <Text style={styles.detailLabel}>Venue:</Text>
                        <Text style={styles.detailValue}>{orderData.venue || "Not specified"}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="people-outline" size={20} color="#666" />
                        <Text style={styles.detailLabel}>Total People:</Text>
                        <Text style={styles.detailValue}>{orderData.number_of_people}</Text>
                    </View>
                </View>

                {/* Sessions */}
                {orderData.sessions && orderData.sessions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sessions ({orderData.sessions.length})</Text>
                        {orderData.sessions.map((session: any, index: number) => {
                            const sessionMenuItems = getMenuItemsBySession(index);
                            return (
                                <View key={index} style={styles.sessionCard}>
                                    <View style={styles.sessionHeader}>
                                        <Text style={styles.sessionName}>{session.sessionName}</Text>
                                        <View style={styles.sessionBadge}>
                                            <Text style={styles.sessionBadgeText}>Session {index + 1}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.sessionDetail}>
                                        <Ionicons name="calendar" size={16} color="#666" />
                                        <Text style={styles.sessionDetailText}>{session.date}</Text>
                                    </View>

                                    {session.time && (
                                        <View style={styles.sessionDetail}>
                                            <Ionicons name="time" size={16} color="#666" />
                                            <Text style={styles.sessionDetailText}>{session.time}</Text>
                                        </View>
                                    )}

                                    <View style={styles.sessionDetail}>
                                        <Ionicons name="location" size={16} color="#666" />
                                        <Text style={styles.sessionDetailText}>{session.venue || orderData.venue}</Text>
                                    </View>

                                    <View style={styles.sessionDetail}>
                                        <Ionicons name="people" size={16} color="#666" />
                                        <Text style={styles.sessionDetailText}>{session.numberOfPeople} people</Text>
                                    </View>

                                    <View style={styles.sessionDetail}>
                                        <Ionicons name="restaurant" size={16} color="#666" />
                                        <Text style={styles.sessionDetailText}>{session.servingType}</Text>
                                    </View>

                                    {/* Menu Items for this session */}
                                    {sessionMenuItems.length > 0 && (
                                        <View style={styles.menuSection}>
                                            <Text style={styles.menuTitle}>Menu Items ({sessionMenuItems.length})</Text>
                                            {sessionMenuItems.map((item: any, itemIndex: number) => (
                                                <View key={itemIndex} style={styles.menuItem}>
                                                    <Ionicons
                                                        name={item.is_veg ? "leaf-outline" : "nutrition-outline"}
                                                        size={16}
                                                        color={item.is_veg ? "#34C759" : "#FF3B30"}
                                                    />
                                                    <Text style={styles.menuItemName}>{item.item_name}</Text>
                                                    <Text style={styles.menuItemCategory}>{item.item_category}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Menu Files Section */}
                {orderData.menu_files && orderData.menu_files.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Menu Files</Text>
                        {orderData.menu_files.map((file: MenuFile, index: number) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.fileItem, index > 0 && styles.fileItemBorder]}
                                onPress={() => handleOpenFile(file.url)}
                            >
                                <Ionicons
                                    name={file.type?.includes('pdf') ? 'document-text' : 'image'}
                                    size={24}
                                    color="#007AFF"
                                />
                                <View style={styles.fileDetails}>
                                    <Text style={styles.fileName}>{file.name}</Text>
                                    <Text style={styles.fileDate}>
                                        Uploaded {new Date(file.uploadedAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Notes */}
                {orderData.notes && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notes</Text>
                        <Text style={styles.notesText}>{orderData.notes}</Text>
                    </View>
                )}

                {/* Status Update Actions (Business only) */}
                {userType === "business" && orderData.status === "pending" && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Actions</Text>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.confirmButton]}
                                onPress={() => handleUpdateStatus("confirmed")}
                            >
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Confirm Order</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() => handleUpdateStatus("cancelled")}
                            >
                                <Ionicons name="close-circle" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Cancel Order</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {userType === "business" && orderData.status === "confirmed" && (
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.completeButton]}
                            onPress={() => handleUpdateStatus("completed")}
                        >
                            <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Mark as Completed</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    headerBackButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: "#fff",
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 16,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    orderIdLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 4,
    },
    orderId: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    infoCard: {
        flexDirection: "row",
        backgroundColor: "#f9f9f9",
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    infoDetail: {
        fontSize: 14,
        color: "#666",
        marginBottom: 2,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: "#666",
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a1a1a",
        flex: 1,
        textAlign: "right",
    },
    sessionCard: {
        backgroundColor: "#f9f9f9",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    sessionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sessionName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    sessionBadge: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    sessionBadgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
    },
    sessionDetail: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
    },
    sessionDetailText: {
        fontSize: 14,
        color: "#666",
    },
    menuSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    menuTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        gap: 8,
    },
    menuItemName: {
        fontSize: 14,
        color: "#1a1a1a",
        flex: 1,
    },
    menuItemCategory: {
        fontSize: 12,
        color: "#666",
    },
    notesText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    confirmButton: {
        backgroundColor: "#34C759",
    },
    cancelButton: {
        backgroundColor: "#FF3B30",
    },
    completeButton: {
        backgroundColor: "#007AFF",
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: "#FF3B30",
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    fileItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
    },
    fileItemBorder: {
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontSize: 15,
        color: "#1a1a1a",
        fontWeight: "500",
        marginBottom: 2,
    },
    fileDate: {
        fontSize: 12,
        color: "#999",
    },
});
