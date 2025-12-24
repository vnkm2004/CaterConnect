import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number;
    color: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

export default function StatCard({ icon, label, value, color, trend }: StatCardProps) {
    return (
        <View style={[styles.card, { borderLeftColor: color }]}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.content}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
                {trend && (
                    <View style={styles.trendContainer}>
                        <Ionicons
                            name={trend.isPositive ? "trending-up" : "trending-down"}
                            size={14}
                            color={trend.isPositive ? "#34C759" : "#FF3B30"}
                        />
                        <Text
                            style={[
                                styles.trendText,
                                { color: trend.isPositive ? "#34C759" : "#FF3B30" },
                            ]}
                        >
                            {trend.value}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12, // Softer square
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 13,
        color: "#6B7280", // Gray 500
        marginBottom: 4,
        fontWeight: "500",
    },
    value: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937", // Gray 800
    },
    trendContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    trendText: {
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },
});
