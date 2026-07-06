import "./SidePanel.css";

function SidePanel({ shop, onClose }) {
  if (!shop) return null;

  return (
    <div className="sidepanel">
      <button className="close-btn" onClick={onClose}>X</button>

      <h2>{shop.shop_name}</h2>
      <p><b>Category:</b> {shop.category || "N/A"}{shop.sub_category ? ` - ${shop.sub_category}` : ''}</p>
      <p><b>Size:</b> {shop.size || "N/A"}</p>
      <p><b>Model:</b> {shop.model || "N/A"}</p>
      <p><b>Rental Price/Commission:</b> {shop.rental_price_or_commission ? `₹${shop.rental_price_or_commission}` : "N/A"}</p>
      <p><b>Orders/Day:</b> {shop.no_of_orders_per_day || "0"}</p>
      <p><b>Online Order:</b> {shop.online_order ? "Yes" : "No"}</p>
      {shop.online_order && <p><b>Medium:</b> {shop.medium_of_online_orders}</p>}
      
      <p><b>Visited:</b> {shop.visited ? "Yes" : "No"}</p>
      <p><b>Offers Discount:</b> {shop.offers_discount_regularly ? "Yes" : "No"}</p>
      <p><b>GST Holder:</b> {shop.gst_holder ? "Yes" : "No"}</p>
      <p><b>Billing System:</b> {shop.billing_system ? "Yes" : "No"}</p>
      {shop.billing_system && <p><i>{shop.billing_system_description}</i></p>}
      
      <p><b>Inventory Mgmt:</b> {shop.inventory_management ? "Yes" : "No"}</p>
      {shop.inventory_management && <p><i>{shop.inventory_management_description}</i></p>}
      
      <p><b>Distribution:</b> {shop.distribution || "N/A"}</p>
      <p><b>Restocking (days):</b> {shop.restocking_frequency_in_days || "N/A"}</p>
      <p><b>Model Acceptance:</b> {shop.model_acceptance ? "Yes" : "No"}</p>
      <p><b>Willing to Shelf:</b> {shop.willing_to_shelf ? "Yes" : "No"}</p>
      
      {shop.feedback && (
        <div className="feedback-section">
          <b>Feedback:</b>
          <p>{shop.feedback}</p>
        </div>
      )}

      {shop.image_url && (
        <img src={shop.image_url} alt="Shop" className="shop-image" />
      )}
    </div>
  );
}

export default SidePanel;
