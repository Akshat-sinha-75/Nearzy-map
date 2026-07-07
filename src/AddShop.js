import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import { supabase } from "./supabaseClient";
import "./AddShop.css";
import "./fixLeaflet";

function MapCenterUpdater({ setLocation, isDragging, setIsDragging }) {
  const map = useMapEvents({
    dragstart: () => {
      setIsDragging(true);
    },
    dragend: () => {
      setIsDragging(false);
      const center = map.getCenter();
      setLocation(center.lat, center.lng);
    },
    zoomend: () => {
      const center = map.getCenter();
      setLocation(center.lat, center.lng);
    }
  });

  return null;
}

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

  const [isDragging, setIsDragging] = useState(false);
  const [mapKey, setMapKey] = useState(1); // Force map re-render on "Locate Me"

  const setLocation = (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords.latitude, position.coords.longitude);
          setMapKey(k => k + 1); // This forces the MapContainer to re-center
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
          <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '10px', marginTop: '-10px'}}>
            Drag the map to precisely place the crosshair on the shop's location.
          </p>
          
          <div className="map-picker-container" style={{ position: "relative", height: "300px", width: "100%", marginBottom: "15px", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
            <MapContainer
              key={mapKey}
              center={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : [25.5941, 85.1376]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
              />
              <MapCenterUpdater 
                setLocation={setLocation} 
                isDragging={isDragging}
                setIsDragging={setIsDragging}
              />
            </MapContainer>
            
            {/* Center Crosshair Overlay */}
            <div className={`center-crosshair ${isDragging ? 'dragging' : ''}`} 
                 style={{
                   position: 'absolute', top: '50%', left: '50%', 
                   transform: `translate(-50%, ${isDragging ? '-100%' : '-50%'})`,
                   transition: 'transform 0.2s ease',
                   pointerEvents: 'none', zIndex: 1000,
                   display: 'flex', flexDirection: 'column', alignItems: 'center'
                 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <div style={{
                width: '4px', height: '4px', background: '#e11d48', borderRadius: '50%',
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                opacity: isDragging ? 0 : 1, transition: 'opacity 0.2s ease'
              }}/>
            </div>
            
            {/* Small shadow to indicate point */}
            <div style={{
               position: 'absolute', top: '50%', left: '50%', 
               width: '12px', height: '6px', background: 'rgba(0,0,0,0.3)',
               borderRadius: '50%', transform: 'translate(-50%, -50%)',
               filter: 'blur(2px)', pointerEvents: 'none', zIndex: 999,
               opacity: isDragging ? 0.8 : 0, transition: 'opacity 0.2s ease'
            }}/>
          </div>

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
