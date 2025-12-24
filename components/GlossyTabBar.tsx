import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';

export default function GlossyTabBar(props: BottomTabBarProps) {
    return (
        <View style={styles.container}>
            {Platform.OS === 'ios' ? (
                <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
            ) : (
                <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
            )}
            <BottomTabBar {...props} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    androidBackground: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
    },
});
