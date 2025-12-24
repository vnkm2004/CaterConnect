import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';

export const generateMenuPDF = async (order: any): Promise<string> => {
    const sessions = order.sessions || {};
    const sessionKeys = Object.keys(sessions);

    // Generate HTML content
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #007AFF;
            padding-bottom: 20px;
        }
        .order-number {
            font-size: 32px;
            font-weight: bold;
            color: #007AFF;
            margin-bottom: 10px;
        }
        .event-type {
            font-size: 24px;
            color: #666;
            margin-bottom: 5px;
        }
        .venue {
            font-size: 16px;
            color: #999;
        }
        .business-info {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .business-info h3 {
            margin-top: 0;
            color: #007AFF;
        }
        .session {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        .session-header {
            background: #007AFF;
            color: white;
            padding: 15px 20px;
            border-radius: 8px 8px 0 0;
            margin-bottom: 0;
        }
        .session-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .session-details {
            font-size: 14px;
            opacity: 0.9;
        }
        .menu-items {
            border: 1px solid #e0e0e0;
            border-top: none;
            border-radius: 0 0 8px 8px;
            padding: 20px;
        }
        .menu-item {
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .menu-item:last-child {
            border-bottom: none;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }
        .item-name {
            font-size: 16px;
            font-weight: 500;
        }
        .item-qty {
            font-size: 14px;
            color: #666;
            font-weight: 600;
        }
        .item-category {
            font-size: 13px;
            color: #999;
        }
        .veg-icon {
            color: green;
        }
        .non-veg-icon {
            color: red;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="order-number">#${order.order_number}</div>
        <div class="event-type">${order.event_type} Catering</div>
        ${order.venue ? `<div class="venue">📍 ${order.venue}</div>` : ''}
    </div>

    <div class="business-info">
        <h3>Caterer Information</h3>
        <p><strong>${order.business?.name || 'N/A'}</strong></p>
        <p>📞 ${order.business?.phone || 'N/A'}</p>
        <p>📧 ${order.business?.email || 'N/A'}</p>
        ${order.business?.address ? `<p>📍 ${order.business.address}</p>` : ''}
    </div>

    <div class="business-info">
        <h3>Customer Information</h3>
        <p><strong>${order.customer?.name || 'N/A'}</strong></p>
        <p>📞 ${order.customer?.phone || 'N/A'}</p>
        <p>📧 ${order.customer?.email || 'N/A'}</p>
    </div>

    ${sessionKeys.map((key, index) => {
        const session = sessions[key];
        const menuItems = session.menuItems || {};
        const itemsArray = Object.values(menuItems);

        return `
        <div class="session">
            <div class="session-header">
                <div class="session-name">${session.sessionName}</div>
                <div class="session-details">
                    ${session.servingType} • ${session.numberOfPeople} people
                    ${session.date ? ` • ${new Date(session.date).toLocaleDateString()}` : ''}
                </div>
            </div>
            <div class="menu-items">
                ${itemsArray.length > 0 ? itemsArray.map((item: any) => `
                    <div class="menu-item">
                        <div class="item-header">
                            <span class="item-name">
                                <span class="${item.isVeg ? 'veg-icon' : 'non-veg-icon'}">
                                    ${item.isVeg ? '🟢' : '🔴'}
                                </span>
                                ${item.name}
                            </span>
                            <span class="item-qty">×${item.quantity}</span>
                        </div>
                        <div class="item-category">${item.category}</div>
                    </div>
                `).join('') : '<p style="text-align: center; color: #999;">No menu items</p>'}
            </div>
        </div>
        `;
    }).join('')}

    <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>CaterConnect - Professional Catering Services</p>
    </div>
</body>
</html>
    `;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
    });

    return uri;
};
