import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAllBusinesses } from "../../services/database";
import { useOrder } from "../../contexts/OrderContext";

const CATERERS = [
    {
        id: "1",
        name: "Wedding Catering Co.",
        rating: 4.8,
        reviews: 120,
        image: "https://images.unsplash.com/photo-1519225468063-3f837f996c34?q=80&w=2070&auto=format&fit=crop",
        specialty: "Weddings, Large Events",
        tags: ["Veg", "Non-Veg", "North Indian", "Continental"],
    },
    {
        id: "2",
        name: "Corporate Bites",
        rating: 4.5,
        reviews: 85,
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop",
        specialty: "Corporate, Lunches",
        tags: ["Veg", "Healthy", "South Indian"],
    },
    {
        id: "3",
        name: "Party Platterz",
        rating: 4.2,
        reviews: 50,
        image: "https://images.unsplash.com/photo-1530103862676-de3c9da59af7?q=80&w=2069&auto=format&fit=crop",
        specialty: "Birthdays, Casual",
        tags: ["Veg", "Non-Veg", "Fast Food", "Chinese"],
    },
    {
        id: "4",
        name: "Gourmet Gatherings",
        rating: 4.9,
        reviews: 200,
        image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
        specialty: "Social, High-end",
        tags: ["Pure Veg", "Italian", "Mexican", "Desserts"],
    },
];

export default function SelectCatererScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { setBusinessId } = useOrder();
    const [searchQuery, setSearchQuery] = useState("");
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const eventType = params.eventType || "Event";

    React.useEffect(() => {
        loadBusinesses();
    }, []);

    const loadBusinesses = async () => {
        try {
            setLoading(true);
            const data = await getAllBusinesses();
            setBusinesses(data);
        } catch (error) {
            console.error("Error loading businesses:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCaterers = businesses.filter((business) =>
        business.businessInfo.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>Select Caterer</Text>
                    <Text style={styles.subtitle}>for {eventType}</Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search caterers..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={filteredCaterers}
                    keyExtractor={(item) => item.businessId}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.centerContent}>
                            <Text style={styles.emptyText}>No caterers found</Text>
                            <Text style={{ marginTop: 10, color: 'red', fontSize: 12 }}>
                                Debug: Found {businesses.length} items.
                            </Text>
                            <TouchableOpacity onPress={loadBusinesses} style={{ marginTop: 20, padding: 10, backgroundColor: '#eee', borderRadius: 5 }}>
                                <Text>Retry Loading</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => {
                                // Save business ID to context
                                setBusinessId(item.businessId);

                                router.push({
                                    pathname: "/customer/caterer-details",
                                    params: {
                                        id: item.businessId,
                                        name: item.businessInfo.name,
                                        image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop", // Placeholder image
                                        rating: item.businessInfo.rating || 0,
                                        reviews: item.businessInfo.totalOrders || 0,
                                        specialty: item.businessInfo.services?.[0] || "Catering",
                                        tags: (item.businessInfo.services || []).join(','),
                                        description: item.businessInfo.description,
                                        phone: item.businessInfo.phone,
                                        email: item.businessInfo.email,
                                        address: item.businessInfo.address
                                    }
                                });
                            }}
                        >
                            <Image
                                source={{ uri: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" }}
                                style={styles.cardImage}
                            />
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.nameContainer}>
                                        <Text style={styles.catererName}>{item.businessInfo.name}</Text>
                                        {item.businessInfo.verified && (
                                            <Ionicons name="checkmark-circle" size={18} color="#007AFF" style={styles.verifiedIcon} />
                                        )}
                                    </View>
                                    <View style={styles.ratingContainer}>
                                        <Ionicons name="star" size={16} color="#FFD700" />
                                        <Text style={styles.ratingText}>{item.businessInfo.rating?.toFixed(1) || "New"}</Text>
                                        <Text style={styles.reviewsText}>({item.businessInfo.totalOrders || 0} orders)</Text>
                                    </View>
                                </View>
                                <Text style={styles.specialty} numberOfLines={1}>
                                    {item.businessInfo.description || item.businessInfo.services?.[0] || "Professional Catering"}
                                </Text>
                                <View style={styles.tagsContainer}>
                                    {(item.businessInfo.services || []).slice(0, 3).map((tag: string, index: number) => (
                                        <View key={index} style={styles.tag}>
                                            <Text style={styles.tagText}>{tag}</Text>
                                        </View>
                                    ))}
                                    {(item.businessInfo.services?.length || 0) > 3 && (
                                        <View style={styles.tag}>
                                            <Text style={styles.tagText}>+{item.businessInfo.services.length - 3} more</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB", // Gray 50
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 24,
        paddingTop: 60,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        margin: 24,
        paddingHorizontal: 16,
        borderRadius: 12,
        height: 50,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#1F2937",
    },
    listContent: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    cardImage: {
        width: "100%",
        height: 160,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    nameContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    catererName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginRight: 6,
    },
    verifiedIcon: {
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFBEB", // Amber 50
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        marginLeft: 4,
        fontWeight: "700",
        color: "#B45309", // Amber 700
        fontSize: 13,
    },
    reviewsText: {
        marginLeft: 4,
        color: "#92400E", // Amber 800
        fontSize: 12,
    },
    specialty: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: {
        backgroundColor: "#EEF2FF", // Indigo 50
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        color: "#4F46E5", // Indigo 600
        fontWeight: "600",
    },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: "#9CA3AF",
        textAlign: "center",
    },
    queryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF2FF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginTop: 12,
        gap: 6,
    },
    queryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
});
