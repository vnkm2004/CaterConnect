import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOrder } from "@/contexts/OrderContext";

const MENU_OPTIONS = [
    {
        id: "create-own",
        title: "Create Your Own Menu",
        description: "Select items manually from our full menu list.",
        icon: "list",
        color: "#2196F3",
    },
    {
        id: "popular",
        title: "Use Popular Menu",
        description: "Choose from our most loved pre-set menus.",
        icon: "star",
        color: "#FF9800",
    },
    {
        id: "ask-caterer",
        title: "Ask Caterer for Help",
        description: "Let us create a perfect menu for your event.",
        icon: "people",
        color: "#9C27B0",
    },
    {
        id: "use-ai",
        title: "Use AI to Get Menu",
        description: "Get smart suggestions based on your preferences.",
        icon: "hardware-chip",
        color: "#009688",
    },
];

export default function MenuOptionsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { businessId } = useOrder();

    const handleOptionSelect = (optionId: string) => {
        if (optionId === "create-own") {
            router.push({
                pathname: "/customer/create-order/manual-menu",
                params: {
                    preference: params.preference,
                    businessId: businessId
                }
            });
        } else {
            console.log("Selected option:", optionId, "Preference:", params.preference);
            // Navigation logic for other options will be added later
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.title}>Menu Options</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.subtitle}>How would you like to create your menu?</Text>

                <View style={styles.optionsContainer}>
                    {MENU_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.optionCard}
                            onPress={() => handleOptionSelect(option.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: option.color + "15" }]}>
                                <Ionicons name={option.icon as any} size={32} color={option.color} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.optionTitle}>{option.title}</Text>
                                <Text style={styles.optionDescription}>{option.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#ccc" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 30,
        marginTop: 10,
    },
    optionsContainer: {
        gap: 20,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderRadius: 16,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#f0f0f0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
        marginRight: 10,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
});
