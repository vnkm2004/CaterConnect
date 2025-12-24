import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, Modal, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AVAILABLE_DISHES } from "../data/dishes";
import { useOrder } from "@/contexts/OrderContext";
import { getBusinessMenuCategories, getBusinessMenuItems } from "@/services/database";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks", "Tiffin"];
const SERVICE_TYPES = ["Buffet", "Table Serve", "Leaf Serve", "Other"];
const AVAILABLE_SERVICES = ["Catering", "Hire for Cook", "Hire and Supply"];

interface MenuItem {
    id: string;
    name: string;
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

export default function ManualMenuScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { setBusinessId, clearSessions, addOrderSession, setFoodPreference, cuisine, setCuisine } = useOrder();

    const [days, setDays] = useState<Day[]>([
        {
            id: "1",
            date: "",
            dateError: "",
            isValidDate: false,
            sessions: [{ id: "1", mealType: "", time: "", guestCount: "", serviceType: "", availableService: "", menuNotes: "" }]
        }
    ]);

    // Dish Selection Modal State
    const [isDishModalVisible, setIsDishModalVisible] = useState(false);
    const [currentDayId, setCurrentDayId] = useState<string | null>(null);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("Starters");
    const [customDishName, setCustomDishName] = useState("");

    // Database menu state
    const [businessMenuCategories, setBusinessMenuCategories] = useState<any[]>([]);
    const [businessMenuItems, setBusinessMenuItems] = useState<any[]>([]);
    const [useBusinessMenu, setUseBusinessMenu] = useState(false);
    const [menuLoading, setMenuLoading] = useState(false);

    // Save businessId to context when loaded
    React.useEffect(() => {
        if (params.businessId) {
            setBusinessId(params.businessId as string);
        }
        if (params.preference) {
            setFoodPreference(params.preference as any);
        }
    }, [params.businessId, params.preference]);

    // Load business menu when component mounts
    React.useEffect(() => {
        loadBusinessMenu();
    }, []);

    const loadBusinessMenu = async () => {
        const businessId = params.businessId as string;
        if (!businessId) return;

        try {
            setMenuLoading(true);
            const [categories, items] = await Promise.all([
                getBusinessMenuCategories(businessId),
                getBusinessMenuItems(businessId)
            ]);

            if (categories.length > 0) {
                setBusinessMenuCategories(categories);
                setBusinessMenuItems(items);
                setUseBusinessMenu(true);
                setSelectedCategory(categories[0]?.name || "Starters");
            }
        } catch (error) {
            console.error("Error loading business menu:", error);
            // Fallback to default dishes
            setUseBusinessMenu(false);
        } finally {
            setMenuLoading(false);
        }
    };



    const validateDate = (dateStr: string): { isValid: boolean; error: string } => {
        if (dateStr.length !== 10) {
            return { isValid: false, error: "" };
        }

        const [day, month, year] = dateStr.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        const now = new Date();

        // Reset time part for accurate day comparison
        date.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 5 months in days (approx)
        const fiveMonthsDays = 5 * 30;

        if (diffDays < 1) {
            return { isValid: false, error: "Sorry, enter correct data" };
        } else if (diffDays > fiveMonthsDays) {
            return { isValid: false, error: "We can't accept your order due to our policy of event time to manage" };
        }

        return { isValid: true, error: "" };
    };

    const handleDateChange = (dayId: string, text: string) => {
        // Auto-format DD/MM/YYYY
        let formattedText = text.replace(/[^0-9]/g, '');
        if (formattedText.length > 2) {
            formattedText = formattedText.substring(0, 2) + '/' + formattedText.substring(2);
        }
        if (formattedText.length > 5) {
            formattedText = formattedText.substring(0, 5) + '/' + formattedText.substring(5);
        }
        if (formattedText.length > 10) {
            formattedText = formattedText.substring(0, 10);
        }

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
            sessions: [{ id: "1", mealType: "", time: "", guestCount: "", serviceType: "", availableService: "", menuNotes: "" }]
        };
        setDays([...days, newDay]);
    };

    const removeDay = (dayId: string) => {
        if (days.length > 1) {
            setDays(days.filter(d => d.id !== dayId));
        }
    };

    const addSession = (dayId: string) => {
        const day = days.find(d => d.id === dayId);
        if (!day) return;

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
        const day = days.find(d => d.id === dayId);
        if (!day) return;

        setDays(days.map(d => d.id === dayId ? {
            ...d,
            sessions: d.sessions.map(s => s.id === sessionId ? { ...s, [field]: value } : s)
        } : d));
    };

    const openDishModal = (dayId: string, sessionId: string) => {
        const day = days.find(d => d.id === dayId);
        if (!day) return;
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

                    // Check for duplicate dish names (case-insensitive) - advisory only
                    const existingDishes = currentNotes.split('\n').map(dish => dish.trim().toLowerCase());
                    const newDishLower = dishName.trim().toLowerCase();

                    if (existingDishes.includes(newDishLower)) {
                        Alert.alert(
                            "Similar Item Found",
                            `You've already added "${dishName}" to your menu. Just letting you know!`,
                            [{ text: "OK" }]
                        );
                    }

                    // Still add the dish even if it's a duplicate
                    const separator = currentNotes ? "\n" : "";
                    updateSession(currentDayId, currentSessionId, "menuNotes", currentNotes + separator + dishName);
                }
            }
        }
    };

    const handleAddCustomDish = () => {
        addDishToSession(customDishName);
        setCustomDishName("");
        // Don't close modal to allow adding more
    };

    const handleSelectDish = (dishName: string) => {
        addDishToSession(dishName);
        // Optional: Show toast or feedback
    };





    const handleProceed = () => {
        // Clear existing sessions
        clearSessions();

        days.forEach(day => {
            day.sessions.forEach((session, sessionIndex) => {
                // Parse menu notes to get items
                const menuItems: { [itemId: string]: any } = {};

                if (session.menuNotes) {
                    // Split by newline and filter empty lines
                    const dishNames = session.menuNotes.split('\n').filter(n => n.trim());

                    dishNames.forEach((name, index) => {
                        const cleanName = name.trim();
                        if (!cleanName) return;

                        // Try to find in AVAILABLE_DISHES
                        let foundDish = null;
                        let category = "Custom";
                        let isVeg = true; // Default

                        for (const [cat, dishes] of Object.entries(AVAILABLE_DISHES)) {
                            const match = (dishes as any[]).find(d => d.name.toLowerCase() === cleanName.toLowerCase());
                            if (match) {
                                foundDish = match;
                                category = cat;
                                isVeg = match.type === "Veg";
                                break;
                            }
                        }

                        // Use a unique ID for each item
                        const itemId = foundDish ? foundDish.id : `custom_${Date.now()}_${index}`;

                        menuItems[itemId] = {
                            itemId: itemId, // Use itemId to match database type
                            name: cleanName,
                            category: category,
                            isVeg: isVeg,
                            quantity: 1,
                            price: 0
                        };
                    });
                }

                // Fallback: If no items were parsed but notes exist, add the whole note as a custom item
                // This handles cases where user typed a list without newlines or parsing failed
                if (Object.keys(menuItems).length === 0 && session.menuNotes && session.menuNotes.trim()) {
                    const itemId = `custom_notes_${Date.now()}`;
                    menuItems[itemId] = {
                        itemId: itemId,
                        name: session.menuNotes.trim(),
                        category: "Custom",
                        isVeg: true,
                        quantity: 1
                    };
                }
                addOrderSession({
                    sessionName: session.mealType || `Session ${sessionIndex + 1}`,
                    date: day.date,
                    time: session.time || "",
                    numberOfPeople: parseInt(session.guestCount) || 0,
                    servingType: session.serviceType || "Buffet",
                    menuItems: menuItems
                });
            });
        });

        router.push('/customer/create-order/venue-input');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/customer")} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.title}>Create Your Menu</Text>
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

                        {/* Date Input for this day */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Event Date (DD/MM/YYYY)</Text>
                            <TextInput
                                style={[styles.input, day.dateError ? styles.inputError : null]}
                                placeholder="DD/MM/YYYY"
                                value={day.date}
                                onChangeText={(text) => handleDateChange(day.id, text)}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                            {day.dateError ? <Text style={styles.errorText}>{day.dateError}</Text> : null}
                        </View>

                        {/* Cuisine */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Cuisine / Food Style</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: North Indian, South Indian, Chinese..."
                                value={cuisine}
                                onChangeText={setCuisine}
                            />
                        </View>

                        {/* Meal Sessions */}
                        <View style={{ opacity: day.isValidDate ? 1 : 0.5, pointerEvents: day.isValidDate ? 'auto' : 'none' }}>
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

                                    {/* Time / Slot */}
                                    <View style={styles.section}>
                                        <Text style={styles.label}>Time / Slot</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ex: 12:30 PM - 2:00 PM"
                                            value={session.time}
                                            onChangeText={(text) => updateSession(day.id, session.id, "time", text)}
                                        />
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
                                            placeholder="List your menu items here... (e.g. Paneer Tikka, Butter Naan)"
                                            value={session.menuNotes}
                                            onChangeText={(text) => updateSession(day.id, session.id, "menuNotes", text)}
                                            multiline
                                            numberOfLines={4}
                                        />
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={styles.addSessionButton}
                                onPress={() => addSession(day.id)}
                            >
                                <Text style={styles.addSessionText}>+ Add Another Session</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {/* Add Another Day Button */}
                <TouchableOpacity style={styles.addDayButton} onPress={addDay}>
                    <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                    <Text style={styles.addDayText}>Add Another Day</Text>
                </TouchableOpacity>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleProceed}
                >
                    <Text style={styles.submitButtonText}>Proceed</Text>
                </TouchableOpacity>
            </View>

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
                            {(useBusinessMenu ? businessMenuCategories.map(cat => cat.name) : Object.keys(AVAILABLE_DISHES)).map(category => (
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
                        data={(() => {
                            if (useBusinessMenu) {
                                // Filter business menu items by category
                                const categoryObj = businessMenuCategories.find(cat => cat.name === selectedCategory);
                                if (!categoryObj) return [];

                                return businessMenuItems
                                    .filter(item => item.category_id === categoryObj.id && item.available)
                                    .filter(item => {
                                        const preference = (params.preference as string)?.toLowerCase();
                                        if (preference === 'veg') {
                                            return item.is_veg;
                                        }
                                        return true;
                                    })
                                    .map(item => ({
                                        id: item.id,
                                        name: item.name,
                                        type: item.is_veg ? 'Veg' : 'Non-Veg'
                                    }));
                            } else {
                                // Use default dishes
                                return ((AVAILABLE_DISHES as any)[selectedCategory] || []).filter((item: any) => {
                                    const preference = (params.preference as string)?.toLowerCase();
                                    if (preference === 'veg') {
                                        return item.type === 'Veg';
                                    }
                                    return true;
                                });
                            }
                        })()}
                        keyExtractor={(item) => item.id}
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    content: {
        padding: 20,
        paddingBottom: 150,
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
    subLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
        marginTop: 10,
    },
    worksheet: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 0,
    },
    menuInput: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        minHeight: 200,
        marginBottom: 10,
    },
    menuItemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    menuItemText: {
        fontSize: 15,
        color: "#333",
        flex: 1,
    },
    addDishButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#007AFF",
        borderRadius: 8,
        borderStyle: "dashed",
    },
    addDishText: {
        color: "#007AFF",
        marginLeft: 6,
        fontWeight: "500",
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
    timePickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginBottom: 15,
        paddingVertical: 10,
    },
    pickerColumn: {
        alignItems: "center",
    },
    pickerBox: {
        width: 65,
        height: 90,
        backgroundColor: "#3A3D4A",
        borderRadius: 10,
        overflow: "hidden",
        justifyContent: "center",
        marginBottom: 5,
    },
    pickerScrollContent: {
        paddingVertical: 25,
    },
    pickerItem: {
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    pickerItemText: {
        fontSize: 20,
        color: "#7A7D8A",
        fontWeight: "500",
    },
    activePickerItemText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 24,
    },
    pickerLabel: {
        fontSize: 10,
        color: "#888",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    pickerSeparator: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#3A3D4A",
        marginHorizontal: 6,
        marginBottom: 25,
    },
    footer: {
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    submitButton: {
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 16,
        alignItems: "center",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
        color: "#333",
    },
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
});
