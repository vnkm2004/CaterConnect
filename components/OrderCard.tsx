import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export interface Order {
    id: string;
    catererName: string;
    items: string[];
    total: string;
    status: "Active" | "Completed" | "Cancelled";
    date: string;
    image: string;
}

interface OrderCardProps {
    order: Order;
    onPress: () => void;
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active":
                return "#007AFF";
            case "Completed":
                return "#34C759";
            case "Cancelled":
                return "#FF3B30";
            default:
                return "#8e8e93";
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image source={{ uri: order.image }} style={styles.image} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.catererName}>{order.catererName}</Text>
                    <Text style={[styles.status, { color: getStatusColor(order.status) }]}>
                        {order.status}
                    </Text>
                </View>
                <Text style={styles.items} numberOfLines={1}>
                    {order.items.join(", ")}
                </Text>
                <View style={styles.footer}>
                    <Text style={styles.date}>{order.date}</Text>
                    <Text style={styles.total}>{order.total}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 15,
    },
    content: {
        flex: 1,
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    catererName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    status: {
        fontSize: 14,
        fontWeight: "600",
    },
    items: {
        fontSize: 14,
        color: "#666",
        marginVertical: 5,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    date: {
        fontSize: 12,
        color: "#999",
    },
    total: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
});
