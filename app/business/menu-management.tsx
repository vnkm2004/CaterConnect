import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, FlatList, Share, Platform, Modal } from "react-native";
import { supabase } from "../../config/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { GROCERIES_LIST, SHAMIYANA_LIST, MENU_ITEMS_LIST, autoCategorize, ResourceItem } from "./resource-data";

// --- Types ---
type ViewMode = 'dashboard' | 'groceries' | 'shamiyana' | 'menu';

interface ResourceList {
    id: string;
    business_id: string;
    title: string;
    type: 'groceries' | 'shamiyana' | 'food_menu';
    event_date: string | null;
    updated_at: string;
    metadata?: any;
}

interface ResourceListItem {
    id?: string;
    list_id?: string;
    name: string;
    quantity: string;
    category?: string;
    unit?: string;
    is_checked?: boolean;
}

// --- Main Component ---
export default function ResourceManagementDashboard() {
    const [user, setUser] = useState<any>(null);
    const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
    const [editingList, setEditingList] = useState<ResourceList | null>(null);
    const [stats, setStats] = useState({ menu: 0, groceries: 0, shamiyana: 0 });

    // Get user on mount
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    // Function to go back to dashboard
    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
        setEditingList(null);
        fetchStats(); // Refresh stats when returning
    };

    // Function to fetch basic stats for the dashboard
    const fetchStats = async () => {
        if (!user?.id) return;
        // accurate counts matching the type
        const { data, error } = await supabase
            .from('business_resource_lists')
            .select('type, id') // Just select minimal fields
            .eq('business_id', user.id);

        if (data) {
            const newStats = { menu: 0, groceries: 0, shamiyana: 0 };
            data.forEach(item => {
                if (item.type === 'food_menu') newStats.menu++;
                else if (item.type === 'groceries') newStats.groceries++;
                else if (item.type === 'shamiyana') newStats.shamiyana++;
            });
            setStats(newStats);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user]);

    // Render content based on view mode
    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <DashboardView
                        user={user}
                        stats={stats}
                        onNavigate={(mode, list) => {
                            setEditingList(list || null);
                            setCurrentView(mode);
                        }}
                    />
                );
            case 'groceries':
                return (
                    <ResourceEditor
                        mode="groceries"
                        user={user}
                        initialList={editingList}
                        onBack={handleBackToDashboard}
                    />
                );
            case 'shamiyana':
                return (
                    <ResourceEditor
                        mode="shamiyana"
                        user={user}
                        initialList={editingList}
                        onBack={handleBackToDashboard}
                    />
                );
            case 'menu':
                return (
                    <MenuPlanner
                        user={user}
                        initialList={editingList}
                        onBack={handleBackToDashboard}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {renderContent()}
        </View>
    );
}

// --- Dashboard View Component ---
function DashboardView({ user, stats, onNavigate }: { user: any, stats: any, onNavigate: (mode: ViewMode, list?: ResourceList) => void }) {
    const [recentLists, setRecentLists] = useState<ResourceList[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLists();
    }, [user]);

    const fetchLists = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('business_resource_lists')
            .select('*')
            .eq('business_id', user.id)
            .order('updated_at', { ascending: false });

        if (!error && data) {
            setRecentLists(data as ResourceList[]);
        }
        setLoading(false);
    };

    const deleteList = async (id: string) => {
        Alert.alert("Delete List", "Are you sure you want to delete this list?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await supabase.from('business_resource_lists').delete().eq('id', id);
                    fetchLists();
                }
            }
        ]);
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'groceries': return 'cart-outline';
            case 'shamiyana': return 'home-outline'; // Tent/Structure
            case 'food_menu': return 'restaurant-outline';
            default: return 'document-outline';
        }
    };

    const getColorForType = (type: string) => {
        switch (type) {
            case 'groceries': return '#2e7d32'; // Green
            case 'shamiyana': return '#d81b60'; // Pink
            case 'food_menu': return '#f57c00'; // Orange
            default: return '#666';
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>J.S.M List Manager</Text>
                    <Text style={styles.headerSubtitle}>Manage Resources & Menus</Text>
                </View>
                <View style={styles.headerContact}>
                    <Text style={styles.headerContactText}>Pro Version</Text>
                </View>
            </View>

            <ScrollView style={{ flex: 1, padding: 15 }}>
                {/* Quick Actions / Stats Cards */}
                <Text style={styles.sectionTitle}>Create New</Text>
                <View style={styles.modulesGrid}>
                    <TouchableOpacity style={styles.moduleCard} onPress={() => onNavigate('groceries')}>
                        <View style={[styles.moduleIcon, { backgroundColor: '#e8f5e9' }]}>
                            <Ionicons name="cart" size={28} color="#2e7d32" />
                        </View>
                        <Text style={styles.moduleTitle}>Groceries</Text>
                        <Text style={styles.moduleCount}>{stats.groceries} Lists</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.moduleCard} onPress={() => onNavigate('shamiyana')}>
                        <View style={[styles.moduleIcon, { backgroundColor: '#fce4ec' }]}>
                            <Ionicons name="home" size={28} color="#d81b60" />
                        </View>
                        <Text style={styles.moduleTitle}>Shamiyana</Text>
                        <Text style={styles.moduleCount}>{stats.shamiyana} Lists</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.moduleCard} onPress={() => onNavigate('menu')}>
                        <View style={[styles.moduleIcon, { backgroundColor: '#fff3e0' }]}>
                            <Ionicons name="restaurant" size={28} color="#f57c00" />
                        </View>
                        <Text style={styles.moduleTitle}>Food Menu</Text>
                        <Text style={styles.moduleCount}>{stats.menu} Plans</Text>
                    </TouchableOpacity>
                </View>

                {/* Saved Lists */}
                <View style={{ marginTop: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.sectionTitle}>Recent Lists</Text>
                    <TouchableOpacity onPress={fetchLists}>
                        <Ionicons name="refresh" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
                ) : recentLists.length === 0 ? (
                    <Text style={styles.emptyText}>No lists saved yet. Start by creating one above!</Text>
                ) : (
                    <View style={{ paddingBottom: 20 }}>
                        {recentLists.map(list => (
                            <View key={list.id} style={styles.listCard}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <View style={[styles.listIcon, { backgroundColor: getColorForType(list.type) }]}>
                                        <Ionicons name={getIconForType(list.type) as any} size={20} color="white" />
                                    </View>
                                    <View style={{ marginLeft: 12, flex: 1 }}>
                                        <Text style={styles.listTitle} numberOfLines={1}>{list.title}</Text>
                                        <Text style={styles.listDate}>
                                            {new Date(list.updated_at).toLocaleDateString()} • {list.type.toUpperCase().replace('_', ' ')}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.listActions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => onNavigate(
                                            list.type === 'food_menu' ? 'menu' : list.type as ViewMode,
                                            list
                                        )}
                                    >
                                        <Ionicons name="pencil" size={18} color="#007bff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ffebee' }]} onPress={() => deleteList(list.id)}>
                                        <Ionicons name="trash" size={18} color="#d32f2f" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

// --- Generic Resource Editor (Groceries & Shamiyana) ---
function ResourceEditor({ mode, user, initialList, onBack }: { mode: 'groceries' | 'shamiyana', user: any, initialList: ResourceList | null, onBack: () => void }) {
    const [items, setItems] = useState<ResourceListItem[]>([]);
    const [listTitle, setListTitle] = useState(initialList?.title || `New ${mode === 'groceries' ? 'Broceries' : 'Shamiyana'} List`);
    const [loading, setLoading] = useState(false);

    // Form Inputs
    const [searchText, setSearchText] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState(mode === 'shamiyana' ? 'Nos' : 'Kg');
    const [category, setCategory] = useState('Groceries');
    const [suggestions, setSuggestions] = useState<ResourceItem[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const isGroceries = mode === 'groceries';
    const DATA_SOURCE = isGroceries ? GROCERIES_LIST : SHAMIYANA_LIST;

    useEffect(() => {
        if (initialList) {
            loadListItems(initialList.id);
        }
    }, [initialList]);

    const loadListItems = async (listId: string) => {
        setLoading(true);
        const { data } = await supabase
            .from('business_resource_items')
            .select('*')
            .eq('list_id', listId)
            .order('created_at', { ascending: true });

        if (data) {
            setItems(data.map(i => ({
                id: i.id,
                name: i.name,
                quantity: i.quantity,
                category: i.category,
                unit: i.quantity.split(' ')[1] || '',
                is_checked: i.is_checked
            })));
        }
        setLoading(false);
    };

    const handleSearch = (text: string) => {
        setSearchText(text);
        if (text.length > 0) {
            const matches = DATA_SOURCE.filter(i =>
                i.english.toLowerCase().includes(text.toLowerCase()) ||
                (i.local && i.local.includes(text))
            ).slice(0, 10);
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (item: ResourceItem) => {
        setSearchText(`${item.english} (${item.local})`);
        if (item.unit) setUnit(item.unit);
        if (item.category) setCategory(item.category);
        else if (isGroceries) setCategory(autoCategorize(item.english));

        setShowSuggestions(false);
    };

    const addItem = () => {
        if (!searchText.trim() || !quantity.trim()) {
            Alert.alert("Missing Info", "Please enter item name and quantity");
            return;
        }

        const newItem: ResourceListItem = {
            name: searchText,
            quantity: `${quantity} ${unit}`,
            category: isGroceries ? category : undefined,
            id: Date.now().toString(), // Temp ID
            unit
        };

        setItems([...items, newItem]);
        // Reset form
        setSearchText('');
        setQuantity('');
        setUnit(isGroceries ? 'Kg' : 'Nos');
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const saveList = async () => {
        if (items.length === 0) return Alert.alert("Empty List", "Add items before saving.");
        if (!user) return;

        setLoading(true);

        // 1. Upsert List
        const listData = {
            id: initialList?.id || undefined, // If undefined, new ID generated
            business_id: user.id,
            title: listTitle,
            type: mode,
            updated_at: new Date().toISOString()
        };

        const { data: listResult, error: listError } = await supabase
            .from('business_resource_lists')
            .upsert(listData)
            .select()
            .single();

        if (listError || !listResult) {
            setLoading(false);
            Alert.alert("Error", listError?.message);
            return;
        }

        const listId = listResult.id;

        // 2. Sync Items (Delete all and re-insert for simplicity)
        // Only if editing existing to avoid stale items. 
        if (initialList) {
            await supabase.from('business_resource_items').delete().eq('list_id', listId);
        }

        const itemsPayload = items.map(i => ({
            list_id: listId,
            name: i.name,
            quantity: i.quantity,
            category: i.category,
            is_checked: i.is_checked || false
        }));

        const { error: itemsError } = await supabase.from('business_resource_items').insert(itemsPayload);

        setLoading(false);
        if (itemsError) {
            Alert.alert("Error Saving Items", itemsError.message);
        } else {
            Alert.alert("Success", "List saved successfully!", [{ text: "OK", onPress: onBack }]);
        }
    };

    const exportList = async () => {
        if (items.length === 0) {
            Alert.alert("Empty List", "Add items before exporting.");
            return;
        }

        const htmlContent = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${listTitle}</title>
                <style>
                    body { font-family: Helvetica, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .cat-row { background-color: #e0e0e0; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>${listTitle}</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Sl. No</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderTableRows()}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        try {
            const fileName = `${listTitle.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.html`;

            // Use Share API to share the HTML content
            const result = await Share.share({
                message: htmlContent,
                title: fileName,
            });

            if (result.action === Share.sharedAction) {
                Alert.alert("Success", "HTML file shared successfully!");
            }
        } catch (error: any) {
            console.error('Export error:', error);
            Alert.alert("Export Error", error?.message || "Could not share HTML file");
        }
    };

    const renderTableRows = () => {
        if (!isGroceries) {
            return items.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                </tr>
            `).join('');
        }

        // Group by category for groceries
        const categories = ['Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Other'];
        let html = '';
        let slNo = 1;

        categories.forEach(cat => {
            const catItems = items.filter(i => (i.category || 'Groceries') === cat || (cat === 'Other' && !['Groceries', 'Vegetables', 'Fruits', 'Dairy'].includes(i.category || '')));
            if (catItems.length > 0) {
                html += `<tr class="cat-row"><td colspan="3">${cat}</td></tr>`;
                catItems.forEach(item => {
                    html += `
                        <tr>
                            <td>${slNo++}</td>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                        </tr>
                    `;
                });
            }
        });
        return html;
    };

    return (
        <View style={styles.screenContainer}>
            {/* Toolbar */}
            <View style={styles.toolbar}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                    <Text> Back</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.titleInput}
                    value={listTitle}
                    onChangeText={setListTitle}
                    placeholder="List Title"
                />
                <View style={styles.toolbarActions}>
                    <TouchableOpacity onPress={exportList} style={[styles.toolBtn, { backgroundColor: '#4caf50' }]}>
                        <Ionicons name="download-outline" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveList} style={[styles.toolBtn, { backgroundColor: '#007bff' }]}>
                        <Ionicons name="save-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Input Form */}
            <View style={styles.inputCard}>
                <View style={{ zIndex: 10 }}>
                    <Text style={styles.label}>Item Name</Text>
                    <TextInput
                        style={styles.input}
                        value={searchText}
                        onChangeText={handleSearch}
                        placeholder="Type to search..."
                    />
                    {showSuggestions && (
                        <View style={styles.suggestionsContainer}>
                            {suggestions.map((s, i) => (
                                <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectSuggestion(s)}>
                                    <Text style={styles.suggEng}>{s.english}</Text>
                                    <Text style={styles.suggLoc}>{s.local}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={[styles.row, { marginTop: 10 }]}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>Quantity</Text>
                        <TextInput
                            style={styles.input}
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Unit</Text>
                        {/* Simple Mock Select for Unit */}
                        <TextInput style={styles.input} value={unit} onChangeText={setUnit} />
                        {/* Ideally a Picker here, but TextInput works for brevity/flexibility */}
                    </View>
                </View>

                {isGroceries && (
                    <View style={{ marginTop: 10 }}>
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categoryChips}>
                            {['Groceries', 'Vegetables', 'Fruits', 'Dairy'].map(c => (
                                <TouchableOpacity
                                    key={c}
                                    style={[styles.chip, category === c && styles.activeChip]}
                                    onPress={() => setCategory(c)}
                                >
                                    <Text style={[styles.chipText, category === c && styles.activeChipText]}>{c}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.addButton} onPress={addItem}>
                    <Text style={styles.addButtonText}>+ Add Item</Text>
                </TouchableOpacity>
            </View>

            {/* List Table */}
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, { flex: 0.5 } as any]}>#</Text>
                        <Text style={[styles.th, { flex: 2 } as any]}>Item</Text>
                        <Text style={[styles.th, { flex: 1 } as any]}>Qty</Text>
                        <Text style={[styles.th, { flex: 0.5 } as any]}>Act</Text>
                    </View>
                    {items.map((item, index) => (
                        <View key={index} style={styles.tr}>
                            <Text style={[styles.td, { flex: 0.5 } as any]}>{index + 1}</Text>
                            <Text style={[styles.td, { flex: 2 } as any]}>{item.name}</Text>
                            <Text style={[styles.td, { flex: 1 } as any]}>{item.quantity}</Text>
                            <TouchableOpacity style={{ flex: 0.5, alignItems: 'center', justifyContent: 'center' }} onPress={() => removeItem(index)}>
                                <Ionicons name="close-circle" size={20} color="#d32f2f" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>

            {loading && <View style={styles.loaderOverlay}><ActivityIndicator size="large" color="white" /></View>}
        </View>
    );
}

// --- Menu Planner Component ---
function MenuPlanner({ user, initialList, onBack }: { user: any, initialList: ResourceList | null, onBack: () => void }) {
    const [days, setDays] = useState<{ sessions: Record<string, string> }[]>([
        { sessions: { 'Breakfast': '', 'Lunch': '', 'Snacks': '', 'Dinner': '' } }
    ]);
    const [activeDayIdx, setActiveDayIdx] = useState(0);
    const [menuTitle, setMenuTitle] = useState(initialList?.title || 'Wedding Menu');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialList && initialList.metadata && initialList.metadata.days) {
            setDays(initialList.metadata.days);
        }
    }, [initialList]);

    const handleSessionChange = (sessionName: string, text: string) => {
        const newDays = [...days];
        newDays[activeDayIdx].sessions[sessionName] = text;
        setDays(newDays);
    };

    const addDay = () => {
        setDays([...days, { sessions: { 'Breakfast': '', 'Lunch': '', 'Snacks': '', 'Dinner': '' } }]);
        setActiveDayIdx(days.length);
    };

    const saveMenu = async () => {
        if (!user) return;
        setLoading(true);

        const listData = {
            id: initialList?.id || undefined,
            business_id: user.id,
            title: menuTitle,
            type: 'food_menu',
            updated_at: new Date().toISOString(),
            metadata: { days: days } // Store full structure in metadata for menu planner
        };

        const { error } = await supabase.from('business_resource_lists').upsert(listData);
        setLoading(false);

        if (error) Alert.alert("Error", error.message);
        else Alert.alert("Success", "Menu Saved!", [{ text: "OK", onPress: onBack }]);
    };

    const exportMenu = async () => {
        let content = '';
        days.forEach((d, i) => {
            content += `<h3 style="background:#eee; padding:10px; border-bottom:2px solid #ccc;">DAY ${i + 1}</h3>`;
            ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].forEach(s => {
                const itemsText = d.sessions[s];
                if (!itemsText) return;

                content += `<h4 style="margin-left:10px; color:#f57c00">${s}</h4>`;
                content += `<ul style="margin-bottom: 15px;">`;
                itemsText.split('\n').forEach(line => {
                    if (line.trim()) content += `<li>${line}</li>`;
                });
                content += `</ul>`;
            });
        });

        const html = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${menuTitle}</title>
                <style>body{font-family:sans-serif; padding:20px}</style>
            </head>
            <body><h1>${menuTitle}</h1>${content}</body>
            </html>
         `;

        try {
            const fileName = `${menuTitle.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.html`;

            const result = await Share.share({
                message: html,
                title: fileName,
            });

            if (result.action === Share.sharedAction) {
                Alert.alert("Success", "Menu exported successfully!");
            }
        } catch (error: any) {
            console.error('Export error:', error);
            Alert.alert("Export Error", error?.message || "Could not export menu");
        }
    };

    return (
        <View style={styles.screenContainer}>
            <View style={styles.toolbar}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <TextInput style={styles.titleInput} value={menuTitle} onChangeText={setMenuTitle} />
                <View style={styles.toolbarActions}>
                    <TouchableOpacity onPress={exportMenu} style={[styles.toolBtn, { backgroundColor: '#4caf50' }]}>
                        <Ionicons name="download-outline" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveMenu} style={[styles.toolBtn, { backgroundColor: '#007bff' }]}>
                        <Ionicons name="save-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Day Tabs */}
            <View style={styles.dayTabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {days.map((_, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.dayTab, activeDayIdx === i && styles.activeDayTab]}
                            onPress={() => setActiveDayIdx(i)}
                        >
                            <Text style={[styles.dayTabText, activeDayIdx === i && styles.activeDayTabText]}>Day {i + 1}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.addDayBtn} onPress={addDay}>
                        <Ionicons name="add" size={20} color="#007bff" />
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Sessions Notebook */}
            <ScrollView style={{ flex: 1, padding: 15 }}>
                {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(session => (
                    <View key={session} style={styles.sessionCard}>
                        <View style={styles.sessionHeader}>
                            <Text style={styles.sessionTitle}>{session}</Text>
                        </View>
                        <TextInput
                            style={styles.notebookInput}
                            multiline
                            placeholder="Type menu items (one per line)..."
                            value={days[activeDayIdx].sessions[session] || ''}
                            onChangeText={(text) => handleSessionChange(session, text)}
                        />
                    </View>
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>

            {loading && <View style={styles.loaderOverlay}><ActivityIndicator size="large" color="white" /></View>}
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: {
        backgroundColor: 'white',
        padding: 20,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a237e' },
    headerSubtitle: { fontSize: 14, color: '#666' },
    headerContact: { backgroundColor: '#e8eaf6', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    headerContactText: { color: '#1a237e', fontWeight: 'bold', fontSize: 12 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    modulesGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    moduleCard: {
        backgroundColor: 'white',
        width: '31%',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2
    },
    moduleIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    moduleTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'center' },
    moduleCount: { fontSize: 12, color: '#666', marginTop: 4 },

    emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },

    listCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee'
    },
    listIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    listTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    listDate: { fontSize: 12, color: '#888', marginTop: 2 },
    listActions: { flexDirection: 'row', gap: 10 },
    actionButton: { padding: 8, backgroundColor: '#e3f2fd', borderRadius: 8 },

    // Screen Container for Editors
    screenContainer: { flex: 1, backgroundColor: '#f0f2f5' },
    toolbar: {
        backgroundColor: 'white',
        paddingTop: 50,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#ddd',
        justifyContent: 'space-between'
    },
    backButton: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
    titleInput: { flex: 1, fontSize: 18, fontWeight: 'bold', paddingHorizontal: 10 },
    toolbarActions: { flexDirection: 'row', gap: 8 },
    toolBtn: { padding: 8, borderRadius: 6, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },

    inputCard: {
        backgroundColor: 'white', margin: 15, padding: 15, borderRadius: 8,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2
    },
    label: { fontSize: 12, color: '#666', marginBottom: 5, fontWeight: '600' },
    input: {
        backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 6,
        padding: 10, fontSize: 16
    },
    row: { flexDirection: 'row' },
    suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
    suggestionsContainer: {
        position: 'absolute', top: 70, left: 0, right: 0,
        backgroundColor: 'white', borderWidth: 1, borderColor: '#eee', borderRadius: 6,
        maxHeight: 200, zIndex: 1000, shadowColor: '#000', shadowOpacity: 0.1, elevation: 5
    },
    suggEng: { fontWeight: 'bold', color: '#333' },
    suggLoc: { fontSize: 12, color: '#666' },

    addButton: {
        backgroundColor: '#333', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 15
    },
    addButtonText: { color: 'white', fontWeight: 'bold' },

    categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    chip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 15, backgroundColor: '#f0f0f0' },
    activeChip: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#2e7d32' },
    chipText: { fontSize: 12, color: '#666' },
    activeChipText: { color: '#2e7d32', fontWeight: 'bold' },

    table: { backgroundColor: 'white', marginHorizontal: 15, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f5f5f5', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
    th: { fontWeight: 'bold', fontSize: 13, color: '#555' },
    tr: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
    td: { fontSize: 14, color: '#333' },

    loaderOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
    },

    // Menu Planner Styles
    dayTabsContainer: { backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 5 },
    dayTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginHorizontal: 4, backgroundColor: '#f5f5f5' },
    activeDayTab: { backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: '#2196f3' },
    dayTabText: { color: '#666', fontWeight: '600' },
    activeDayTabText: { color: '#2196f3' },
    addDayBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

    sessionCard: {
        backgroundColor: 'white', borderRadius: 8, marginBottom: 15, overflow: 'hidden',
        borderWidth: 1, borderColor: '#e0e0e0'
    },
    sessionHeader: { backgroundColor: '#fafafa', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    sessionTitle: { fontWeight: 'bold', color: '#f57c00', fontSize: 16 },
    notebookInput: {
        padding: 15, fontSize: 16, minHeight: 120, textAlignVertical: 'top',
        lineHeight: 24
    }
});
