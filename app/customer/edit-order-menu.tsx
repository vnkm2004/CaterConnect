import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Modal, FlatList, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AVAILABLE_DISHES } from "./data/dishes";
import { supabase } from "../../config/supabase";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks", "Tiffin"];
const SERVICE_TYPES = ["Buffet", "Table Serve", "Leaf Serve", "Other"];

interface MenuItem {
    id: string;
    name: string;
    category?: string;
    isVeg?: boolean;
    quantity?: number;
}

interface Session {
    id: string;
    mealType: string;
    time: string;
    guestCount: string;
    serviceType: string;
    availableService: string;
    menuNotes: string;
}

interface Day {
    id: string;
    date: string;
    dateError: string;
    isValidDate: boolean;
    sessions: Session[];
}

export default function EditOrderMenuScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const orderId = params.orderId as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [days, setDays] = useState<Day[]>([]);

    // Dish Selection Modal State
    const [isDishModalVisible, setIsDishModalVisible] = useState(false);
    const [currentDayId, setCurrentDayId] = useState<string | null>(null);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("Starters");
    const [customDishName, setCustomDishName] = useState("");

    useEffect(() => {
        if (orderId) {
            loadOrderDetails();
        }
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (error) throw error;

            if (data && data.sessions) {
                transformSessionsToState(data.sessions);
            } else {
                // Initialize with one empty day if no sessions
                addDay();
            }
        } catch (error: any) {
            console.error('Error loading order:', error);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const transformSessionsToState = (sessionsData: any[]) => {
        // Group sessions by date to form "Days"
        const sessionsByDate: { [date: string]: any[] } = {};

        sessionsData.forEach(session => {
            if (!sessionsByDate[session.date]) {
                sessionsByDate[session.date] = [];
            }
            sessionsByDate[session.date].push(session);
        });

        const newDays: Day[] = Object.keys(sessionsByDate).map((date, index) => {
            const daySessions = sessionsByDate[date].map((s, sIdx) => {
                // Convert menu items object to notes string for display
                const menuItems = s.menuItems || {};
                const menuNotes = Object.values(menuItems)
                    .map((item: any) => item.name)
                    .join('\n');

                return {
                    id: `session_${index}_${sIdx}`,
                    mealType: s.sessionName || "",
                    time: "", // Not stored in DB currently
                    guestCount: s.numberOfPeople?.toString() || "",
                    serviceType: s.servingType || "",
                    availableService: "",
                    menuNotes: menuNotes
                };
            });

            return {
                id: `day_${index}`,
                date: date,
                dateError: "",
                isValidDate: true,
                sessions: daySessions
            };
        });

        setDays(newDays);
    };

    const validateDate = (dateStr: string): { isValid: boolean; error: string } => {
        if (dateStr.length !== 10) return { isValid: false, error: "" };
        // Simplified validation for edit mode
        return { isValid: true, error: "" };
    };

    const handleDateChange = (dayId: string, text: string) => {
        let formattedText = text.replace(/[^0-9]/g, '');
        if (formattedText.length > 2) formattedText = formattedText.substring(0, 2) + '/' + formattedText.substring(2);
        if (formattedText.length > 5) formattedText = formattedText.substring(0, 5) + '/' + formattedText.substring(5);
        if (formattedText.length > 10) formattedText = formattedText.substring(0, 10);

        const validation = formattedText.length === 10 ? validateDate(formattedText) : { isValid: false, error: "" };

        setDays(days.map(d => d.id === dayId ? {
            ...d,
            date: formattedText,
            dateError: validation.error,
            isValidDate: validation.isValid
        } : d));
    };

    const addDay = () => {
        const newDay: Day = {
            id: Date.now().toString(),
            date: "",
            dateError: "",
            isValidDate: false,
            sessions: [{ id: Date.now().toString() + "_s", mealType: "", time: "", guestCount: "", serviceType: "", availableService: "", menuNotes: "" }]
        };
        setDays([...days, newDay]);
    };

    const removeDay = (dayId: string) => {
        if (days.length > 1) {
            setDays(days.filter(d => d.id !== dayId));
        } else {
            Alert.alert("Cannot Remove", "You must have at least one day.");
        }
    };

    const addSession = (dayId: string) => {
        setDays(days.map(d => d.id === dayId ? {
            ...d,
            sessions: [...d.sessions, {
                id: Date.now().toString(),
                mealType: "",
                time: "",
                guestCount: "",
                serviceType: "",
                availableService: "",
                menuNotes: ""
            }]
        } : d));
    };

    const removeSession = (dayId: string, sessionId: string) => {
        const day = days.find(d => d.id === dayId);
        if (!day || day.sessions.length <= 1) return;

        setDays(days.map(d => d.id === dayId ? {
            ...d,
            sessions: d.sessions.filter(s => s.id !== sessionId)
        } : d));
    };

    const updateSession = (dayId: string, sessionId: string, field: keyof Session, value: any) => {
        setDays(days.map(d => d.id === dayId ? {
            ...d,
            sessions: d.sessions.map(s => s.id === sessionId ? { ...s, [field]: value } : s)
        } : d));
    };

    const openDishModal = (dayId: string, sessionId: string) => {
        setCurrentDayId(dayId);
        setCurrentSessionId(sessionId);
        setIsDishModalVisible(true);
    };

    const addDishToSession = (dishName: string) => {
        if (currentDayId && currentSessionId && dishName.trim()) {
            const day = days.find(d => d.id === currentDayId);
            if (day) {
                const session = day.sessions.find(s => s.id === currentSessionId);
                if (session) {
                    const currentNotes = session.menuNotes || "";
                    const separator = currentNotes ? "\n" : "";
                    updateSession(currentDayId, currentSessionId, "menuNotes", currentNotes + separator + dishName);
                }
            }
        }
    };

    const handleAddCustomDish = () => {
        addDishToSession(customDishName);
        setCustomDishName("");
    };

    const handleSelectDish = (dishName: string) => {
        addDishToSession(dishName);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const sessionsToSave: any[] = [];
            let totalPeople = 0;

            days.forEach(day => {
                day.sessions.forEach((session, sessionIndex) => {
                    // Parse menu notes to get items
                    const menuItems: { [itemId: string]: any } = {};

                    if (session.menuNotes) {
                        const dishNames = session.menuNotes.split('\n').filter(n => n.trim());
                        dishNames.forEach((name, index) => {
                            const cleanName = name.trim();
                            let foundDish = null;
                            let category = "Custom";
                            let isVeg = true;

                            for (const [cat, dishes] of Object.entries(AVAILABLE_DISHES)) {
                                const match = (dishes as any[]).find(d => d.name.toLowerCase() === cleanName.toLowerCase());
                                if (match) {
                                    foundDish = match;
                                    category = cat;
                                    isVeg = match.type === "Veg";
                                    break;
                                }
                            }

                            const itemId = foundDish ? foundDish.id : `custom_${Date.now()}_${index}`;

                            menuItems[itemId] = {
                                id: itemId,
                                name: cleanName,
                                category: category,
                                isVeg: isVeg,
                                quantity: 1,
                                price: 0
                            };
                        });
                    }

                    const peopleCount = parseInt(session.guestCount) || 0;
                    totalPeople += peopleCount;

                    sessionsToSave.push({
                        sessionName: session.mealType || `Session ${sessionIndex + 1}`,
                        date: day.date,
                        numberOfPeople: peopleCount,
                        servingType: session.serviceType || "Buffet",
                        menuItems: menuItems
                    });
                });
            });

            // Update database
            const { error } = await supabase
                .from('orders')
                .update({
                    sessions: sessionsToSave,
                    number_of_people: totalPeople
                })
                .eq('id', orderId);

            if (error) throw error;

            Alert.alert("Success", "Menu updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (error: any) {
            console.error("Error saving menu:", error);
            Alert.alert("Error", "Failed to save menu changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Menu</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                        <Text style={styles.saveButton}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Days */}
                {days.map((day, dayIndex) => (
                    <View key={day.id} style={styles.dayCard}>
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayTitle}>Day {dayIndex + 1}</Text>
                            {days.length > 1 && (
                                <TouchableOpacity onPress={() => removeDay(day.id)}>
                                    <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Date Input */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Event Date (DD/MM/YYYY)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="DD/MM/YYYY"
                                value={day.date}
                                onChangeText={(text) => handleDateChange(day.id, text)}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>

                        {/* Sessions */}
                        <View>
                            {day.sessions.map((session, sessionIndex) => (
                                <View key={session.id} style={styles.sessionCard}>
                                    <View style={styles.sessionHeader}>
                                        <Text style={styles.sessionTitle}>Session {sessionIndex + 1}</Text>
                                        {day.sessions.length > 1 && (
                                            <TouchableOpacity onPress={() => removeSession(day.id, session.id)}>
                                                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Meal Type */}
                                    <View style={styles.section}>
                                        <Text style={styles.label}>Meal Type</Text>
                                        <View style={styles.chipContainer}>
                                            {MEAL_TYPES.map((type) => (
                                                <TouchableOpacity
                                                    key={type}
                                                    style={[styles.chip, session.mealType === type && styles.chipSelected]}
                                                    onPress={() => updateSession(day.id, session.id, "mealType", type)}
                                                >
                                                    <Text style={[styles.chipText, session.mealType === type && styles.chipTextSelected]}>{type}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Guest Count */}
                                    <View style={styles.section}>
                                        <Text style={styles.label}>Number of Guests</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ex: 150"
                                            value={session.guestCount}
                                            onChangeText={(text) => updateSession(day.id, session.id, "guestCount", text)}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    {/* Service Type */}
                                    <View style={styles.section}>
                                        <Text style={styles.label}>Service Type</Text>
                                        <View style={styles.chipContainer}>
                                            {SERVICE_TYPES.map((type) => (
                                                <TouchableOpacity
                                                    key={type}
                                                    style={[styles.chip, session.serviceType === type && styles.chipSelected]}
                                                    onPress={() => updateSession(day.id, session.id, "serviceType", type)}
                                                >
                                                    <Text style={[styles.chipText, session.serviceType === type && styles.chipTextSelected]}>{type}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Menu Items */}
                                    <View style={styles.section}>
                                        <View style={styles.rowBetween}>
                                            <Text style={styles.label}>Menu Items</Text>
                                            <TouchableOpacity onPress={() => openDishModal(day.id, session.id)}>
                                                <Text style={styles.linkText}>+ Add Items</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="List your menu items here..."
                                            value={session.menuNotes}
                                            onChangeText={(text) => updateSession(day.id, session.id, "menuNotes", text)}
                                            multiline
                                            numberOfLines={4}
                                        />
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity style={styles.addSessionButton} onPress={() => addSession(day.id)}>
                                <Text style={styles.addSessionText}>+ Add Another Session</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.addDayButton} onPress={addDay}>
                    <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                    <Text style={styles.addDayText}>Add Another Day</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Dish Selection Modal */}
            <Modal
                visible={isDishModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsDishModalVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Dishes</Text>
                        <TouchableOpacity onPress={() => setIsDishModalVisible(false)}>
                            <Text style={styles.doneButton}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.categoryScroll}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {Object.keys(AVAILABLE_DISHES).map(category => (
                                <TouchableOpacity
                                    key={category}
                                    style={[styles.categoryTab, selectedCategory === category && styles.activeCategoryTab]}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text style={[styles.categoryText, selectedCategory === category && styles.activeCategoryText]}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.customDishContainer}>
                        <TextInput
                            style={styles.customDishInput}
                            placeholder="Type custom dish name..."
                            value={customDishName}
                            onChangeText={setCustomDishName}
                        />
                        <TouchableOpacity style={styles.addCustomButton} onPress={handleAddCustomDish}>
                            <Text style={styles.addCustomButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={((AVAILABLE_DISHES as any)[selectedCategory] || [])}
                        keyExtractor={(item: any) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dishItem}
                                onPress={() => handleSelectDish(item.name)}
                            >
                                <View style={styles.dishInfo}>
                                    <View style={[styles.vegIndicator, { borderColor: item.type === "Veg" ? "green" : "red" }]}>
                                        <View style={[styles.vegDot, { backgroundColor: item.type === "Veg" ? "green" : "red" }]} />
                                    </View>
                                    <Text style={styles.dishName}>{item.name}</Text>
                                </View>
                                <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.dishList}
                    />
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    saveButton: {
        fontSize: 16,
        fontWeight: "600",
        color: "#007AFF",
    },
    content: {
        padding: 20,
        paddingBottom: 50,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
    },
    inputError: {
        borderColor: "#FF3B30",
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 12,
        marginTop: 4,
    },
    sessionCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sessionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 10,
    },
    sessionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#007AFF",
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    chipSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    chipText: {
        fontSize: 14,
        color: '#666',
    },
    chipTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    linkText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    addSessionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        marginBottom: 20,
    },
    addSessionText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    dayCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
        borderWidth: 2,
        borderColor: "#e0e0e0",
    },
    dayHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: "#007AFF",
    },
    dayTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#007AFF",
    },
    addDayButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        marginBottom: 30,
        backgroundColor: "#E3F2FD",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#007AFF",
        borderStyle: "dashed",
    },
    addDayText: {
        color: "#007AFF",
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 10,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    doneButton: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
    },
    categoryScroll: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
    },
    activeCategoryTab: {
        backgroundColor: "#007AFF",
    },
    categoryText: {
        color: "#666",
        fontWeight: "500",
    },
    activeCategoryText: {
        color: "#fff",
    },
    customDishContainer: {
        flexDirection: "row",
        padding: 15,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    customDishInput: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    addCustomButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 20,
        justifyContent: "center",
        borderRadius: 8,
    },
    addCustomButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
    dishList: {
        padding: 15,
    },
    dishItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    dishInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    vegIndicator: {
        width: 16,
        height: 16,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    vegDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dishName: {
        fontSize: 16,
        color: "#333",
    },
});
