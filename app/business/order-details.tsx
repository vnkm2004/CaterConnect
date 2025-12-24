import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../../config/supabase';
import { updateOrder, uploadMenuFile, deleteMenuFile, MenuFile } from '../../services/database';

export default function BusinessOrderDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            console.log('Loading order details for orderId:', orderId);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    customer:customers(name, phone, email)
                `)
                .eq('id', orderId)
                .single();

            console.log('Order data received:', data);
            console.log('Order error:', error);

            if (error) throw error;
            setOrder(data);
        } catch (error: any) {
            console.error('Error loading order:', error);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        Alert.alert(
            'Update Status',
            `Are you sure you want to mark this order as ${newStatus}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            setUpdating(true);
                            console.log('Updating order status to:', newStatus);

                            const { error } = await supabase
                                .from('orders')
                                .update({
                                    status: newStatus,
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', orderId);

                            if (error) {
                                console.error('Update status error:', error);
                                throw error;
                            }

                            console.log('Order status updated successfully');

                            // Refresh order details
                            await loadOrderDetails();
                            Alert.alert('Success', `Order status updated to ${newStatus}`);
                        } catch (error: any) {
                            console.error('Error updating status:', error);
                            Alert.alert('Error', 'Failed to update status: ' + (error.message || 'Unknown error'));
                        } finally {
                            setUpdating(false);
                        }
                    }
                }
            ]
        );
    };

    const handleUploadMenuFile = async () => {
        try {
            // Pick document
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const file = result.assets[0];
            setUploadingFile(true);

            await uploadMenuFile(
                orderId,
                file.uri,
                file.name,
                file.mimeType || 'application/octet-stream',
                'business'
            );

            Alert.alert('Success', 'Menu file uploaded successfully');
            await loadOrderDetails();
        } catch (error: any) {
            console.error('Error uploading file:', error);
            Alert.alert('Error', 'Failed to upload file: ' + (error.message || 'Unknown error'));
        } finally {
            setUploadingFile(false);
        }
    };

    const handleDeleteMenuFile = async (fileUrl: string, fileName: string) => {
        Alert.alert(
            'Delete File',
            `Are you sure you want to delete ${fileName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setUpdating(true);
                            await deleteMenuFile(orderId, fileUrl);
                            Alert.alert('Success', 'File deleted successfully');
                            await loadOrderDetails();
                        } catch (error: any) {
                            console.error('Error deleting file:', error);
                            Alert.alert('Error', 'Failed to delete file');
                        } finally {
                            setUpdating(false);
                        }
                    }
                }
            ]
        );
    };

    const handleOpenFile = async (fileUrl: string) => {
        try {
            const supported = await Linking.canOpenURL(fileUrl);
            if (supported) {
                await Linking.openURL(fileUrl);
            } else {
                Alert.alert('Error', 'Cannot open this file type');
            }
        } catch (error) {
            console.error('Error opening file:', error);
            Alert.alert('Error', 'Failed to open file');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#FFA500';
            case 'confirmed': return '#4CAF50';
            case 'preparing': return '#2196F3';
            case 'completed': return '#34C759';
            case 'cancelled': return '#FF3B30';
            case 'rejected': return '#FF3B30';
            default: return '#999';
        }
    };

    const renderActionButtons = () => {
        console.log('renderActionButtons called, order:', order);
        if (!order) {
            console.log('No order data, buttons will not render');
            return null;
        }

        const status = order.status.toLowerCase();
        console.log('Order status for buttons:', status);

        return (
            <View style={styles.actionButtonsRow}>
                {status === 'pending' && (
                    <>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleUpdateStatus('rejected')}
                            disabled={updating}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="close-circle" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Reject</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.acceptButton]}
                            onPress={() => handleUpdateStatus('confirmed')}
                            disabled={updating}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Accept</Text>
                            </View>
                        </TouchableOpacity>
                    </>
                )}

                {status === 'confirmed' && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.primaryButton]}
                        onPress={() => handleUpdateStatus('preparing')}
                        disabled={updating}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="restaurant" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Start Preparing</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {status === 'preparing' && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.successButton]}
                        onPress={() => handleUpdateStatus('completed')}
                        disabled={updating}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Mark as Completed</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.actionButton, styles.chatButton]}
                    onPress={() => router.push(`/chat/${orderId}` as any)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Chat</Text>
                    </View>
                </TouchableOpacity>
            </View>
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
                {/* Order Number & Status */}
                <View style={styles.orderNumberCard}>
                    <View style={styles.rowBetween}>
                        <View>
                            <Text style={styles.orderNumberLabel}>Order Number</Text>
                            <Text style={styles.orderNumber}>#{order.order_number}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text style={styles.orderDate}>
                        {new Date(order.created_at).toLocaleString('en-IN', {
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </Text>
                </View>

                {/* Customer Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="person" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{order.customer?.name || 'Guest'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{order.customer?.phone || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="mail" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>{order.customer?.email || 'N/A'}</Text>
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
                    <Text style={styles.sectionTitle}>Venue</Text>
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
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                            <TouchableOpacity onPress={() => router.push(`/customer/edit-order-menu?orderId=${orderId}` as any)}>
                                <Ionicons name="pencil" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.infoCard}>
                        {order.sessions ? (
                            Object.entries(order.sessions).map(([key, session]: [string, any], index) => (
                                <View key={key} style={index > 0 ? styles.sessionSeparator : undefined}>
                                    <View style={styles.sessionHeader}>
                                        <Text style={styles.sessionTitle}>{session.sessionName}</Text>
                                    </View>

                                    {/* Session Details */}
                                    <View style={styles.sessionMeta}>
                                        {session.date && (
                                            <View style={styles.metaItem}>
                                                <Ionicons name="calendar-outline" size={14} color="#666" />
                                                <Text style={styles.metaText}>{session.date}</Text>
                                            </View>
                                        )}
                                        {session.time && (
                                            <View style={styles.metaItem}>
                                                <Ionicons name="time-outline" size={14} color="#666" />
                                                <Text style={styles.metaText}>{session.time}</Text>
                                            </View>
                                        )}
                                        {session.numberOfPeople > 0 && (
                                            <View style={styles.metaItem}>
                                                <Ionicons name="people-outline" size={14} color="#666" />
                                                <Text style={styles.metaText}>{session.numberOfPeople} Guests</Text>
                                            </View>
                                        )}
                                        {session.servingType && (
                                            <View style={styles.metaItem}>
                                                <Ionicons name="restaurant-outline" size={14} color="#666" />
                                                <Text style={styles.metaText}>{session.servingType}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.menuItemsList}>
                                        {session.menuItems && Object.values(session.menuItems).map((item: any, idx: number) => (
                                            <Text key={idx} style={styles.menuItemText}>
                                                • {item.name} ({item.quantity})
                                            </Text>
                                        ))}
                                        {(!session.menuItems || Object.keys(session.menuItems).length === 0) && (
                                            <Text style={styles.emptyMenuText}>No items listed</Text>
                                        )}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.infoText}>No menu details</Text>
                        )}
                    </View>
                </View>

                {/* Menu Files Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Menu Files</Text>
                        {(order.status === 'confirmed' || order.status === 'preparing') && (
                            <TouchableOpacity
                                onPress={handleUploadMenuFile}
                                disabled={uploadingFile}
                                style={styles.uploadButton}
                            >
                                {uploadingFile ? (
                                    <ActivityIndicator size="small" color="#007AFF" />
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload-outline" size={18} color="#007AFF" />
                                        <Text style={styles.uploadButtonText}>Upload</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.infoCard}>
                        {order.menu_files && order.menu_files.length > 0 ? (
                            order.menu_files.map((file: MenuFile, index: number) => (
                                <View key={index} style={[styles.fileItem, index > 0 && styles.fileItemBorder]}>
                                    <TouchableOpacity
                                        style={styles.fileInfo}
                                        onPress={() => handleOpenFile(file.url)}
                                    >
                                        <Ionicons
                                            name={file.type?.includes('pdf') ? 'document-text' : 'image'}
                                            size={24}
                                            color="#007AFF"
                                        />
                                        <View style={styles.fileDetails}>
                                            <Text style={styles.fileName}>{file.name}</Text>
                                            <Text style={styles.fileDate}>
                                                {new Date(file.uploadedAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    {(order.status === 'confirmed' || order.status === 'preparing') && (
                                        <TouchableOpacity
                                            onPress={() => handleDeleteMenuFile(file.url, file.name)}
                                            style={styles.deleteFileButton}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyMenuText}>No menu files uploaded yet</Text>
                        )}
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
            </ScrollView>

            {/* Footer Actions */}
            {renderActionButtons()}
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
        paddingBottom: 20,
    },
    orderNumberCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    orderNumberLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    orderNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    orderDate: {
        fontSize: 14,
        color: '#999',
    },
    statusBadge: {
        paddingHorizontal: 12,
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 10,
        marginLeft: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    sessionSeparator: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sessionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    menuItemsList: {
        gap: 6,
    },
    menuItemText: {
        fontSize: 15,
        color: '#444',
    },
    emptyMenuText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    rejectButton: {
        backgroundColor: '#FF3B30',
    },
    acceptButton: {
        backgroundColor: '#34C759',
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    successButton: {
        backgroundColor: '#34C759',
    },
    chatButton: {
        backgroundColor: '#5856D6',
    },
    actionButtonsRow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 30,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        zIndex: 1000,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginHorizontal: 5,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    // New styles for session details
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sessionMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#666',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#f0f8ff',
    },
    uploadButtonText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    fileItemBorder: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontSize: 15,
        color: '#1a1a1a',
        fontWeight: '500',
        marginBottom: 2,
    },
    fileDate: {
        fontSize: 12,
        color: '#999',
    },
    deleteFileButton: {
        padding: 8,
    },
});
