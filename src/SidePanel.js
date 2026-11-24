import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useAuth } from "./AuthGate";
import { formatPrice } from "./utils/format";
import "./SidePanel.css";

function SidePanel({ shop, onClose, onDeleted }) {
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!shop) return null;

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${shop.shop_name}"? This can't be undone.`)) return;
    setBusy(true);
    const { data, error } = await supabase.from("shops").delete().eq("id", shop.id).select("id");
    setBusy(false);
    if (error || !data || data.length === 0) {
      alert("Couldn't delete this shop" + (error ? `: ${error.message}` : " (no permission)."));
      return;
    }
    onDeleted(shop.id);
  };

  return (
    <div className="sidepanel">
      <button className="close-btn" onClick={onClose} aria-label="Close">X</button>

      <h2>{shop.shop_name}</h2>

      {canEdit && (
        <div className="sidepanel-actions">
          <button className="sp-btn edit" onClick={() => navigate(`/edit/${shop.id}`)} disabled={busy}>Edit</button>
          <button className="sp-btn delete" onClick={handleDelete} disabled={busy}>{busy ? "Deleting…" : "Delete"}</button>
        </div>
      )}

      <p><b>Category:</b> {shop.category || "N/A"}{shop.sub_category ? ` - ${shop.sub_category}` : ''}</p>
      <p><b>Size:</b> {shop.size || "N/A"}</p>
      <p><b>Model:</b> {shop.model || "N/A"}</p>
      <p><b>{shop.model === "Commission" ? "Commission:" : shop.model === "Rental" ? "Rent offered:" : "Rent/Commission:"}</b> {formatPrice(shop)}</p>
      <p><b>Orders/Day:</b> {shop.no_of_orders_per_day ?? "N/A"}</p>
      <p><b>Online Order:</b> {shop.online_order ? "Yes" : "No"}</p>
      {shop.online_order && <p><b>Medium:</b> {shop.medium_of_online_orders || "N/A"}</p>}

      <p><b>Visited:</b> {shop.visited ? "Yes" : "No"}</p>
      <p><b>Offers Discount:</b> {shop.offers_discount_regularly ? "Yes" : "No"}</p>
      <p><b>GST Holder:</b> {shop.gst_holder ? "Yes" : "No"}</p>
      <p><b>Billing System:</b> {shop.billing_system ? "Yes" : "No"}</p>
      {shop.billing_system && shop.billing_system_description && <p><i>{shop.billing_system_description}</i></p>}

      <p><b>Inventory Mgmt:</b> {shop.inventory_management ? "Yes" : "No"}</p>
      {shop.inventory_management && shop.inventory_management_description && <p><i>{shop.inventory_management_description}</i></p>}

      <p><b>Distribution:</b> {shop.distribution || "N/A"}</p>
      <p><b>Restocking (days):</b> {shop.restocking_frequency_in_days ?? "N/A"}</p>
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
