import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BusinessOrder {
    id: string;
    customerName: string;
    eventType: string;
    eventDate: string;
    total: string;
    status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
}

interface BusinessOrderCardProps {
    order: BusinessOrder;
    onPress: () => void;
    onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

export default function BusinessOrderCard({ order, onPress, onStatusUpdate }: BusinessOrderCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "#FF9500";
            case "confirmed":
                return "#007AFF";
            case "active":
                return "#5856D6";
            case "completed":
                return "#34C759";
            case "cancelled":
                return "#FF3B30";
            default:
                return "#8E8E93";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return "time-outline";
            case "confirmed":
                return "checkmark-circle-outline";
            case "active":
                return "restaurant-outline";
            case "completed":
                return "checkmark-done-circle";
            case "cancelled":
                return "close-circle-outline";
            default:
                return "help-circle-outline";
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.customerInfo}>
                    <Ionicons name="person-circle-outline" size={20} color="#666" />
                    <Text style={styles.customerName}>{order.customerName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "20" }]}>
                    <Ionicons name={getStatusIcon(order.status) as any} size={14} color={getStatusColor(order.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{order.eventDate}</Text>
                </View>
                <View style={styles.row}>
                    <Ionicons name="pricetag-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{order.eventType}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.total}>{order.total}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    customerInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
        marginLeft: 8,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },
    content: {
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    detailText: {
        fontSize: 14,
        color: "#666",
        marginLeft: 8,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    total: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
});
