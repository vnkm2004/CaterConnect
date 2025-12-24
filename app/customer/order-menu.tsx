import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import * as Sharing from 'expo-sharing';
import { generateMenuPDF } from '../../utils/pdfGenerator';

export default function OrderMenuScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generatingPDF, setGeneratingPDF] = useState(false);

    useEffect(() => {
        loadOrderMenu();
    }, [orderId]);

    const loadOrderMenu = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    business:businesses(name, phone, email, address),
                    customer:customers(name, phone, email)
                `)
                .eq('id', orderId)
                .single();

            if (error) throw error;
            setOrder(data);
        } catch (error: any) {
            console.error('Error loading order menu:', error);
            Alert.alert('Error', 'Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!order) return;

        setGeneratingPDF(true);
        try {
            const pdfUri = await generateMenuPDF(order);

            // Share/download the PDF
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(pdfUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `Menu - Order #${order.order_number}`,
                    UTI: 'com.adobe.pdf'
                });
            } else {
                Alert.alert('Success', `PDF saved to: ${pdfUri}`);
            }
        } catch (error: any) {
            console.error('Error generating PDF:', error);
            Alert.alert('Error', 'Failed to generate PDF: ' + error.message);
        } finally {
            setGeneratingPDF(false);
        }
    };

    const renderSession = (session: any, sessionKey: string, dayIndex: number) => {
        const menuItems = session.menuItems || {};
        const itemsArray = Object.values(menuItems);

        return (
            <View key={sessionKey} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                    <View>
                        <Text style={styles.sessionName}>{session.sessionName}</Text>
                        <Text style={styles.sessionDetails}>
                            {session.servingType} • {session.numberOfPeople} people
                        </Text>
                    </View>
                    <Ionicons name="restaurant" size={24} color="#007AFF" />
                </View>

                {itemsArray.length > 0 ? (
                    <View style={styles.menuItems}>
                        {itemsArray.map((item: any, idx: number) => (
                            <View key={idx} style={styles.menuItem}>
                                <View style={styles.menuItemHeader}>
                                    <Text style={styles.menuItemName}>
                                        {item.isVeg ? '🟢' : '🔴'} {item.name}
                                    </Text>
                                    <Text style={styles.menuItemQty}>×{item.quantity}</Text>
                                </View>
                                <Text style={styles.menuItemCategory}>{item.category}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.noItems}>No menu items</Text>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading menu...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Order not found</Text>
            </View>
        );
    }

    const sessions = order.sessions || {};
    const sessionKeys = Object.keys(sessions);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Menu</Text>
                <TouchableOpacity onPress={handleDownloadPDF} disabled={generatingPDF}>
                    {generatingPDF ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                        <Ionicons name="download" size={24} color="#007AFF" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {/* Order Info */}
                <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>#{order.order_number}</Text>
                    <Text style={styles.eventType}>{order.event_type} Catering</Text>
                    {order.venue && (
                        <Text style={styles.venue}>📍 {order.venue}</Text>
                    )}
                </View>

                {/* Sessions */}
                {sessionKeys.length > 0 ? (
                    sessionKeys.map((key, index) => renderSession(sessions[key], key, index))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="restaurant-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No menu items yet</Text>
                    </View>
                )}

                {/* Edit Button */}
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push(`/customer/edit-order-menu?orderId=${orderId}` as any)}
                >
                    <Ionicons name="pencil" size={20} color="#fff" />
                    <Text style={styles.editButtonText}>Edit Menu</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#999',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    orderInfo: {
        backgroundColor: '#007AFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    orderNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    eventType: {
        fontSize: 18,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 5,
    },
    venue: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
    },
    sessionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sessionName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    sessionDetails: {
        fontSize: 14,
        color: '#666',
    },
    menuItems: {
        gap: 12,
    },
    menuItem: {
        paddingVertical: 8,
    },
    menuItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1a1a1a',
        flex: 1,
    },
    menuItemQty: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    menuItemCategory: {
        fontSize: 13,
        color: '#999',
    },
    noItems: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
    editButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 20,
        gap: 8,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
