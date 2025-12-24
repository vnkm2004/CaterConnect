import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../config/supabase';
import { getBusinessByUserId } from '../../services/database';

export default function PendingVerificationScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace('/business-login');
                return;
            }

            const business = await getBusinessByUserId(user.id);

            if (business?.businessInfo.verified) {
                Alert.alert('Success', 'Your account has been verified!');
                router.replace('/business');
            } else {
                Alert.alert('Status', 'Your account is still pending verification. Please check back later.');
            }
        } catch (error) {
            console.error('Error checking status:', error);
            Alert.alert('Error', 'Failed to check status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.replace('/business-login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Verification Pending</Text>
                <Text style={styles.description}>
                    Thank you for registering your business! Your account is currently under review by our admin team.
                </Text>
                <Text style={styles.description}>
                    Once verified, you will have full access to the business dashboard to manage your orders and profile.
                </Text>

                <TouchableOpacity
                    style={styles.checkButton}
                    onPress={checkStatus}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Check Status</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={loading}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 24,
    },
    checkButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        marginTop: 15,
        padding: 10,
    },
    logoutText: {
        color: '#666',
        fontSize: 16,
    },
});
