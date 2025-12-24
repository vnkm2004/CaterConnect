import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOrder } from "../../contexts/OrderContext";

const { width } = Dimensions.get("window");
const CARD_GAP = 15;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2;

const EVENT_TYPES = [
    {
        id: "wedding",
        name: "Wedding",
        emoji: "💍",
        description: "Special day",
        color: "#FF6B6B",
    },
    {
        id: "corporate",
        name: "Corporate",
        emoji: "💼",
        description: "Professional",
        color: "#4ECDC4",
    },
    {
        id: "birthday",
        name: "Birthday",
        emoji: "🎂",
        description: "Celebration",
        color: "#FFD93D",
    },
    {
        id: "social",
        name: "Social",
        emoji: "🥂",
        description: "Gathering",
        color: "#6C5CE7",
    },
    {
        id: "anniversary",
        name: "Anniversary",
        emoji: "💑",
        description: "Milestone",
        color: "#A8E6CF",
    },
    {
        id: "baby_shower",
        name: "Baby Shower",
        emoji: "👶",
        description: "New arrival",
        color: "#FF8B94",
    },
    {
        id: "holiday",
        name: "Holiday",
        emoji: "🎄",
        description: "Festive",
        color: "#FFAAA5",
    },
    {
        id: "other",
        name: "Other",
        emoji: "✨",
        description: "Custom event",
        color: "#A29BFE",
    },
];

export default function SelectEventTypeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { setEventType, setBusinessId } = useOrder();
    const [isOtherModalVisible, setIsOtherModalVisible] = useState(false);
    const [customEventName, setCustomEventName] = useState("");

    React.useEffect(() => {
        if (params.businessId) {
            setBusinessId(params.businessId as string);
        }
    }, [params.businessId]);

    const handleSelectType = (typeId: string, typeName: string) => {
        if (typeId === "other") {
            setIsOtherModalVisible(true);
        } else {
            // Save event type to order context
            setEventType(typeName);
            router.push({
                pathname: "/customer/select-caterer",
                params: { eventType: typeName }
            });
        }
    };

    const handleCustomEventSubmit = () => {
        if (customEventName.trim()) {
            // Save custom event type to order context
            setEventType(customEventName);
            setIsOtherModalVisible(false);
            router.push({
                pathname: "/customer/select-caterer",
                params: { eventType: customEventName }
            });
            setCustomEventName("");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.title}>Select Event Type</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.subtitle}>What are you celebrating?</Text>

                <View style={styles.grid}>
                    {EVENT_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            style={[styles.card, { borderColor: type.color, shadowColor: type.color }]}
                            onPress={() => handleSelectType(type.id, type.name)}
                            activeOpacity={0.6}
                        >
                            <View style={[styles.emojiContainer, { backgroundColor: type.color + "15" }]}>
                                <Text style={styles.emoji}>{type.emoji}</Text>
                            </View>
                            <Text style={styles.cardTitle}>{type.name}</Text>
                            <Text style={styles.cardDescription}>{type.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <Modal
                visible={isOtherModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOtherModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Custom Event</Text>
                            <TouchableOpacity onPress={() => setIsOtherModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSubtitle}>Please specify the type of event</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Graduation, Retirement"
                            value={customEventName}
                            onChangeText={setCustomEventName}
                            autoFocus
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, !customEventName.trim() && styles.submitButtonDisabled]}
                            onPress={handleCustomEventSubmit}
                            disabled={!customEventName.trim()}
                        >
                            <Text style={styles.submitButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
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
        paddingTop: 60,
        backgroundColor: "#fff",
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
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 25,
        letterSpacing: -0.5,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: CARD_GAP,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH, // Make it square
        padding: 15,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderWidth: 1.5,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    emojiContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    emoji: {
        fontSize: 28,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
        textAlign: "center",
        color: "#1a1a1a",
    },
    cardDescription: {
        fontSize: 11,
        color: "#888",
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a1a1a",
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#333",
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: "#007AFF",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    submitButtonDisabled: {
        backgroundColor: "#ccc",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
