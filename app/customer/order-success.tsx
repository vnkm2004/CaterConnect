import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function OrderSuccessScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const orderNumber = params.orderNumber as string;

    // Animation values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Start animations
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Auto-redirect after 3 seconds
        const timeout = setTimeout(() => {
            router.replace('/customer/orders');
        }, 3000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <LinearGradient
            colors={['#4CAF50', '#45a049', '#2E7D32']}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Animated Checkmark */}
                <Animated.View
                    style={[
                        styles.checkmarkContainer,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.checkmarkCircle}>
                        <Ionicons name="checkmark" size={80} color="#fff" />
                    </View>
                </Animated.View>

                {/* Success Text */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <Text style={styles.successTitle}>Order Placed!</Text>
                    <Text style={styles.successSubtitle}>
                        Your order has been successfully created
                    </Text>

                    {/* Order Number */}
                    <View style={styles.orderNumberContainer}>
                        <Text style={styles.orderNumberLabel}>Order Number</Text>
                        <Text style={styles.orderNumber}>#{orderNumber}</Text>
                    </View>

                    <Text style={styles.redirectText}>
                        Redirecting to your orders...
                    </Text>
                </Animated.View>

                {/* Animated Confetti Effect */}
                <View style={styles.confettiContainer}>
                    {[...Array(20)].map((_, i) => (
                        <Animated.View
                            key={i}
                            style={[
                                styles.confetti,
                                {
                                    left: Math.random() * width,
                                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3'][i % 4],
                                    opacity: fadeAnim,
                                    transform: [
                                        {
                                            translateY: slideAnim.interpolate({
                                                inputRange: [0, 50],
                                                outputRange: [0, Math.random() * 200 + 100],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        />
                    ))}
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    checkmarkContainer: {
        marginBottom: 40,
    },
    checkmarkCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 5,
        borderColor: '#fff',
    },
    successTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    successSubtitle: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 40,
        opacity: 0.9,
    },
    orderNumberContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        minWidth: 250,
        alignItems: 'center',
    },
    orderNumberLabel: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    orderNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
    },
    redirectText: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.7,
        textAlign: 'center',
    },
    confettiContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height,
        pointerEvents: 'none',
    },
    confetti: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
