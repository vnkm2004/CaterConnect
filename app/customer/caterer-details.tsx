import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function CatererDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse tags if they come as a string or array
    const tags = typeof params.tags === 'string' ? params.tags.split(',') : (params.tags || []);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: params.image as string }} style={styles.image} />
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.overlay} />
                    <View style={styles.headerInfo}>
                        <Text style={styles.name}>{params.name}</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={18} color="#FFD700" />
                            <Text style={styles.rating}>{params.rating}</Text>
                            <Text style={styles.reviews}>({params.reviews} reviews)</Text>
                        </View>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Tags */}
                    <View style={styles.tagsContainer}>
                        {tags.map((tag: string, index: number) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag.trim()}</Text>
                            </View>
                        ))}
                    </View>

                    {/* About Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.description}>
                            We are dedicated to providing the best catering experience for your special events.
                            With years of experience in {params.specialty}, we ensure every dish is crafted with perfection.
                            Our team of expert chefs and professional staff will make your event memorable.
                        </Text>
                    </View>

                    {/* Available Services Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Services</Text>
                        <View style={styles.servicesGrid}>
                            <View style={styles.serviceCard}>
                                <View style={[styles.serviceIcon, { backgroundColor: "#e3f2fd" }]}>
                                    <Ionicons name="restaurant-outline" size={24} color="#1976d2" />
                                </View>
                                <Text style={styles.serviceTitle}>Hire Cooks</Text>
                                <Text style={styles.serviceDesc}>You provide ingredients & supply. We cook.</Text>
                            </View>
                            <View style={styles.serviceCard}>
                                <View style={[styles.serviceIcon, { backgroundColor: "#e8f5e9" }]}>
                                    <Ionicons name="nutrition-outline" size={24} color="#2e7d32" />
                                </View>
                                <Text style={styles.serviceTitle}>Cook & Supply</Text>
                                <Text style={styles.serviceDesc}>You provide ingredients. We cook & serve.</Text>
                            </View>
                            <View style={styles.serviceCard}>
                                <View style={[styles.serviceIcon, { backgroundColor: "#fff3e0" }]}>
                                    <Ionicons name="ribbon-outline" size={24} color="#f57c00" />
                                </View>
                                <Text style={styles.serviceTitle}>Full Catering</Text>
                                <Text style={styles.serviceDesc}>We handle everything. Full service.</Text>
                            </View>
                        </View>
                    </View>

                    {/* Reviews Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Reviews</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Dummy Reviews */}
                        {[1, 2].map((review) => (
                            <View key={review} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.reviewerInfo}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>U{review}</Text>
                                        </View>
                                        <Text style={styles.reviewerName}>User {review}</Text>
                                    </View>
                                    <View style={styles.reviewRating}>
                                        <Ionicons name="star" size={14} color="#FFD700" />
                                        <Text style={styles.reviewRatingText}>5.0</Text>
                                    </View>
                                </View>
                                <Text style={styles.reviewText}>
                                    Amazing food and service! The team was very professional and the guests loved everything.
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={styles.queryButton}
                    onPress={() => router.push(`/chat/business-${params.id}` as any)}
                >
                    <Ionicons name="chatbubble-outline" size={24} color="#007AFF" />
                    <Text style={styles.queryButtonText}>Query</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.orderButton}
                    onPress={() => router.push("/customer/create-order/food-preference")}
                >
                    <Text style={styles.orderButtonText}>Create Order</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageContainer: {
        height: 300,
        width: "100%",
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerInfo: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
    },
    name: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    rating: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        marginLeft: 4,
    },
    reviews: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        marginLeft: 6,
    },
    content: {
        padding: 20,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 24,
    },
    tag: {
        backgroundColor: "#f0f7ff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#d0e3ff",
    },
    tagText: {
        fontSize: 13,
        color: "#007AFF",
        fontWeight: "500",
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    seeAll: {
        color: "#007AFF",
        fontSize: 14,
        fontWeight: "600",
    },
    description: {
        fontSize: 15,
        color: "#666",
        lineHeight: 24,
    },
    reviewCard: {
        backgroundColor: "#f8f9fa",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    reviewerInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#e0e0e0",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    avatarText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#666",
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        marginBottom: 15,
        backgroundColor: '#000000',
    },
    reviewRating: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    reviewRatingText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginLeft: 4,
    },
    reviewText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    actionBar: {
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        flexDirection: "row",
        padding: 20,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        gap: 15,
    },
    queryButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f7ff",
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#007AFF",
    },
    queryButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#007AFF",
        marginLeft: 8,
    },
    orderButton: {
        flex: 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007AFF",
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: "#007AFF",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    orderButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    servicesGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    serviceCard: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#eee",
        alignItems: "center",
    },
    serviceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    serviceTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 4,
        textAlign: "center",
    },
    serviceDesc: {
        fontSize: 10,
        color: "#666",
        textAlign: "center",
        lineHeight: 14,
    },
});
