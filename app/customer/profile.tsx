import React, { useState } from 'react';
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface CollapsibleSectionProps {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    icon,
    children,
    defaultExpanded = false,
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const { colors } = useTheme();

    return (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <View style={styles.sectionHeaderLeft}>
                    <Ionicons name={icon} size={24} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={colors.icon}
                />
            </TouchableOpacity>
            {expanded && <View style={styles.sectionContent}>{children}</View>}
        </View>
    );
};

interface SettingItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    showChevron?: boolean;
    toggle?: boolean;
    toggleValue?: boolean;
    onToggle?: (value: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    label,
    value,
    onPress,
    showChevron = true,
    toggle = false,
    toggleValue = false,
    onToggle,
}) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress && !toggle}
            activeOpacity={0.7}
        >
            <View style={styles.settingItemLeft}>
                <Ionicons name={icon} size={20} color={colors.icon} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
            </View>
            <View style={styles.settingItemRight}>
                {value && <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>}
                {toggle && onToggle && (
                    <Switch
                        value={toggleValue}
                        onValueChange={onToggle}
                        trackColor={{ false: colors.border, true: colors.primaryLight }}
                        thumbColor={toggleValue ? colors.primary : colors.surface}
                    />
                )}
                {!toggle && showChevron && (
                    <Ionicons name="chevron-forward" size={20} color={colors.iconInactive} />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function ProfileScreen() {
    const { colors, theme, toggleTheme } = useTheme();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);

    const pickImage = async () => {
        // TODO: Install expo-image-picker to enable this feature
        // Run: npx expo install expo-image-picker
        Alert.alert(
            'Image Picker Not Available',
            'Please install expo-image-picker:\n\nnpx expo install expo-image-picker',
            [{ text: 'OK' }]
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Basic User Info Section */}
            <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                    <View style={[styles.profileImageContainer, { borderColor: colors.primary }]}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primaryLight }]}>
                                <Ionicons name="person" size={50} color={colors.primary} />
                            </View>
                        )}
                        <View style={[styles.editImageBadge, { backgroundColor: colors.primary }]}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </View>
                </TouchableOpacity>

                <Text style={[styles.userName, { color: colors.text }]}>John Doe</Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                    john.doe@example.com
                </Text>
                <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
                    +91 98765 43210
                </Text>

                <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.roleText, { color: colors.primary }]}>Customer</Text>
                </View>

                <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]}>
                    <Ionicons name="create-outline" size={18} color="#fff" />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Account Settings Section */}
            <CollapsibleSection title="Account Settings" icon="settings-outline">
                <SettingItem
                    icon="key-outline"
                    label="Change Password"
                    onPress={() => console.log('Change password')}
                />
                <SettingItem
                    icon="link-outline"
                    label="Connected Accounts"
                    value="3 accounts"
                    onPress={() => console.log('Manage accounts')}
                />
                <SettingItem
                    icon="shield-checkmark-outline"
                    label="Two-Factor Authentication"
                    toggle
                    toggleValue={twoFactorAuth}
                    onToggle={setTwoFactorAuth}
                />
                <SettingItem
                    icon="language-outline"
                    label="Language"
                    value="English"
                    onPress={() => console.log('Change language')}
                />
                <SettingItem
                    icon="globe-outline"
                    label="Region & Timezone"
                    value="India (IST)"
                    onPress={() => console.log('Change region')}
                />
            </CollapsibleSection>

            {/* Personal Details Section */}
            <CollapsibleSection title="Personal Details" icon="person-outline">
                <SettingItem
                    icon="location-outline"
                    label="Address"
                    value="Add address"
                    onPress={() => console.log('Add address')}
                />
                <SettingItem
                    icon="male-female-outline"
                    label="Gender"
                    value="Not specified"
                    onPress={() => console.log('Select gender')}
                />
                <SettingItem
                    icon="calendar-outline"
                    label="Date of Birth"
                    value="Not specified"
                    onPress={() => console.log('Select DOB')}
                />
                <View style={styles.divider} />
                <Text style={[styles.subsectionTitle, { color: colors.textSecondary }]}>
                    App Preferences
                </Text>
                <SettingItem
                    icon="moon-outline"
                    label="Dark Mode"
                    toggle
                    toggleValue={theme === 'dark'}
                    onToggle={toggleTheme}
                />
                <SettingItem
                    icon="notifications-outline"
                    label="Notification Style"
                    value="Banner"
                    onPress={() => console.log('Change notification style')}
                />
                <SettingItem
                    icon="color-palette-outline"
                    label="Theme Customization"
                    onPress={() => console.log('Customize theme')}
                />
            </CollapsibleSection>

            {/* Notifications & Preferences Section */}
            <CollapsibleSection title="Notifications & Preferences" icon="notifications-outline">
                <SettingItem
                    icon="phone-portrait-outline"
                    label="Push Notifications"
                    toggle
                    toggleValue={pushNotifications}
                    onToggle={setPushNotifications}
                />
                <SettingItem
                    icon="chatbox-outline"
                    label="SMS Notifications"
                    toggle
                    toggleValue={smsNotifications}
                    onToggle={setSmsNotifications}
                />
                <SettingItem
                    icon="mail-outline"
                    label="Email Notifications"
                    toggle
                    toggleValue={emailNotifications}
                    onToggle={setEmailNotifications}
                />
                <SettingItem
                    icon="alert-circle-outline"
                    label="Alerts & Updates"
                    onPress={() => console.log('Manage alerts')}
                />
                <SettingItem
                    icon="volume-high-outline"
                    label="Sound & Vibration"
                    onPress={() => console.log('Sound settings')}
                />
            </CollapsibleSection>

            {/* Activity & App Usage Section */}
            <CollapsibleSection title="Activity & App Usage" icon="analytics-outline">
                <SettingItem
                    icon="receipt-outline"
                    label="Order History"
                    value="12 orders"
                    onPress={() => console.log('View order history')}
                />
                <SettingItem
                    icon="heart-outline"
                    label="Saved Items"
                    value="8 items"
                    onPress={() => console.log('View saved items')}
                />
                <SettingItem
                    icon="bookmark-outline"
                    label="Favorites"
                    value="5 caterers"
                    onPress={() => console.log('View favorites')}
                />
                <SettingItem
                    icon="eye-outline"
                    label="Viewed Items"
                    value="24 items"
                    onPress={() => console.log('View history')}
                />
                <SettingItem
                    icon="time-outline"
                    label="Recently Used Features"
                    onPress={() => console.log('View recent features')}
                />
            </CollapsibleSection>

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editImageBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 14,
        marginBottom: 3,
    },
    userPhone: {
        fontSize: 14,
        marginBottom: 10,
    },
    roleBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 15,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 8,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    sectionContent: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 16,
        flex: 1,
    },
    settingItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingValue: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
    },
    subsectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    bottomSpacer: {
        height: 30,
    },
});
