import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPendingBusinesses, approveBusiness, rejectBusiness } from '../../services/database';
import { supabase } from '../../config/supabase';

export default function AdminPanelScreen() {
    const [pendingBusinesses, setPendingBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkAdminAccess();
        loadPendingBusinesses();
    }, []);

    const checkAdminAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email?.toLowerCase() !== 'admin@caterconnect.com') {
            Alert.alert('Access Denied', 'You are not authorized to access this page.');
            router.replace('/');
        }
    };

    const loadPendingBusinesses = async () => {
        try {
            setLoading(true);
            const businesses = await getPendingBusinesses();
            setPendingBusinesses(businesses);
        } catch (error) {
            console.error('Error loading pending businesses:', error);
            Alert.alert('Error', 'Failed to load pending businesses');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleApprove = async (businessId: string, businessName: string) => {
        Alert.alert(
            'Approve Business',
            `Are you sure you want to approve "${businessName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        try {
                            await approveBusiness(businessId);
                            Alert.alert('Success', `${businessName} has been approved!`);
                            loadPendingBusinesses();
                        } catch (error) {
                            console.error('Error approving business:', error);
                            Alert.alert('Error', 'Failed to approve business');
                        }
                    },
                },
            ]
        );
    };

    const handleReject = async (businessId: string, businessName: string) => {
        Alert.alert(
            'Reject Business',
            `Are you sure you want to reject and delete "${businessName}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rejectBusiness(businessId);
                            Alert.alert('Success', `${businessName} has been rejected and deleted.`);
                            loadPendingBusinesses();
                        } catch (error) {
                            console.error('Error rejecting business:', error);
                            Alert.alert('Error', 'Failed to reject business');
                        }
                    },
                },
            ]
        );
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Admin Panel</Text>
                    <Text style={styles.subtitle}>Pending Business Approvals</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={pendingBusinesses}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => {
                            setRefreshing(true);
                            loadPendingBusinesses();
                        }} />
                    }
                    ListEmptyComponent={
                        <View style={styles.centerContent}>
                            <Ionicons name="checkmark-circle-outline" size={64} color="#34C759" />
                            <Text style={styles.emptyText}>No pending businesses!</Text>
                            <Text style={styles.emptySubtext}>All businesses have been reviewed.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.businessName}>{item.name}</Text>
                                <View style={styles.pendingBadge}>
                                    <Text style={styles.pendingText}>Pending</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="mail-outline" size={16} color="#666" />
                                <Text style={styles.infoText}>{item.email}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="call-outline" size={16} color="#666" />
                                <Text style={styles.infoText}>{item.phone}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={16} color="#666" />
                                <Text style={styles.infoText}>{item.address}</Text>
                            </View>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.approveButton]}
                                    onPress={() => handleApprove(item.id, item.name)}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Approve</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.rejectButton]}
                                    onPress={() => handleReject(item.id, item.name)}
                                >
                                    <Ionicons name="close-circle" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    logoutButton: {
        padding: 8,
    },
    listContent: {
        padding: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    businessName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
    },
    pendingBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pendingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400E',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#6B7280',
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    approveButton: {
        backgroundColor: '#34C759',
    },
    rejectButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
});
