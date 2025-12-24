import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { submitOrder } from "../../../services/database";
import { supabase } from "../../../config/supabase";
import { useOrder } from "../../../contexts/OrderContext";

const AVAILABLE_SERVICES = [
    {
        id: "hire-cooks",
        name: "Hire Cooks",
        icon: "person",
        description: "You provide ingredients & Supply. We cook.",
    },
    {
        id: "cook-supply",
        name: "Cook & Supply",
        icon: "restaurant",
        description: "You provide ingredients. We cook & serve.",
    },
    {
        id: "full-catering",
        name: "Full Catering",
        icon: "fast-food",
        description: "We handle everything. Full service.",
    },
];

export default function SelectService() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { businessId, eventType, foodPreference, cuisine, venue, sessions } = useOrder();

    const getTotalPeople = () => {
        return sessions.reduce((total, session) => total + session.numberOfPeople, 0);
    };
    const [selectedService, setSelectedService] = useState("");
    const [loading, setLoading] = useState(false);

    const handleServiceSelect = (serviceId: string) => {
        setSelectedService(serviceId);
    };

    const handleConfirmOrder = async () => {
        console.log("=== BUTTON CLICKED ===");
        console.log("Selected service:", selectedService);

        if (!selectedService) {
            console.log("ERROR: No service selected");
            Alert.alert("Error", "Please select a service");
            return;
        }

        console.log("=== CONFIRM ORDER CLICKED ===");
        console.log("Selected service:", selectedService);
        console.log("Sessions count:", sessions.length);
        console.log("Sessions data:", JSON.stringify(sessions, null, 2));
        console.log("Business ID:", businessId || params.businessId);
        console.log("Event Type:", eventType);
        console.log("Food Preference:", foodPreference);
        console.log("Cuisine:", cuisine);
        console.log("Venue:", venue);

        setLoading(true);
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("No authenticated user found");
                Alert.alert("Error", "Please login to create an order");
                setLoading(false);
                return;
            }

            console.log("✓ User authenticated:", user.id);

            // Check if customer record exists, create if not
            const { data: existingCustomer, error: customerCheckError } = await supabase
                .from('customers')
                .select('id')
                .eq('id', user.id)
                .single();

            if (customerCheckError && customerCheckError.code !== 'PGRST116') {
                console.error("Error checking customer:", customerCheckError);
            }

            if (!existingCustomer) {
                console.log("Creating customer record...");
                const { error: customerError } = await supabase
                    .from('customers')
                    .insert({
                        id: user.id,
                        email: user.email,
                        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Customer',
                        phone: user.user_metadata?.phone || '',
                    });

                if (customerError) {
                    console.error("Error creating customer:", customerError);
                    Alert.alert("Error", "Failed to create customer profile: " + customerError.message);
                    setLoading(false);
                    return;
                }
                console.log("✓ Customer record created");
            } else {
                console.log("✓ Customer record exists");
            }

            // Validate order data
            if (!selectedService) {
                console.log("ERROR: No service selected");
                Alert.alert(
                    "Select a Service",
                    "Please select one of the available services above before confirming your order."
                );
                return;
            }

            if (!businessId && !params.businessId) {
                console.log("ERROR: Business ID is missing");
                Alert.alert(
                    "Error",
                    "Business information is missing. Please go back and select a caterer again."
                );
                return;
            }

            if (!sessions || sessions.length === 0) {
                console.log("ERROR: No sessions found");
                Alert.alert(
                    "No Menu Found",
                    "You haven't created a menu yet. Please go back and create your menu first.\n\nSteps:\n1. Go back to home\n2. Select event type\n3. Create your menu\n4. Then return here to place order"
                );
                return;
            }

            console.log("✓ Order data validated");
            console.log("Submitting order to database...");

            // Create order in database
            const result = await submitOrder({
                businessId: businessId || params.businessId as string,
                eventType: eventType || "General Event",
                foodPreference: foodPreference || "mixed",
                cuisine: cuisine || "Not specified",
                serviceType: selectedService,
                venue: venue || "Not specified",
                sessions: sessions.map(session => ({
                    sessionName: session.sessionName,
                    date: session.date,
                    time: session.time || "",
                    venue: venue || "Not specified",
                    numberOfPeople: session.numberOfPeople,
                    servingType: session.servingType,
                    menuItems: Object.values(session.menuItems).map(item => ({
                        name: item.name,
                        category: item.category,
                        isVeg: item.isVeg
                    }))
                })),
                notes: params.notes as string || "",
            });

            console.log("✓ Order created successfully!");
            console.log("Order ID:", result.orderId);
            console.log("Order Number:", result.orderNumber);

            // Navigate to success screen
            console.log("Navigating to success screen...");
            router.push({
                pathname: "/customer/order-success",
                params: { orderNumber: result.orderNumber }
            } as any);

            console.log("=== ORDER COMPLETE ===");
        } catch (error: any) {
            console.error("=== ERROR CREATING ORDER ===");
            console.error("Error details:", error);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);

            Alert.alert(
                "Order Failed",
                `Failed to create order: ${error.message || 'Unknown error'}\n\nPlease try again or contact support.`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.title}>Available Services</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.servicesGrid}>
                    {AVAILABLE_SERVICES.map((service) => (
                        <TouchableOpacity
                            key={service.id}
                            style={[
                                styles.serviceCard,
                                selectedService === service.id && styles.selectedCard,
                            ]}
                            onPress={() => handleServiceSelect(service.id)}
                        >
                            <View
                                style={[
                                    styles.iconContainer,
                                    selectedService === service.id && styles.selectedIconContainer,
                                ]}
                            >
                                <Ionicons
                                    name={service.icon as any}
                                    size={32}
                                    color={selectedService === service.id ? "#fff" : "#007AFF"}
                                />
                            </View>
                            <Text style={styles.serviceName}>{service.name}</Text>
                            <Text style={styles.serviceDescription}>{service.description}</Text>
                            {selectedService === service.id && (
                                <View style={styles.checkmarkContainer}>
                                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                {/* Debug info */}
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 10, textAlign: 'center' }}>
                    Selected: {selectedService || 'None'} | Sessions: {sessions.length} | Loading: {loading ? 'Yes' : 'No'}
                </Text>

                <TouchableOpacity
                    style={[styles.confirmButton, loading && { backgroundColor: "#ccc" }]}
                    onPress={handleConfirmOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.confirmButtonText}>Confirm Order</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
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
    servicesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 15,
    },
    serviceCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        width: "100%",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#e0e0e0",
        position: "relative",
    },
    selectedCard: {
        borderColor: "#007AFF",
        backgroundColor: "#F0F8FF",
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#E3F2FD",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    selectedIconContainer: {
        backgroundColor: "#007AFF",
    },
    serviceName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 8,
        textAlign: "center",
    },
    serviceDescription: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
    },
    checkmarkContainer: {
        position: "absolute",
        top: 15,
        right: 15,
    },
    footer: {
        padding: 20,
        paddingBottom: 90,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    confirmButton: {
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    confirmButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
