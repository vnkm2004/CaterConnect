import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOrder } from "../../../contexts/OrderContext";

export default function VenueInputScreen() {
    const router = useRouter();
    const { setVenue } = useOrder();
    const [venueText, setVenueText] = useState("");

    const handleNext = () => {
        if (venueText.trim()) {
            setVenue(venueText.trim());
            router.push("/customer/create-order/select-service");
        } else {
            Alert.alert("Required", "Please enter the event venue");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.title}>Event Venue</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>Where will the event take place?</Text>

                <View style={styles.inputContainer}>
                    <Ionicons name="location" size={24} color="#007AFF" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter venue address or location"
                        value={venueText}
                        onChangeText={setVenueText}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                <Text style={styles.hint}>
                    Please provide the complete address or location details
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, !venueText.trim() && styles.disabledButton]}
                    onPress={handleNext}
                    disabled={!venueText.trim()}
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
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#f8f9fa",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#e0e0e0",
        padding: 15,
        marginBottom: 15,
    },
    icon: {
        marginRight: 10,
        marginTop: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        minHeight: 80,
    },
    hint: {
        fontSize: 14,
        color: "#666",
        fontStyle: "italic",
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
    },
    disabledButton: {
        backgroundColor: "#ccc",
    },
    nextButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
