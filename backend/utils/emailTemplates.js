const getOrderConfirmationTemplate = (order, user) => {
  const itemsList = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #27272a; color: #ffffff;">${item.name} (${item.size || 'STD'})</td>
        <td style="padding: 10px; border-bottom: 1px solid #27272a; color: #a1a1aa; text-align: center;">${item.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #27272a; color: #ffffff; text-align: right;">Rs ${item.price * item.qty}</td>
      </tr>`
    )
    .join('');

  return `
    <div style="background-color: #0f0f0f; font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #27272a;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #27272a;">
        <h1 style="color: #ffffff; letter-spacing: 2px; margin: 0; font-size: 24px;">ROYAL TAILOR</h1>
        <p style="color: #f59e0b; font-size: 12px; font-weight: bold; margin-top: 5px; text-transform: uppercase;">Order Confirmation</p>
      </div>

      <div style="padding: 20px 0;">
        <p style="font-size: 16px; color: #e4e4e7;">Hello <strong>${user.name}</strong>,</p>
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5;">Thank you for shopping with Royal Tailor! Your order has been received and is currently being processed.</p>
        
        <div style="background-color: #18181b; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #27272a;">
          <p style="margin: 0 0 5px 0; color: #a1a1aa; font-size: 12px;">ORDER ID</p>
          <p style="margin: 0; font-family: monospace; font-size: 16px; color: #f59e0b; font-weight: bold;">#${order._id}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #18181b; text-align: left; color: #a1a1aa; font-size: 12px;">
              <th style="padding: 10px;">ITEM</th>
              <th style="padding: 10px; text-align: center;">QTY</th>
              <th style="padding: 10px; text-align: right;">PRICE</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; color: #ffffff;">
          Total Paid: <span style="color: #f59e0b;">Rs ${order.totalPrice}</span>
        </div>
      </div>

      <div style="border-top: 1px solid #27272a; padding-top: 20px; text-align: center; color: #71717a; font-size: 12px;">
        <p>Questions about your order? Reply directly to this email or call +91-9304566723.</p>
        <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Royal Tailor. All rights reserved.</p>
      </div>
    </div>
  `;
};

const getOrderStatusUpdateTemplate = (order, user) => {
  return `
    <div style="background-color: #0f0f0f; font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #27272a;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #27272a;">
        <h1 style="color: #ffffff; letter-spacing: 2px; margin: 0; font-size: 24px;">ROYAL TAILOR</h1>
        <p style="color: #f59e0b; font-size: 12px; font-weight: bold; margin-top: 5px; text-transform: uppercase;">Order Status Update</p>
      </div>

      <div style="padding: 20px 0; text-align: center;">
        <p style="font-size: 16px; color: #e4e4e7;">Hi <strong>${user.name}</strong>,</p>
        <p style="color: #a1a1aa; font-size: 14px;">The status of your order <strong>#${order._id}</strong> has been updated:</p>
        
        <div style="display: inline-block; background-color: #f59e0b; color: #000000; padding: 12px 24px; border-radius: 30px; font-weight: 900; font-size: 16px; margin: 20px 0; text-transform: uppercase;">
          ${order.status}
        </div>

        <p style="color: #a1a1aa; font-size: 13px; margin-top: 15px;">You can view full details anytime under Order History in your user profile.</p>
      </div>

      <div style="border-top: 1px solid #27272a; padding-top: 20px; text-align: center; color: #71717a; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} Royal Tailor. All rights reserved.</p>
      </div>
    </div>
  `;
};

module.exports = {
  getOrderConfirmationTemplate,
  getOrderStatusUpdateTemplate,
};