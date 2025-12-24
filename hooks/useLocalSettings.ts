import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalSettings {
    theme: 'light' | 'dark' | 'system';
    notificationsEnabled: boolean;
    // Add other settings here as needed
}

const DEFAULT_SETTINGS: LocalSettings = {
    theme: 'system',
    notificationsEnabled: true,
};

const SETTINGS_KEY = '@user_local_settings';

export function useLocalSettings() {
    const [settings, setSettings] = useState<LocalSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
            if (jsonValue != null) {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(jsonValue) });
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        } finally {
            setLoading(false);
        }
    };

    const saveSetting = async <K extends keyof LocalSettings>(key: K, value: LocalSettings[K]) => {
        try {
            const newSettings = { ...settings, [key]: value };
            setSettings(newSettings);
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (e) {
            console.error("Failed to save setting", e);
        }
    };

    return {
        settings,
        saveSetting,
        loading,
    };
}
