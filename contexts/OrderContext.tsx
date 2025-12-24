// Order Context - Manages order state across the order creation flow
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MenuItem } from '../types/database';

interface SessionData {
    sessionName: string;
    date: string;
    time?: string;
    numberOfPeople: number;
    servingType: string;
    menuItems: { [itemId: string]: MenuItem };
}

interface OrderContextType {
    // Order data
    eventType: string;
    foodPreference: 'veg' | 'non-veg' | 'mixed' | '';
    cuisine: string;
    serviceType: string;
    businessId: string;
    venue: string;
    sessions: SessionData[];

    // Actions
    setEventType: (type: string) => void;
    setFoodPreference: (pref: 'veg' | 'non-veg' | 'mixed' | '') => void;
    setCuisine: (cuisine: string) => void;
    setServiceType: (type: string) => void;
    setBusinessId: (id: string) => void;
    setVenue: (venue: string) => void;

    // Session management
    addOrderSession: (session: SessionData) => void;
    removeOrderSession: (index: number) => void;
    clearSessions: () => void;

    // Reset entire order
    resetOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
    const [eventType, setEventType] = useState<string>('');
    const [foodPreference, setFoodPreference] = useState<'veg' | 'non-veg' | 'mixed' | ''>('');
    const [cuisine, setCuisine] = useState('');
    const [serviceType, setServiceType] = useState<string>('');
    const [businessId, setBusinessId] = useState<string>('');
    const [venue, setVenue] = useState<string>('');
    const [sessions, setSessions] = useState<SessionData[]>([]);

    const addOrderSession = (session: SessionData) => {
        setSessions(prev => [...prev, session]);
    };

    const removeOrderSession = (index: number) => {
        setSessions(prev => prev.filter((_, i) => i !== index));
    };

    const clearSessions = () => {
        setSessions([]);
    };

    const resetOrder = () => {
        setEventType('');
        setFoodPreference('');
        setCuisine('');
        setServiceType('');
        setBusinessId('');
        setVenue('');
        setSessions([]);
    };

    return (
        <OrderContext.Provider
            value={{
                eventType,
                foodPreference,
                cuisine,
                serviceType,
                businessId,
                venue,
                sessions,
                setEventType,
                setFoodPreference,
                setCuisine,
                setServiceType,
                setBusinessId,
                setVenue,
                addOrderSession,
                removeOrderSession,
                clearSessions,
                resetOrder,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
}

export const useOrder = (): OrderContextType => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};
