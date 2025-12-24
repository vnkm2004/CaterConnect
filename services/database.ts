// Database Service for CaterConnect (Supabase)
import { supabase } from '../config/supabase';
import { Business, Customer, Order, OrderInput, Session } from '../types/database';

/**
 * Create a new business in the database
 */
export const createBusiness = async (
    userId: string,
    email: string,
    name: string,
    phone: string,
    address: string
): Promise<string> => {
    console.log("createBusiness called with userId:", userId);

    const businessData = {
        id: userId,
        user_id: userId,
        email,
        name,
        phone,
        address,
        verified: false,
        stats: {
            totalOrders: 0,
            rating: 0,
        },
    };

    const { error } = await supabase
        .from('businesses')
        .insert(businessData);

    if (error) {
        console.error("Error creating business:", error);
        throw error;
    }

    return userId;
};

/**
 * Get business data by ID
 */
export const getBusiness = async (businessId: string): Promise<Business | null> => {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

    if (error) return null;

    // Map Supabase response to Business type
    return {
        businessId: data.id,
        businessInfo: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            verified: data.verified,
            createdAt: new Date(data.created_at).getTime(),
        },
        stats: data.stats,
    };
};

/**
 * Get all businesses
 */
export const getAllBusinesses = async (): Promise<Business[]> => {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

    console.log("getAllBusinesses response:", { dataLength: data?.length, error });

    if (error) {
        console.error("Error fetching businesses:", error);
        return [];
    }

    return data.map((business: any) => ({
        businessId: business.id,
        businessInfo: {
            name: business.name,
            email: business.email,
            phone: business.phone,
            address: business.address,
            verified: business.verified,
            createdAt: new Date(business.created_at).getTime(),
        },
        stats: business.stats,
    }));
};

/**
 * Create a new customer profile
 */
export const createCustomer = async (
    userId: string,
    email: string,
    name: string,
    phone?: string
): Promise<void> => {
    const { error } = await supabase
        .from('customers')
        .insert({
            id: userId,
            email,
            name,
            phone,
        });

    if (error) throw error;
};

/**
 * Get all orders for a business
 */
export const getBusinessOrders = async (businessId: string): Promise<any[]> => {
    console.log("getBusinessOrders called with businessId:", businessId);

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            customers (
                id,
                name,
                email,
                phone
            )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching business orders:", error);
        throw error;
    }

    console.log(`Found ${orders?.length || 0} orders for business ${businessId}`);

    // Fetch menu items for each order
    const ordersWithMenuItems = await Promise.all(
        (orders || []).map(async (order) => {
            const { data: menuItems } = await supabase
                .from('order_menu_items')
                .select('*')
                .eq('order_id', order.id)
                .order('session_index');

            return {
                ...order,
                menuItems: menuItems || [],
            };
        })
    );

    return ordersWithMenuItems;
};

/**
 * Get all orders for a customer
 */
export const getCustomerOrders = async (customerId: string): Promise<any[]> => {
    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
            *,
            businesses (
                id,
                name,
                email,
                phone,
                address
            )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch menu items for each order
    const ordersWithMenuItems = await Promise.all(
        orders.map(async (order) => {
            const { data: menuItems } = await supabase
                .from('order_menu_items')
                .select('*')
                .eq('order_id', order.id)
                .order('session_index');

            return {
                ...order,
                menuItems: menuItems || [],
            };
        })
    );

    return ordersWithMenuItems;
};

/**
 * Get detailed information for a specific order
 */
export const getOrderDetails = async (orderId: string): Promise<any> => {
    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            customers (
                id,
                name,
                email,
                phone
            ),
            businesses (
                id,
                name,
                email,
                phone,
                address
            )
        `)
        .eq('id', orderId)
        .single();

    if (error) throw error;

    // Fetch menu items
    const { data: menuItems } = await supabase
        .from('order_menu_items')
        .select('*')
        .eq('order_id', orderId)
        .order('session_index');

    return {
        ...order,
        menuItems: menuItems || [],
    };
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
    const { error } = await supabase
        .from('orders')
        .update({
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

    if (error) throw error;
};

/**
 * Get customer data by user ID
 */
export const getCustomer = async (userId: string): Promise<Customer | null> => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return null;

    return {
        userId: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        createdAt: new Date(data.created_at).getTime(),
    };
};

/**
 * Submit a complete order with all details including menu items
 */
export const submitOrder = async (orderData: {
    businessId: string;
    eventType: string;
    foodPreference: string;
    cuisine: string;
    serviceType: string;
    venue: string;
    sessions: Array<{
        sessionName: string;
        date: string;
        time: string;
        venue: string;
        numberOfPeople: number;
        servingType: string;
        menuItems: Array<{
            name: string;
            category: string;
            isVeg: boolean;
        }>;
    }>;
    notes?: string;
}): Promise<{ orderId: string; orderNumber: string }> => {
    console.log('submitOrder called with data:', JSON.stringify(orderData, null, 2));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    console.log('User authenticated:', user.id);

    // Calculate total people
    const totalPeople = orderData.sessions.reduce((sum, session) => sum + session.numberOfPeople, 0);
    console.log('Total people:', totalPeople);

    // Generate unique order number
    const orderNumber = await generateOrderNumber();
    console.log('Generated order number:', orderNumber);

    // Create order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            order_number: orderNumber,
            customer_id: user.id,
            business_id: orderData.businessId,
            event_type: orderData.eventType,
            food_preference: orderData.foodPreference,
            cuisine: orderData.cuisine,
            service_type: orderData.serviceType,
            venue: orderData.venue,
            number_of_people: totalPeople,
            status: 'pending',
            sessions: orderData.sessions,
            notes: orderData.notes || '',
        })
        .select()
        .single();

    if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
    }

    console.log('Order created successfully:', order.id);

    // Save menu items for each session
    const menuItemsToInsert: any[] = [];
    orderData.sessions.forEach((session, sessionIndex) => {
        session.menuItems.forEach((item) => {
            menuItemsToInsert.push({
                order_id: order.id,
                session_index: sessionIndex,
                item_name: item.name,
                item_category: item.category,
                is_veg: item.isVeg,
                quantity: 1,
            });
        });
    });

    if (menuItemsToInsert.length > 0) {
        console.log('Inserting menu items:', menuItemsToInsert.length);
        const { error: menuError } = await supabase
            .from('order_menu_items')
            .insert(menuItemsToInsert);

        if (menuError) {
            console.error('Error inserting menu items:', menuError);
            throw menuError;
        }
        console.log('Menu items inserted successfully');
    }

    // Update business stats
    const { data: business } = await supabase
        .from('businesses')
        .select('stats')
        .eq('id', orderData.businessId)
        .single();

    if (business) {
        const newStats = {
            ...business.stats,
            totalOrders: (business.stats.totalOrders || 0) + 1
        };

        await supabase
            .from('businesses')
            .update({ stats: newStats })
            .eq('id', orderData.businessId);

        console.log('Business stats updated');
    }

    console.log('Order submission complete:', { orderId: order.id, orderNumber: order.order_number });
    return {
        orderId: order.id,
        orderNumber: order.order_number
    };
};


/**
 * Generate a unique 12-digit order number
 * Format: YYYYMMDD + 4-digit sequence (e.g., 202511280001)
 */
const generateOrderNumber = async (): Promise<string> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    // Get today's orders to find the next sequence number
    const { data, error } = await supabase
        .from('orders')
        .select('order_number')
        .like('order_number', `${datePrefix}%`)
        .order('order_number', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching orders for sequence:', error);
        return `${datePrefix}0001`;
    }

    let sequence = 1;
    if (data && data.length > 0 && data[0].order_number) {
        const lastOrderNumber = data[0].order_number;
        const lastSequence = parseInt(lastOrderNumber.slice(-4));
        sequence = lastSequence + 1;
    }

    const sequenceStr = String(sequence).padStart(4, '0');
    return `${datePrefix}${sequenceStr}`;
};

/**
 * Legacy createOrder function for backwards compatibility
 */
export const createOrder = async (orderData: OrderInput): Promise<{ orderId: string; orderNumber: string }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    // Convert sessions array to object with generated IDs
    const sessionsObject: { [key: string]: Session } = {};
    let totalPeople = 0;

    orderData.sessions.forEach((session, index) => {
        const sessionId = `session_${Date.now()}_${index}`;
        sessionsObject[sessionId] = {
            ...session,
            sessionId,
        };
        totalPeople += session.numberOfPeople || 0;
    });

    // Generate unique order number
    const orderNumber = await generateOrderNumber();

    const { data, error } = await supabase
        .from('orders')
        .insert({
            order_number: orderNumber,
            customer_id: user.id,
            business_id: orderData.businessId,
            event_type: orderData.eventType,
            food_preference: orderData.foodPreference,
            service_type: orderData.serviceType,
            number_of_people: totalPeople || orderData.numberOfPeople,
            venue: orderData.venue,
            status: 'pending',
            sessions: sessionsObject,
            notes: orderData.notes,
        })
        .select()
        .single();

    if (error) throw error;

    // Update business stats (increment total orders)
    // Note: In a real app, this should be done via a database trigger or edge function
    const { data: business } = await supabase
        .from('businesses')
        .select('stats')
        .eq('id', orderData.businessId)
        .single();

    if (business) {
        const newStats = {
            ...business.stats,
            totalOrders: (business.stats.totalOrders || 0) + 1
        };

        await supabase
            .from('businesses')
            .update({ stats: newStats })
            .eq('id', orderData.businessId);
    }

    return {
        orderId: data.id,
        orderNumber: data.order_number
    };
};

/**
 * Get order by ID
 */
export const getOrder = async (orderId: string): Promise<Order | null> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error) return null;

    return {
        orderId: data.id,
        customerId: data.customer_id,
        businessId: data.business_id,
        eventType: data.event_type,
        foodPreference: data.food_preference,
        serviceType: data.service_type,
        numberOfPeople: data.number_of_people,
        status: data.status,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        sessions: data.sessions,
        notes: data.notes,
    };
};

/**
 * Update order status (legacy version kept for compatibility)
 */
export const updateOrderStatusLegacy = async (
    orderId: string,
    status: Order['status']
): Promise<void> => {
    await supabase
        .from('orders')
        .update({
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
};

/**
 * Update order details
 */
export const updateOrder = async (
    orderId: string,
    updates: Partial<Order>
): Promise<void> => {
    // Map frontend fields to DB fields if necessary
    // For now assuming direct mapping for simple fields
    const dbUpdates: any = {
        updated_at: new Date().toISOString()
    };

    if (updates.status) dbUpdates.status = updates.status;
    if (updates.notes) dbUpdates.notes = updates.notes;
    // Add other fields as needed

    const { error } = await supabase
        .from('orders')
        .update(dbUpdates)
        .eq('id', orderId);

    if (error) {
        console.error('Error updating order:', error);
        throw error;
    }
};

/**
 * Get business by user ID (for authenticated user)
 */
export const getBusinessByUserId = async (userId: string): Promise<Business | null> => {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) return null;

    return {
        businessId: data.id,
        businessInfo: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            verified: data.verified,
            createdAt: new Date(data.created_at).getTime(),
        },
        stats: data.stats,
    };
};

/**
 * Update business information
 */
export const updateBusiness = async (
    businessId: string,
    updates: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        description?: string;
    }
): Promise<void> => {
    console.log("updateBusiness called for:", businessId, "with updates:", updates);
    const dbUpdates: any = {
        updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const { error } = await supabase
        .from('businesses')
        .update(dbUpdates)
        .eq('id', businessId);

    if (error) {
        console.error("Error updating business in DB:", error);
        throw error;
    }
    console.log("Business updated successfully in DB");
};

/**
 * Update business services
 */
export const updateBusinessServices = async (
    businessId: string,
    services: string[]
): Promise<void> => {
    const { error } = await supabase
        .from('businesses')
        .update({
            services,
            updated_at: new Date().toISOString()
        })
        .eq('id', businessId);

    if (error) throw error;
};

/**
 * Update accepting orders status
 */
export const updateAcceptingOrders = async (
    businessId: string,
    acceptingOrders: boolean
): Promise<void> => {
    const { error } = await supabase
        .from('businesses')
        .update({
            accepting_orders: acceptingOrders,
            updated_at: new Date().toISOString()
        })
        .eq('id', businessId);

    if (error) throw error;
};

/**
 * ADMIN FUNCTIONS
 */

/**
 * Get all pending (unverified) businesses
 */
export const getPendingBusinesses = async (): Promise<any[]> => {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('verified', false)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching pending businesses:", error);
        return [];
    }

    return data || [];
};

/**
 * Approve a business (set verified to true)
 */
export const approveBusiness = async (businessId: string): Promise<void> => {
    const { error } = await supabase
        .from('businesses')
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq('id', businessId);

    if (error) {
        console.error("Error approving business:", error);
        throw error;
    }
};

/**
 * Reject a business (delete from database)
 */
export const rejectBusiness = async (businessId: string): Promise<void> => {
    const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

    if (error) {
        console.error("Error rejecting business:", error);
        throw error;
    }
};

/**
 * MENU MANAGEMENT FUNCTIONS
 */

/**
 * Get all menu categories for a business
 */
export const getBusinessMenuCategories = async (businessId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

    if (error) {
        console.error("Error fetching menu categories:", error);
        return [];
    }

    return data || [];
};

/**
 * Get menu items for a business, optionally filtered by category
 */
export const getBusinessMenuItems = async (
    businessId: string,
    categoryId?: string
): Promise<any[]> => {
    let query = supabase
        .from('menu_items')
        .select(`
            *,
            menu_categories (
                id,
                name
            )
        `)
        .eq('business_id', businessId);

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
        console.error("Error fetching menu items:", error);
        return [];
    }

    return data || [];
};

/**
 * Create a new menu category
 */
export const createMenuCategory = async (
    businessId: string,
    categoryName: string,
    displayOrder?: number
): Promise<string> => {
    const { data, error } = await supabase
        .from('menu_categories')
        .insert({
            business_id: businessId,
            name: categoryName,
            display_order: displayOrder || 0
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating menu category:", error);
        throw error;
    }

    return data.id;
};

/**
 * Update a menu category
 */
export const updateMenuCategory = async (
    categoryId: string,
    updates: { name?: string; displayOrder?: number }
): Promise<void> => {
    const dbUpdates: any = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder;

    const { error } = await supabase
        .from('menu_categories')
        .update(dbUpdates)
        .eq('id', categoryId);

    if (error) {
        console.error("Error updating menu category:", error);
        throw error;
    }
};

/**
 * CHAT FUNCTIONS
 */

/**
 * Get messages for an order
 */
export const getMessages = async (orderId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        return [];
    }

    return data || [];
};

/**
 * Send a message
 */
export const sendMessage = async (orderId: string, message: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
        .from('messages')
        .insert({
            order_id: orderId,
            sender_id: user.id,
            message: message.trim(),
        });

    if (error) throw error;
};

/**
 * Subscribe to messages for an order
 */
export const subscribeToMessages = (orderId: string, callback: (payload: any) => void) => {
    return supabase
        .channel(`public:messages:order_id=eq.${orderId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `order_id=eq.${orderId}`,
            },
            (payload) => {
                callback(payload.new);
            }
        )
        .subscribe();
};

/**
 * Delete a menu category (will cascade delete all items in that category)
 */
export const deleteMenuCategory = async (categoryId: string): Promise<void> => {
    const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', categoryId);

    if (error) {
        console.error("Error deleting menu category:", error);
        throw error;
    }
};

/**
 * Create a new menu item
 */
export const createMenuItem = async (itemData: {
    businessId: string;
    categoryId: string;
    name: string;
    isVeg: boolean;
    price?: number;
    description?: string;
    available?: boolean;
}): Promise<string> => {
    const { data, error } = await supabase
        .from('menu_items')
        .insert({
            business_id: itemData.businessId,
            category_id: itemData.categoryId,
            name: itemData.name,
            is_veg: itemData.isVeg,
            price: itemData.price,
            description: itemData.description,
            available: itemData.available !== undefined ? itemData.available : true
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating menu item:", error);
        throw error;
    }

    return data.id;
};

/**
 * Update a menu item
 */
export const updateMenuItem = async (
    itemId: string,
    updates: {
        name?: string;
        categoryId?: string;
        isVeg?: boolean;
        price?: number;
        description?: string;
        available?: boolean;
    }
): Promise<void> => {
    const dbUpdates: any = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.isVeg !== undefined) dbUpdates.is_veg = updates.isVeg;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.available !== undefined) dbUpdates.available = updates.available;

    const { error } = await supabase
        .from('menu_items')
        .update(dbUpdates)
        .eq('id', itemId);

    if (error) {
        console.error("Error updating menu item:", error);
        throw error;
    }
};

/**
 * Delete a menu item
 */
export const deleteMenuItem = async (itemId: string): Promise<void> => {
    const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error("Error deleting menu item:", error);
        throw error;
    }
};

/**
 * Toggle menu item availability
 */
export const toggleMenuItemAvailability = async (
    itemId: string,
    available: boolean
): Promise<void> => {
    const { error } = await supabase
        .from('menu_items')
        .update({ available })
        .eq('id', itemId);

    if (error) {
        console.error("Error toggling menu item availability:", error);
        throw error;
    }
};

/**
 * Bulk import default dishes as menu items for a business
 */
export const importDefaultDishes = async (
    businessId: string,
    dishes: { [category: string]: Array<{ id: string; name: string; type: string }> }
): Promise<void> => {
    // First, create categories
    const categoryMap: { [name: string]: string } = {};

    for (const categoryName of Object.keys(dishes)) {
        const categoryId = await createMenuCategory(businessId, categoryName);
        categoryMap[categoryName] = categoryId;
    }

    // Then, create menu items
    const itemsToInsert: any[] = [];

    for (const [categoryName, items] of Object.entries(dishes)) {
        const categoryId = categoryMap[categoryName];

        for (const item of items) {
            itemsToInsert.push({
                business_id: businessId,
                category_id: categoryId,
                name: item.name,
                is_veg: item.type === 'Veg',
                available: true
            });
        }
    }

    if (itemsToInsert.length > 0) {
        const { error } = await supabase
            .from('menu_items')
            .insert(itemsToInsert);

        if (error) {
            console.error("Error importing default dishes:", error);
            throw error;
        }
    }
};


/**
 * MENU FILE UPLOAD FUNCTIONS
 */

export interface MenuFile {
    name: string;
    url: string;
    uploadedAt: string;
    uploadedBy: 'business' | 'customer';
    size?: number;
    type?: string;
}

/**
 * Upload a menu file to Supabase Storage and update the order
 */
export const uploadMenuFile = async (
    orderId: string,
    fileUri: string,
    fileName: string,
    fileType: string,
    uploadedBy: 'business' | 'customer'
): Promise<void> => {
    try {
        // Read file as blob
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // Generate unique file name to avoid conflicts
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}_${fileName}`;
        const filePath = `${orderId}/${uniqueFileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('order-menus')
            .upload(filePath, blob, {
                contentType: fileType,
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('order-menus')
            .getPublicUrl(filePath);

        // Get current menu_files array
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('menu_files')
            .eq('id', orderId)
            .single();

        if (fetchError) throw fetchError;

        // Add new file to the array
        const currentFiles: MenuFile[] = order.menu_files || [];
        const newFile: MenuFile = {
            name: fileName,
            url: publicUrl,
            uploadedAt: new Date().toISOString(),
            uploadedBy,
            size: blob.size,
            type: fileType
        };

        const updatedFiles = [...currentFiles, newFile];

        // Update order with new file
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                menu_files: updatedFiles,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) throw updateError;

        console.log('File uploaded successfully:', fileName);
    } catch (error) {
        console.error('Error in uploadMenuFile:', error);
        throw error;
    }
};

/**
 * Delete a menu file from storage and update the order
 */
export const deleteMenuFile = async (
    orderId: string,
    fileUrl: string
): Promise<void> => {
    try {
        // Extract file path from URL
        const urlParts = fileUrl.split('/order-menus/');
        if (urlParts.length < 2) {
            throw new Error('Invalid file URL');
        }
        const filePath = urlParts[1];

        // Delete from storage
        const { error: deleteError } = await supabase.storage
            .from('order-menus')
            .remove([filePath]);

        if (deleteError) {
            console.error('Error deleting file from storage:', deleteError);
            // Continue even if storage deletion fails
        }

        // Get current menu_files array
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('menu_files')
            .eq('id', orderId)
            .single();

        if (fetchError) throw fetchError;

        // Remove file from array
        const currentFiles: MenuFile[] = order.menu_files || [];
        const updatedFiles = currentFiles.filter(file => file.url !== fileUrl);

        // Update order
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                menu_files: updatedFiles,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) throw updateError;

        console.log('File deleted successfully');
    } catch (error) {
        console.error('Error in deleteMenuFile:', error);
        throw error;
    }
};

/**
 * Get all menu files for an order
 */
export const getOrderMenuFiles = async (orderId: string): Promise<MenuFile[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select('menu_files')
        .eq('id', orderId)
        .single();

    if (error) {
        console.error('Error fetching menu files:', error);
        return [];
    }

    return data.menu_files || [];
};

