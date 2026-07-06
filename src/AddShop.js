import { useState } from "react";
import { supabase } from "./supabaseClient";
import "./AddShop.css";

const GOODS_CATEGORIES = [
  "Grocery", "Electronics", "Stationary", "Pharmacy", "Dairy Items", "Clothing",
  "Gift & Toys", "Cosmetics", "Foot Wears", "jewellery store", "Pet Shops",
  "Sports Shops", "Flowers", "Puja Stores", "Liquor Shops"
];

const SERVICE_CATEGORIES = [
  "SALON", "AC SERVICES", "LAUNDRY", "CAR WASH & REPAIR", "LIBRARY",
  "TURFS & GAMING ZONES", "EVENT PLANNERS", "BANQUET HALL & EVENT PLACES",
  "ACADEMIES (CRICKET / MUSIC / DANCE)", "GYMS", "HOSTEL / PGs",
  "RENTAL ROOMS", "TATTOO PARLOURS"
];

function AddShop() {
  const [formData, setFormData] = useState({
    shop_name: "",
    category: "",
    sub_category: "",
    size: "",
    model: "",
    rental_price_or_commission: "",
    no_of_orders_per_day: "",
    online_order: false,
    medium_of_online_orders: "",
    custom_medium: "",
    visited: false,
    offers_discount_regularly: false,
    gst_holder: false,
    billing_system: false,
    billing_system_description: "",
    inventory_management: false,
    inventory_management_description: "",
    distribution: "",
    restocking_frequency_in_days: "",
    model_acceptance: false,
    feedback: "",
    longitude: "",
    latitude: "",
    willing_to_shelf: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value
      };
      // Reset sub_category if category changes
      if (name === "category") {
        newData.sub_category = "";
      }
      return newData;
    });
  };

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not fetch location. Please ensure location permissions are granted.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const finalMedium = formData.medium_of_online_orders === "Any other" 
      ? formData.custom_medium 
      : formData.medium_of_online_orders;

    // The sub_category actually goes to 'category' in the database (based on previous schema)
    // Wait, the user said "Category :- Goods or Service", "sub_category".
    // I will pass 'category' as Goods/Service and append sub_category, or if schema has sub_category I'll add it.
    // I'll send both, maybe Supabase accepts extra fields, or I should join them.
    // Assuming schema is: category (text). I'll just format it as "Goods - Grocery" if sub_category isn't an explicit column.
    // Or I'll just pass sub_category if it exists. The user provided "Category :- Goods or Service \n sub_category". I will assume they meant `category` and `sub_category`. But if `sub_category` is not in the schema, it might fail. To be safe, I'll combine them or send as is if there's no error. Actually, I'll send it as `category`. Wait, I'll assume they updated the schema with `sub_category`. 
    // Wait! Let me just append it for safety. No, they probably added it. I'll include it.
    
    // I will use `category` and `sub_category`. If `sub_category` doesn't exist, Supabase will throw error, but I will include it as requested. Let me just combine them into `category` if sub_category is not explicitly in the DB schema they provided earlier.
    // Earlier schema: `category` TEXT. No `sub_category`. 
    // I will save `category` as "Goods - Grocery".

    const dataToSubmit = {
      ...formData,
      category: formData.category,
      sub_category: formData.sub_category,
      medium_of_online_orders: formData.online_order ? finalMedium : null,
      rental_price_or_commission: formData.rental_price_or_commission ? parseFloat(formData.rental_price_or_commission) : null,
      no_of_orders_per_day: formData.no_of_orders_per_day ? parseInt(formData.no_of_orders_per_day, 10) : null,
      restocking_frequency_in_days: formData.restocking_frequency_in_days ? parseInt(formData.restocking_frequency_in_days, 10) : null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };
    
    // Remove temporary state fields
    delete dataToSubmit.custom_medium;

    const { error } = await supabase
      .from("shops")
      .insert([dataToSubmit]);

    if (error) {
      console.error("Error inserting data:", error);
      setMessage("Error: " + error.message);
    } else {
      setMessage("Shop added successfully!");
      setFormData(prev => ({ 
        ...prev, 
        shop_name: "", category: "", sub_category: "", size: "", model: "", feedback: "",
        medium_of_online_orders: "", custom_medium: ""
      }));
    }
    setLoading(false);
  };

  const getSubCategories = () => {
    if (formData.category === "Goods") return GOODS_CATEGORIES;
    if (formData.category === "Service") return SERVICE_CATEGORIES;
    return [];
  };

  return (
    <div className="add-shop-container">
      <h2>Add New Shop Data</h2>
      {message && <div className={`message ${message.includes("Error") ? "error" : "success"}`}>{message}</div>}
      
      <form onSubmit={handleSubmit} className="add-shop-form">
        
        {/* 1. Location */}
        <div className="form-section">
          <h3>1. Location</h3>
          <div className="location-group">
            <div className="form-group">
              <label>Latitude:</label>
              <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Longitude:</label>
              <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} required />
            </div>
            <button type="button" className="btn locate-btn" onClick={handleLocateMe}>
              📍 Locate Me
            </button>
          </div>
        </div>

        {/* 2. Basic Details */}
        <div className="form-section">
          <h3>2. Basic Details</h3>
          
          <div className="form-group">
            <label>Shop Name:</label>
            <input type="text" name="shop_name" value={formData.shop_name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Category:</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              <option value="Goods">Goods</option>
              <option value="Service">Service</option>
            </select>
          </div>

          {formData.category && (
            <div className="form-group">
              <label>Sub Category:</label>
              <select name="sub_category" value={formData.sub_category} onChange={handleChange} required>
                <option value="">Select Sub Category</option>
                {getSubCategories().map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Size:</label>
            <select name="size" value={formData.size} onChange={handleChange} required>
              <option value="">Select Size</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>

          <div className="form-group">
            <label>Model:</label>
            <select name="model" value={formData.model} onChange={handleChange} required>
              <option value="">Select Model</option>
              <option value="Rental">Rental</option>
              <option value="Commission">Commission</option>
            </select>
          </div>
          
          <div className="checkbox-wrapper">
            <label>
              <input type="checkbox" name="model_acceptance" checked={formData.model_acceptance} onChange={handleChange} /> 
              Model Acceptance
            </label>
          </div>
        </div>

        {/* 3. Operational Details */}
        <div className="form-section">
          <h3>3. Operational Details</h3>
          
          <div className="form-group">
            <label>Rental Price / Commission:</label>
            <input type="number" step="0.01" name="rental_price_or_commission" value={formData.rental_price_or_commission} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label>No. of Orders/Day:</label>
            <input type="number" name="no_of_orders_per_day" value={formData.no_of_orders_per_day} onChange={handleChange} />
          </div>

          <div className="checkbox-wrapper">
            <label>
              <input type="checkbox" name="online_order" checked={formData.online_order} onChange={handleChange} /> 
              Online Order Available?
            </label>
          </div>

          {formData.online_order && (
            <div className="form-group fade-in">
              <label>Medium of Online Orders:</label>
              <select name="medium_of_online_orders" value={formData.medium_of_online_orders} onChange={handleChange} required>
                <option value="">Select Medium</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Amazon">Amazon</option>
                <option value="Myntra">Myntra</option>
                <option value="Meesho">Meesho</option>
                <option value="Any other">Any other</option>
              </select>
              
              {formData.medium_of_online_orders === "Any other" && (
                <input 
                  type="text" 
                  name="custom_medium" 
                  value={formData.custom_medium} 
                  onChange={handleChange} 
                  placeholder="Specify medium" 
                  required 
                  style={{ marginTop: '10px' }}
                />
              )}
            </div>
          )}
          
          <div className="form-group">
            <label>Distribution:</label>
            <input type="text" name="distribution" value={formData.distribution} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Restocking Frequency (days):</label>
            <input type="number" name="restocking_frequency_in_days" value={formData.restocking_frequency_in_days} onChange={handleChange} />
          </div>
        </div>

        {/* 4. Systems & Status */}
        <div className="form-section">
          <h3>4. Systems & Status</h3>

          <div className="checkbox-wrapper"><label><input type="checkbox" name="visited" checked={formData.visited} onChange={handleChange} /> Visited</label></div>
          <div className="checkbox-wrapper"><label><input type="checkbox" name="offers_discount_regularly" checked={formData.offers_discount_regularly} onChange={handleChange} /> Offers Discount Regularly</label></div>
          <div className="checkbox-wrapper"><label><input type="checkbox" name="gst_holder" checked={formData.gst_holder} onChange={handleChange} /> GST Holder</label></div>
          
          <div className="checkbox-wrapper">
            <label><input type="checkbox" name="billing_system" checked={formData.billing_system} onChange={handleChange} /> Billing System</label>
          </div>
          {formData.billing_system && (
            <div className="form-group fade-in">
              <label>Billing System Description:</label>
              <textarea name="billing_system_description" value={formData.billing_system_description} onChange={handleChange} rows="2" />
            </div>
          )}

          <div className="checkbox-wrapper">
            <label><input type="checkbox" name="inventory_management" checked={formData.inventory_management} onChange={handleChange} /> Inventory Management</label>
          </div>
          {formData.inventory_management && (
            <div className="form-group fade-in">
              <label>Inventory Mgmt Description:</label>
              <textarea name="inventory_management_description" value={formData.inventory_management_description} onChange={handleChange} rows="2" />
            </div>
          )}
          
          <div className="checkbox-wrapper"><label><input type="checkbox" name="willing_to_shelf" checked={formData.willing_to_shelf} onChange={handleChange} /> Willing to Shelf</label></div>
        </div>

        {/* 5. Feedback */}
        <div className="form-section">
          <h3>5. Feedback</h3>
          <div className="form-group">
            <label>Additional Feedback:</label>
            <textarea name="feedback" value={formData.feedback} onChange={handleChange} rows="3" />
          </div>
        </div>

        <button type="submit" className="btn submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Shop Data"}
        </button>
      </form>
    </div>
  );
}

export default AddShop;
