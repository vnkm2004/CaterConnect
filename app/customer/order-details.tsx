import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';

export default function OrderDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
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
            console.error('Error loading order:', error);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = () => {
        console.log('Cancel button clicked!');
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('Cancelling order:', orderId);
                            const { error } = await supabase
                                .from('orders')
                                .update({
                                    status: 'cancelled',
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', orderId);

                            if (error) {
                                console.error('Cancel order error:', error);
                                throw error;
                            }

                            console.log('Order cancelled successfully');

                            // Reload order details to show updated status
                            await loadOrderDetails();

                            Alert.alert('Success', 'Order cancelled successfully');
                        } catch (error: any) {
                            console.error('Failed to cancel order:', error);
                            Alert.alert('Error', 'Failed to cancel order: ' + (error.message || 'Unknown error'));
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
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

    const canEdit = order.status === 'pending';
    const canCancel = ['pending', 'confirmed'].includes(order.status);

    console.log('Order status:', order.status);
    console.log('Can cancel:', canCancel);
    console.log('Can edit:', canEdit);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {/* Order Number */}
                <View style={styles.orderNumberCard}>
                    <Text style={styles.orderNumberLabel}>Order Number</Text>
                    <Text style={styles.orderNumber}>#{order.order_number}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Business Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Caterer</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="restaurant" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{order.business?.name || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{order.business?.phone || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Event Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Event Details</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{order.event_type}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="people" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{order.number_of_people || 0} People</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="fast-food" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{order.food_preference}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="restaurant" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{order.cuisine || 'Not specified'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="construct" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{order.service_type}</Text>
                        </View>
                    </View>
                </View>

                {/* Venue */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Venue</Text>
                        {canEdit && (
                            <TouchableOpacity onPress={() => {/* TODO: Edit venue */ }}>
                                <Ionicons name="pencil" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="location" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{order.venue || 'Not specified'}</Text>
                        </View>
                    </View>
                </View>

                {/* Menu */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Menu</Text>
                        {canEdit && (
                            <TouchableOpacity onPress={() => router.push(`/customer/edit-order-menu?orderId=${orderId}` as any)}>
                                <Ionicons name="pencil" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>
                            {order.sessions ? JSON.stringify(order.sessions, null, 2) : 'No menu items'}
                        </Text>
                    </View>
                </View>

                {/* Notes */}
                {order.notes && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Notes</Text>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoText}>{order.notes}</Text>
                        </View>
                    </View>
                )}

                {/* Order Date */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Placed</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>
                            {new Date(order.created_at).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.viewMenuButton}
                    onPress={() => router.push(`/customer/order-menu?orderId=${orderId}` as any)}
                >
                    <Ionicons name="restaurant" size={20} color="#007AFF" />
                    <Text style={styles.viewMenuButtonText}>View Full Menu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => router.push(`/chat/${orderId}` as any)}
                >
                    <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                    <Text style={styles.chatButtonText}>Chat with Caterer</Text>
                </TouchableOpacity>

                {canCancel && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelOrder}
                    >
                        <Ionicons name="close-circle" size={20} color="#fff" />
                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'pending': return '#FFA500';
        case 'confirmed': return '#4CAF50';
        case 'preparing': return '#2196F3';
        case 'delivered': return '#4CAF50';
        case 'cancelled': return '#F44336';
        default: return '#999';
    }
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
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        marginRight: 15,
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
    orderNumberCard: {
        backgroundColor: '#007AFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    orderNumberLabel: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 5,
    },
    orderNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: 10,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 10,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    footer: {
        padding: 20,
        paddingBottom: 90,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 12,
    },
    viewMenuButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    viewMenuButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#F44336',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    chatButton: {
        backgroundColor: '#5856D6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    chatButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
