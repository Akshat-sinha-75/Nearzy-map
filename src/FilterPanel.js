import React from 'react';
import './FilterPanel.css';

function FilterPanel({ 
  filters, 
  setFilters, 
  isRadiusMode, 
  setIsRadiusMode,
  radiusCenter,
  setRadiusCenter
}) {

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const clearRadius = () => {
    setRadiusCenter(null);
    setFilters(prev => ({ ...prev, radiusKm: '' }));
    setIsRadiusMode(false);
  };

  return (
    <div className="filter-panel">
      <h3>Data Filters</h3>

      <div className="filter-group">
        <label>Color By:</label>
        <select name="colorBy" value={filters.colorBy} onChange={handleFilterChange}>
          <option value="category">Category</option>
          <option value="model">Model (Rental/Commission)</option>
          <option value="willing_to_shelf">Willing to Shelf</option>
          <option value="visited">Visited Status</option>
        </select>
      </div>

      <div className="filter-divider" />

      <div className="filter-group">
        <label>Category:</label>
        <select name="category" value={filters.category} onChange={(e) => {
          // When category changes, reset sub_category to 'All'
          handleFilterChange(e);
          setFilters(prev => ({ ...prev, sub_category: 'All' }));
        }}>
          <option value="All">All</option>
          <option value="Goods">Goods</option>
          <option value="Service">Service</option>
        </select>
      </div>

      {filters.category !== 'All' && (
        <div className="filter-group">
          <label>Sub Category:</label>
          <select name="sub_category" value={filters.sub_category} onChange={handleFilterChange}>
            <option value="All">All</option>
            {filters.category === 'Goods' ? (
              <>
                <option value="Grocery">Grocery</option>
                <option value="Electronics">Electronics</option>
                <option value="Stationary">Stationary</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Dairy Items">Dairy Items</option>
                <option value="Clothing">Clothing</option>
                <option value="Gift & Toys">Gift & Toys</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Foot Wears">Foot Wears</option>
                <option value="jewellery store">jewellery store</option>
                <option value="Pet Shops">Pet Shops</option>
                <option value="Sports Shops">Sports Shops</option>
                <option value="Flowers">Flowers</option>
                <option value="Puja Stores">Puja Stores</option>
                <option value="Liquor Shops">Liquor Shops</option>
              </>
            ) : (
              <>
                <option value="SALON">SALON</option>
                <option value="AC SERVICES">AC SERVICES</option>
                <option value="LAUNDRY">LAUNDRY</option>
                <option value="CAR WASH & REPAIR">CAR WASH & REPAIR</option>
                <option value="LIBRARY">LIBRARY</option>
                <option value="TURFS & GAMING ZONES">TURFS & GAMING ZONES</option>
                <option value="EVENT PLANNERS">EVENT PLANNERS</option>
                <option value="BANQUET HALL & EVENT PLACES">BANQUET HALL & EVENT PLACES</option>
                <option value="ACADEMIES (CRICKET / MUSIC / DANCE)">ACADEMIES (CRICKET / MUSIC / DANCE)</option>
                <option value="GYMS">GYMS</option>
                <option value="HOSTEL / PGs">HOSTEL / PGs</option>
                <option value="RENTAL ROOMS">RENTAL ROOMS</option>
                <option value="TATTOO PARLOURS">TATTOO PARLOURS</option>
              </>
            )}
          </select>
        </div>
      )}

      <div className="filter-group">
        <label>Model:</label>
        <select name="model" value={filters.model} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="Rental">Rental</option>
          <option value="Commission">Commission</option>
        </select>
      </div>

      <div className="filter-group checkboxes">
        <label className="checkbox-label">
          <input type="checkbox" name="willing_to_shelf" checked={filters.willing_to_shelf} onChange={handleFilterChange} />
          Willing to Shelf Only
        </label>
        <label className="checkbox-label">
          <input type="checkbox" name="visited" checked={filters.visited} onChange={handleFilterChange} />
          Visited Only
        </label>
        <label className="checkbox-label">
          <input type="checkbox" name="online_order" checked={filters.online_order} onChange={handleFilterChange} />
          Accepts Online Orders
        </label>
      </div>

      <div className="filter-divider" />

      <div className="radius-control">
        <h4>Spatial Filter</h4>
        {!radiusCenter ? (
          <button 
            className={`btn-radius toggle ${isRadiusMode ? 'active' : ''}`}
            onClick={() => setIsRadiusMode(!isRadiusMode)}
          >
            {isRadiusMode ? 'Click on map to select center...' : 'Set Radius Center (Click Map)'}
          </button>
        ) : (
          <div className="radius-active">
            <div className="filter-group">
              <label>Radius (km):</label>
              <input 
                type="number" 
                step="0.1" 
                min="0.1"
                name="radiusKm" 
                value={filters.radiusKm} 
                onChange={handleFilterChange} 
                placeholder="e.g. 3"
              />
            </div>
            <button className="btn-radius clear" onClick={clearRadius}>
              Clear Radius Filter
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default FilterPanel;
