import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOrder } from "../../../contexts/OrderContext";

const PREFERENCES = [
    { id: "veg", label: "Vegetarian", icon: "leaf", color: "#4CAF50" },
    { id: "non-veg", label: "Non-Vegetarian", icon: "restaurant", color: "#F44336" },
    { id: "mixed", label: "Mixed", icon: "fast-food", color: "#FF9800" },
];

export default function FoodPreferenceScreen() {
    const router = useRouter();
    const { setFoodPreference } = useOrder();
    const [selectedPreference, setSelectedPreference] = useState<string | null>(null);

    const handleNext = () => {
        if (selectedPreference) {
            // Save food preference to order context
            setFoodPreference(selectedPreference as 'veg' | 'non-veg' | 'mixed');
            router.push({
                pathname: "/customer/create-order/menu-options",
                params: { preference: selectedPreference }
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.title}>Food Preference</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>What type of food would you like?</Text>

                <View style={styles.optionsContainer}>
                    {PREFERENCES.map((pref) => (
                        <TouchableOpacity
                            key={pref.id}
                            style={[
                                styles.optionCard,
                                selectedPreference === pref.id && styles.selectedOption,
                                { borderColor: selectedPreference === pref.id ? pref.color : "#e0e0e0" }
                            ]}
                            onPress={() => setSelectedPreference(pref.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: pref.color + "15" }
                            ]}>
                                <Ionicons name={pref.icon as any} size={32} color={pref.color} />
                            </View>
                            <Text style={[
                                styles.optionLabel,
                                selectedPreference === pref.id && { color: pref.color }
                            ]}>{pref.label}</Text>

                            {selectedPreference === pref.id && (
                                <View style={[styles.checkmark, { backgroundColor: pref.color }]}>
                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, !selectedPreference && styles.disabledButton]}
                    onPress={handleNext}
                    disabled={!selectedPreference}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
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
        flex: 1,
        padding: 20,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 30,
        marginTop: 10,
    },
    optionsContainer: {
        gap: 15,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    selectedOption: {
        backgroundColor: "#fff",
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 15,
    },
    optionLabel: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        flex: 1,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    footer: {
        padding: 20,
        paddingBottom: 90,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    nextButton: {
        backgroundColor: "#007AFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: "#ccc",
        shadowOpacity: 0,
        elevation: 0,
    },
    nextButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
