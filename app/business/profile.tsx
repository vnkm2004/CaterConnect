import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Switch,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../config/supabase";
import {
    getBusinessByUserId,
    updateBusiness,
    updateBusinessServices,
    updateAcceptingOrders,
} from "../../services/database";

// Predefined service options
const PREDEFINED_SERVICES = [
    "Wedding Catering",
    "Corporate Events",
    "Birthday Parties",
    "Social Gatherings",
    "Hire Cooks",
    "Cook & Supply",
    "Full Catering",
    "Breakfast Service",
    "Lunch Service",
    "Dinner Service",
    "Snacks & Appetizers",
    "Desserts & Sweets",
];

export default function BusinessProfile() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [businessId, setBusinessId] = useState<string | null>(null);

    const [acceptingOrders, setAcceptingOrders] = useState(true);
    const [businessData, setBusinessData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        description: "",
        services: [] as string[],
        rating: 0,
        totalOrders: 0,
    });

    const [newService, setNewService] = useState("");

    // Load business data
    useEffect(() => {
        loadBusinessData();
    }, []);

    const loadBusinessData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert("Error", "Please log in to view your profile");
                router.replace("/business-login" as any);
                return;
            }

            // Get business data from database
            const { data: businessRecord, error } = await supabase
                .from("businesses")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error) {
                console.error("Error loading business:", error);
                Alert.alert("Error", "Failed to load business profile");
                return;
            }

            if (businessRecord) {
                setBusinessId(businessRecord.id);
                setBusinessData({
                    name: businessRecord.name || "",
                    email: businessRecord.email || "",
                    phone: businessRecord.phone || "",
                    address: businessRecord.address || "",
                    description: businessRecord.description || "",
                    services: businessRecord.services || [],
                    rating: businessRecord.stats?.rating || 0,
                    totalOrders: businessRecord.stats?.totalOrders || 0,
                });
                setAcceptingOrders(businessRecord.accepting_orders ?? true);
            }
        } catch (error: any) {
            console.error("Error loading business data:", error);
            Alert.alert("Error", error.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        console.log("handleSave called, businessId:", businessId);
        if (!businessId) {
            Alert.alert("Error", "Business ID not found");
            return;
        }

        // Validation
        if (!businessData.name.trim()) {
            Alert.alert("Validation Error", "Business name is required");
            return;
        }
        if (!businessData.email.trim()) {
            Alert.alert("Validation Error", "Email is required");
            return;
        }
        if (!businessData.phone.trim()) {
            Alert.alert("Validation Error", "Phone is required");
            return;
        }

        try {
            setSaving(true);
            console.log("Saving business data:", businessData);

            // Update business information
            await updateBusiness(businessId, {
                name: businessData.name,
                email: businessData.email,
                phone: businessData.phone,
                address: businessData.address,
                description: businessData.description,
            });
            console.log("Business info updated");

            // Update services
            await updateBusinessServices(businessId, businessData.services);
            console.log("Services updated");

            Alert.alert("Success", "Profile updated successfully!");
            setIsEditing(false);
        } catch (error: any) {
            console.error("Error saving profile:", error);
            Alert.alert("Error", error.message || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    const handleAcceptingOrdersToggle = async (value: boolean) => {
        if (!businessId) {
            console.error("No business ID found when toggling accepting orders");
            Alert.alert("Error", "Business profile not loaded completely. Please try again.");
            return;
        }

        console.log(`Toggling accepting orders to: ${value} for business: ${businessId}`);
        setAcceptingOrders(value);

        try {
            await updateAcceptingOrders(businessId, value);
            console.log("Successfully updated accepting orders status");
        } catch (error: any) {
            console.error("Error updating accepting orders:", error);
            Alert.alert("Error", "Failed to update accepting orders status");
            // Revert on error
            setAcceptingOrders(!value);
        }
    };

    const handleAddService = () => {
        if (newService.trim()) {
            setBusinessData({
                ...businessData,
                services: [...businessData.services, newService.trim()],
            });
            setNewService("");
        }
    };

    const handleRemoveService = (index: number) => {
        const updatedServices = businessData.services.filter((_, i) => i !== index);
        setBusinessData({ ...businessData, services: updatedServices });
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await supabase.auth.signOut();
                        router.replace("/business-login" as any);
                    },
                },
            ]
        );
    };

    const handleNotificationSettings = () => {
        Alert.alert(
            "Notification Settings",
            "Choose your notification preferences:",
            [
                {
                    text: "Order Updates",
                    onPress: () => Alert.alert("Info", "Order notification settings coming soon!"),
                },
                {
                    text: "Customer Messages",
                    onPress: () => Alert.alert("Info", "Message notification settings coming soon!"),
                },
                {
                    text: "Marketing",
                    onPress: () => Alert.alert("Info", "Marketing notification settings coming soon!"),
                },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    const handlePaymentMethods = () => {
        Alert.alert(
            "Payment Methods",
            "Manage your payment methods:",
            [
                {
                    text: "Add Bank Account",
                    onPress: () => Alert.alert("Info", "Bank account integration coming soon!"),
                },
                {
                    text: "Add UPI",
                    onPress: () => Alert.alert("Info", "UPI integration coming soon!"),
                },
                {
                    text: "View Saved Methods",
                    onPress: () => Alert.alert("Info", "No payment methods saved yet."),
                },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    const handleHelpSupport = () => {
        Alert.alert(
            "Help & Support",
            "How can we help you?",
            [
                {
                    text: "FAQs",
                    onPress: () => Alert.alert("FAQs", "Common questions:\n\n1. How do I accept orders?\n2. How do I update my menu?\n3. How do I contact customers?\n\nFor more help, contact support@caterconnect.com"),
                },
                {
                    text: "Contact Support",
                    onPress: () => Alert.alert("Contact Support", "Email: support@caterconnect.com\nPhone: +91 1800-CATER\n\nWe're here to help 24/7!"),
                },
                {
                    text: "Report Issue",
                    onPress: () => Alert.alert("Report Issue", "Please email your issue to support@caterconnect.com with details and screenshots."),
                },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.title}>Business Profile</Text>
                <TouchableOpacity
                    onPress={isEditing ? handleSave : () => setIsEditing(true)}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                        <Text style={styles.editButton}>{isEditing ? "Save" : "Edit"}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="restaurant" size={48} color="#007AFF" />
                    </View>
                    {isEditing ? (
                        <TextInput
                            style={styles.businessNameInput}
                            value={businessData.name}
                            onChangeText={(text) =>
                                setBusinessData({ ...businessData, name: text })
                            }
                            placeholder="Business Name"
                        />
                    ) : (
                        <Text style={styles.businessName}>{businessData.name}</Text>
                    )}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="star" size={20} color="#FFD700" />
                            <Text style={styles.statValue}>{businessData.rating.toFixed(1)}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Ionicons name="receipt" size={20} color="#007AFF" />
                            <Text style={styles.statValue}>{businessData.totalOrders}</Text>
                            <Text style={styles.statLabel}>Orders</Text>
                        </View>
                    </View>
                </View>

                {/* Accepting Orders Toggle */}
                <View style={styles.section}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleLabel}>Accepting New Orders</Text>
                            <Text style={styles.toggleDescription}>
                                Turn off to stop receiving new order requests
                            </Text>
                        </View>
                        <Switch
                            value={acceptingOrders}
                            onValueChange={handleAcceptingOrdersToggle}
                            trackColor={{ false: "#e0e0e0", true: "#007AFF" }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Business Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Information</Text>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Email</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={businessData.email}
                                onChangeText={(text) =>
                                    setBusinessData({ ...businessData, email: text })
                                }
                                keyboardType="email-address"
                            />
                        ) : (
                            <Text style={styles.infoValue}>{businessData.email}</Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={businessData.phone}
                                onChangeText={(text) =>
                                    setBusinessData({ ...businessData, phone: text })
                                }
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text style={styles.infoValue}>{businessData.phone}</Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Address</Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={businessData.address}
                                onChangeText={(text) =>
                                    setBusinessData({ ...businessData, address: text })
                                }
                                multiline
                                numberOfLines={3}
                            />
                        ) : (
                            <Text style={styles.infoValue}>{businessData.address}</Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Description</Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={businessData.description}
                                onChangeText={(text) =>
                                    setBusinessData({ ...businessData, description: text })
                                }
                                multiline
                                numberOfLines={4}
                                placeholder="Describe your business..."
                            />
                        ) : (
                            <Text style={styles.infoValue}>{businessData.description || "No description"}</Text>
                        )}
                    </View>
                </View>

                {/* Services */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Services Offered</Text>

                    {isEditing ? (
                        <>
                            <Text style={styles.serviceSubtitle}>
                                Select services you offer (tap to toggle)
                            </Text>
                            <View style={styles.servicesContainer}>
                                {PREDEFINED_SERVICES.map((service, index) => {
                                    const isSelected = businessData.services.includes(service);
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.serviceBubble,
                                                isSelected && styles.serviceBubbleSelected,
                                            ]}
                                            onPress={() => {
                                                if (isSelected) {
                                                    // Remove service
                                                    setBusinessData({
                                                        ...businessData,
                                                        services: businessData.services.filter(
                                                            (s) => s !== service
                                                        ),
                                                    });
                                                } else {
                                                    // Add service
                                                    setBusinessData({
                                                        ...businessData,
                                                        services: [...businessData.services, service],
                                                    });
                                                }
                                            }}
                                        >
                                            <Ionicons
                                                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                                                size={18}
                                                color={isSelected ? "#fff" : "#007AFF"}
                                            />
                                            <Text
                                                style={[
                                                    styles.serviceBubbleText,
                                                    isSelected && styles.serviceBubbleTextSelected,
                                                ]}
                                            >
                                                {service}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Custom service input */}
                            <View style={styles.customServiceSection}>
                                <Text style={styles.customServiceLabel}>Add custom service:</Text>
                                <View style={styles.addServiceContainer}>
                                    <TextInput
                                        style={styles.addServiceInput}
                                        value={newService}
                                        onChangeText={setNewService}
                                        placeholder="Enter custom service..."
                                        onSubmitEditing={handleAddService}
                                    />
                                    <TouchableOpacity
                                        style={styles.addServiceButton}
                                        onPress={handleAddService}
                                    >
                                        <Ionicons name="add-circle" size={24} color="#007AFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Display custom services */}
                            {businessData.services.filter(s => !PREDEFINED_SERVICES.includes(s)).length > 0 && (
                                <View style={styles.customServicesDisplay}>
                                    <Text style={styles.customServiceLabel}>Custom services:</Text>
                                    <View style={styles.servicesContainer}>
                                        {businessData.services
                                            .filter(s => !PREDEFINED_SERVICES.includes(s))
                                            .map((service, index) => (
                                                <View key={index} style={styles.customServiceTag}>
                                                    <Text style={styles.customServiceTagText}>{service}</Text>
                                                    <TouchableOpacity
                                                        onPress={() => handleRemoveService(businessData.services.indexOf(service))}
                                                        style={styles.removeServiceButton}
                                                    >
                                                        <Ionicons name="close-circle" size={16} color="#FF3B30" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                    </View>
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={styles.servicesContainer}>
                            {businessData.services.length > 0 ? (
                                businessData.services.map((service, index) => (
                                    <View key={index} style={styles.serviceTag}>
                                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                                        <Text style={styles.serviceText}>{service}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noServicesText}>No services selected</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleNotificationSettings}
                    >
                        <Ionicons name="notifications-outline" size={24} color="#666" />
                        <Text style={styles.settingText}>Notification Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handlePaymentMethods}
                    >
                        <Ionicons name="card-outline" size={24} color="#666" />
                        <Text style={styles.settingText}>Payment Methods</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleHelpSupport}
                    >
                        <Ionicons name="help-circle-outline" size={24} color="#666" />
                        <Text style={styles.settingText}>Help & Support</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.settingItem, styles.logoutItem]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                        <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>

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
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a1a1a",
        flex: 1,
        textAlign: "center",
    },
    editButton: {
        fontSize: 16,
        color: "#007AFF",
        fontWeight: "600",
    },
    content: {
        flex: 1,
    },
    profileHeader: {
        backgroundColor: "#fff",
        alignItems: "center",
        paddingVertical: 30,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#f0f7ff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    businessName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    statItem: {
        alignItems: "center",
        paddingHorizontal: 30,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: "#e0e0e0",
    },
    section: {
        backgroundColor: "#fff",
        marginTop: 12,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 16,
    },
    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    toggleInfo: {
        flex: 1,
        marginRight: 16,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    toggleDescription: {
        fontSize: 13,
        color: "#666",
    },
    infoItem: {
        marginBottom: 20,
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
    },
    infoValue: {
        fontSize: 16,
        color: "#1a1a1a",
    },
    input: {
        fontSize: 16,
        color: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#f9f9f9",
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    servicesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    serviceTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f7ff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#d0e3ff",
    },
    serviceText: {
        fontSize: 14,
        color: "#007AFF",
        marginLeft: 6,
        fontWeight: "500",
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    settingText: {
        flex: 1,
        fontSize: 16,
        color: "#1a1a1a",
        marginLeft: 16,
    },
    logoutItem: {
        borderBottomWidth: 0,
    },
    logoutText: {
        color: "#FF3B30",
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
    businessNameInput: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#f9f9f9",
        textAlign: "center",
    },
    removeServiceButton: {
        marginLeft: 6,
    },
    addServiceContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        gap: 10,
    },
    addServiceInput: {
        flex: 1,
        height: 44,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        backgroundColor: "#f9f9f9",
    },
    addServiceButton: {
        padding: 8,
    },
    serviceSubtitle: {
        fontSize: 13,
        color: "#666",
        marginBottom: 12,
    },
    serviceBubble: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#007AFF",
        marginRight: 8,
        marginBottom: 8,
    },
    serviceBubbleSelected: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    serviceBubbleText: {
        fontSize: 14,
        color: "#007AFF",
        marginLeft: 6,
        fontWeight: "500",
    },
    serviceBubbleTextSelected: {
        color: "#fff",
    },
    customServiceSection: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    customServiceLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
    },
    customServicesDisplay: {
        marginTop: 16,
    },
    customServiceTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f7ff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#d0e3ff",
        marginRight: 8,
        marginBottom: 8,
    },
    customServiceTagText: {
        fontSize: 14,
        color: "#007AFF",
        fontWeight: "500",
    },
    noServicesText: {
        fontSize: 14,
        color: "#999",
        fontStyle: "italic",
    },
});
