import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

interface ThemeColors {
    primary: string;
    primaryLight: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    icon: string;
    iconInactive: string;
    surface: string;
    success: string;
    warning: string;
    error: string;
}

interface ThemeContextType {
    theme: Theme;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const LightColors: ThemeColors = {
    primary: "#5B5FC7", // Soft purple/blue
    primaryLight: "#F0F1FF", // Very light purple
    background: "#FFFFFF", // Pure white
    card: "#FFFFFF", // Pure white
    text: "#1A1A1A", // Almost black
    textSecondary: "#8E8E93", // Light gray
    border: "#F0F0F0", // Very light gray
    icon: "#5B5FC7", // Match primary
    iconInactive: "#C7C7CC", // Light gray
    surface: "#F8F8F8", // Off-white
    success: "#34C759", // Green
    warning: "#FF9500", // Orange
    error: "#FF3B30", // Red
};

const DarkColors: ThemeColors = {
    primary: "#6366F1", // Indigo 500
    primaryLight: "#312E81", // Indigo 900
    background: "#111827", // Gray 900
    card: "#1F2937", // Gray 800
    text: "#F9FAFB", // Gray 50
    textSecondary: "#9CA3AF", // Gray 400
    border: "#374151", // Gray 700
    icon: "#D1D5DB", // Gray 300
    iconInactive: "#6B7280", // Gray 500
    surface: "#111827", // Gray 900
    success: "#34D399", // Emerald 400
    warning: "#FBBF24", // Amber 400
    error: "#F87171", // Red 400
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<Theme>("light");

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem("user_theme");
            if (savedTheme) {
                setThemeState(savedTheme as Theme);
            } else if (systemColorScheme) {
                setThemeState(systemColorScheme);
            }
        } catch (error) {
            console.error("Failed to load theme", error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem("user_theme", newTheme);
        } catch (error) {
            console.error("Failed to save theme", error);
        }
    };

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem("user_theme", newTheme);
        } catch (error) {
            console.error("Failed to save theme", error);
        }
    };

    const colors = theme === "light" ? LightColors : DarkColors;

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
