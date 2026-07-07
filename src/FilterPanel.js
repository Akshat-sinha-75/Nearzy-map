import React from 'react';
import './FilterPanel.css';
import { COLOR_PALETTES } from './utils/markers';

function FilterPanel({ 
  filters, 
  setFilters, 
  isRadiusMode, 
  setIsRadiusMode,
  radiusCenter,
  setRadiusCenter,
  filteredShops
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

  const clearAllFilters = () => {
    setFilters(prev => ({
      ...prev,
      colorBy: 'all',
      category: 'All',
      sub_category: 'All',
      model: 'All',
      willing_to_shelf: false,
      visited: false,
      online_order: false,
      radiusKm: ''
    }));
    setRadiusCenter(null);
    setIsRadiusMode(false);
  };

  const currentPalette = COLOR_PALETTES[filters.colorBy];

  // Dynamically generate legend with counts
  const legendItems = {};
  if (currentPalette && filteredShops) {
    filteredShops.forEach(shop => {
      const { hex, name } = currentPalette.getColor(shop);
      if (!legendItems[name]) {
        legendItems[name] = { color: hex, label: name, count: 0 };
      }
      legendItems[name].count++;
    });
  }
  const sortedLegend = Object.values(legendItems).sort((a, b) => b.count - a.count);

  return (
    <div className="filter-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Data Filters</h3>
        <button 
          onClick={clearAllFilters} 
          style={{
            background: 'none', border: 'none', color: 'var(--accent-primary)', 
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0
          }}
        >
          Clear All
        </button>
      </div>

      <div className="filter-group">
        <label>Color By:</label>
        <select name="colorBy" value={filters.colorBy} onChange={handleFilterChange}>
          <option value="all">All (Default)</option>
          <option value="sub_category">Sub Category</option>
          <option value="willing_to_shelf">Willing to Shelf</option>
          <option value="category">Category</option>
          <option value="model">Model (Rental/Commission)</option>
          <option value="visited">Visited Status</option>
        </select>
      </div>
      
      {sortedLegend.length > 0 && (
        <div className="legend-container">
          <div className="legend-header" style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px'}}>
            Showing counts for {filteredShops.length} matching shops
          </div>
          {sortedLegend.map(item => (
            <div key={item.label} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: item.color }}></span>
              <span className="legend-label">
                {item.label} <span style={{fontWeight: 600, marginLeft: '4px', color: 'var(--text-main)'}}>({item.count})</span>
              </span>
            </div>
          ))}
        </div>
      )}

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
