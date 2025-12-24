// Database Type Definitions for CaterConnect

export interface Business {
    businessId: string; // 8-digit unique ID
    businessInfo: {
        name: string;
        email: string;
        phone: string;
        address: string;
        verified: boolean;
        createdAt: number; // timestamp
    };
    stats: {
        totalOrders: number;
        rating: number;
    };
}

export interface Customer {
    userId: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: number; // timestamp
}

export interface MenuItem {
    itemId: string;
    name: string;
    category: string;
    isVeg: boolean;
    quantity: number;
}

export interface Session {
    sessionId: string;
    date: string; // ISO format
    sessionName: string; // e.g., "Day 1 - Lunch", "Day 2 - Dinner"
    numberOfPeople: number;
    servingType: string; // e.g., "Buffet", "Plated", "Family Style"
    menuItems: { [itemId: string]: MenuItem };
}

export interface Order {
    orderId: string;
    customerId: string;
    businessId: string; // 8-digit business ID
    eventType: string; // e.g., "Wedding", "Corporate Event", "Birthday Party"
    foodPreference: "veg" | "non-veg" | "mixed";
    serviceType: string; // e.g., "Hire Cooks", "Cook & Supply", "Full Catering"
    numberOfPeople: number; // Total across all sessions
    status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
    createdAt: number; // timestamp
    updatedAt: number; // timestamp
    sessions: { [sessionId: string]: Session };
    totalAmount?: number;
    notes?: string;
}

export interface OrderInput {
    customerId: string;
    businessId: string;
    eventType: string;
    foodPreference: "veg" | "non-veg" | "mixed";
    serviceType: string;
    numberOfPeople: number;
    venue?: string;
    sessions: Omit<Session, 'sessionId'>[];
    notes?: string;
}

export interface MenuCategory {
    id: string;
    businessId: string;
    name: string;
    displayOrder: number;
    createdAt: number;
    updatedAt: number;
}

export interface MenuItemDB {
    id: string;
    businessId: string;
    categoryId: string;
    name: string;
    isVeg: boolean;
    price?: number;
    description?: string;
    available: boolean;
    createdAt: number;
    updatedAt: number;
}

