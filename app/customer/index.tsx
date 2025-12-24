import React from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ServiceCarousel from "../../components/ServiceCarousel";
import { getAllBusinesses } from "../../services/database";

export default function CustomerDashboard() {
    const [businesses, setBusinesses] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();

    React.useEffect(() => {
        loadBusinesses();
    }, []);

    const loadBusinesses = async () => {
        try {
            const data = await getAllBusinesses();
            setBusinesses(data);
        } catch (error) {
            console.error("Error loading businesses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBusiness = (businessId: string) => {
        router.push({
            pathname: "/customer/select-event-type",
            params: { businessId }
        });
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Customer Home</Text>
                <Text style={styles.subtitle}>Welcome to your dashboard.</Text>
            </View>

            <ServiceCarousel />

            <Text style={styles.sectionTitle}>Available Caterers</Text>

            <View style={styles.listContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#4F46E5" />
                ) : businesses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="restaurant-outline" size={48} color="#9CA3AF" />
                        <Text style={styles.emptyText}>No caterers found.</Text>
                    </View>
                ) : (
                    businesses.map((business) => (
                        <TouchableOpacity
                            key={business.businessId}
                            style={styles.card}
                            onPress={() => handleSelectBusiness(business.businessId)}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIcon}>
                                    <Ionicons name="business" size={24} color="#4F46E5" />
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardTitle}>{business.businessInfo.name}</Text>
                                    <Text style={styles.cardSubtitle}>{business.businessInfo.email}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                            </View>
                            <View style={styles.cardFooter}>
                                <Ionicons name="location-outline" size={16} color="#6B7280" />
                                <Text style={styles.cardAddress} numberOfLines={1}>
                                    {business.businessInfo.address || "No address provided"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB", // Gray 50
    },
    headerContainer: {
        padding: 24,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827", // Gray 900
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: "#6B7280", // Gray 500
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginTop: 24,
        marginBottom: 16,
        paddingHorizontal: 24,
        letterSpacing: -0.3,
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#EEF2FF", // Indigo 50
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 14,
        color: "#6B7280",
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F9FAFB",
    },
    cardAddress: {
        fontSize: 13,
        color: "#6B7280",
        marginLeft: 6,
        flex: 1,
    },
    emptyState: {
        alignItems: "center",
        padding: 32,
    },
    emptyText: {
        textAlign: "center",
        color: "#9CA3AF",
        marginTop: 12,
        fontSize: 15,
    },
});
