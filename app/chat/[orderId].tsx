import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { getMessages, sendMessage, subscribeToMessages } from '../../services/database';
import { useTheme } from '../../contexts/ThemeContext';

export default function ChatScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const orderId = params.orderId as string;

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const flatListRef = useRef<FlatList>(null);
    const { theme } = useTheme();

    useEffect(() => {
        getCurrentUser();
        loadOrderData();
        loadMessages();

        // Subscribe to new messages
        const subscription = subscribeToMessages(orderId, (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            scrollToBottom();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [orderId]);

    const loadOrderData = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('customer_id, business_id')
                .eq('id', orderId)
                .single();

            if (!error && data) {
                setOrderData(data);
                console.log('Order data:', data);
            }
        } catch (error) {
            console.error('Error loading order data:', error);
        }
    };

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            console.log('Current user ID:', user.id);
            setUserId(user.id);
        }
    };

    const loadMessages = async () => {
        try {
            const data = await getMessages(orderId);
            console.log('Loaded messages:', data.map(m => ({
                id: m.id,
                sender_id: m.sender_id,
                message: m.message.substring(0, 20)
            })));
            setMessages(data);
            setLoading(false);
            scrollToBottom();
        } catch (error) {
            console.error('Error loading messages:', error);
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        const messageToSend = newMessage;
        setNewMessage(''); // Clear input immediately

        try {
            await sendMessage(orderId, messageToSend);
            // Reload messages to ensure it appears even if subscription is slow
            await loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally show error to user and restore message
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }: { item: any }) => {
        if (!orderData || !userId) {
            console.log('Missing data - orderData:', orderData, 'userId:', userId);
            // Default to right side if we don't have order data yet
            return null;
        }

        // Determine if current user is the customer
        const isCustomer = userId === orderData.customer_id;

        // Determine if this message was sent by the customer
        const messageFromCustomer = item.sender_id === orderData.customer_id;

        // For customer view: customer messages on right, business on left
        // For business view: business messages on right, customer on left
        const isMe = isCustomer ? messageFromCustomer : !messageFromCustomer;

        console.log('Message positioning:', {
            messageId: item.id,
            messageSenderId: item.sender_id,
            currentUserId: userId,
            customerId: orderData.customer_id,
            businessId: orderData.business_id,
            isCustomer,
            messageFromCustomer,
            isMe,
            side: isMe ? 'RIGHT' : 'LEFT'
        });

        return (
            <View style={[
                styles.messageRow,
                isMe ? styles.myMessageRow : styles.theirMessageRow
            ]}>
                <View style={[
                    styles.messageBubble,
                    isMe ? styles.myMessageBubble : styles.theirMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMe ? styles.myMessageText : styles.theirMessageText
                    ]}>
                        {item.message}
                    </Text>
                    <View style={styles.messageFooter}>
                        <Text style={[
                            styles.timestamp,
                            isMe ? styles.myTimestamp : styles.theirTimestamp
                        ]}>
                            {formatTime(item.created_at)}
                        </Text>
                        {isMe && (
                            <Ionicons
                                name="checkmark-done-outline"
                                size={16}
                                color={item.is_read ? "#34B7F1" : "rgba(255,255,255,0.7)"}
                                style={styles.readReceipt}
                            />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#075E54" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={20} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>Chat</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="videocam" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="call" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.backgroundImage, { backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f5f5f5' }]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardAvoidingView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messagesList}
                        onContentSizeChange={scrollToBottom}
                    />

                    <View style={styles.inputContainer}>
                        <TouchableOpacity style={styles.attachButton}>
                            <Ionicons name="add" size={24} color="#007AFF" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            placeholder="Message"
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                        />
                        {newMessage.trim() ? (
                            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                                <Ionicons name="send" size={16} color="#fff" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.micButton}>
                                <Ionicons name="mic" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5DDD5',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E5DDD5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#000000', // Changed to black
        paddingTop: Platform.OS === 'android' ? 40 : 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 5,
        padding: 5,
    },
    avatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    headerIcon: {
        padding: 5,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    messagesList: {
        padding: 16,
        paddingBottom: 20,
    },
    messageRow: {
        marginBottom: 8,
        flexDirection: 'row',
        width: '100%',
    },
    myMessageRow: {
        justifyContent: 'flex-end',
    },
    theirMessageRow: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1.00,
        elevation: 1,
    },
    myMessageBubble: {
        backgroundColor: '#DCF8C6', // WhatsApp light green
        borderTopRightRadius: 0,
    },
    theirMessageBubble: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 0,
    },
    messageText: {
        fontSize: 16,
        color: '#000',
        marginBottom: 2,
    },
    myMessageText: {
        color: '#000',
    },
    theirMessageText: {
        color: '#000',
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    timestamp: {
        fontSize: 11,
        color: 'rgba(0,0,0,0.45)',
    },
    myTimestamp: {
        color: 'rgba(0,0,0,0.45)',
    },
    theirTimestamp: {
        color: 'rgba(0,0,0,0.45)',
    },
    readReceipt: {
        marginLeft: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 8,
        backgroundColor: 'transparent',
    },
    attachButton: {
        padding: 10,
        marginBottom: 2,
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF', // Or WhatsApp teal #128C7E
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    micButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
});
