import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMapEvents } from "react-leaflet";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "./supabaseClient";
import SidePanel from "./SidePanel";
import FilterPanel from "./FilterPanel";
import { getDistanceInKm } from "./utils/geo";
import { createPinIcon, COLOR_PALETTES } from "./utils/markers";
import "./fixLeaflet";
import ZoomTracker from "./ZoomTracker";
import "./MapView.css";

function MapClickHandler({ isRadiusMode, setRadiusCenter, setIsRadiusMode }) {
  useMapEvents({
    click(e) {
      if (isRadiusMode) {
        setRadiusCenter([e.latlng.lat, e.latlng.lng]);
        setIsRadiusMode(false);
      }
    },
  });
  return null;
}

function MapView() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [zoom, setZoom] = useState(13);

  // Filters state
  const [filters, setFilters] = useState({
    colorBy: 'all',
    category: 'All',
    model: 'All',
    willing_to_shelf: false,
    visited: false,
    online_order: false,
    radiusKm: ''
  });

  const [isRadiusMode, setIsRadiusMode] = useState(false);
  const [radiusCenter, setRadiusCenter] = useState(null);

  useEffect(() => {
    async function fetchShops() {
      const { data, error } = await supabase.from("shops").select("*");
      if (error) console.error(error);
      else setShops(data);
    }
    fetchShops();
  }, []);

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      // Attribute filters
      if (filters.category !== 'All' && shop.category !== filters.category) return false;
      if (filters.model !== 'All' && shop.model !== filters.model) return false;
      if (filters.willing_to_shelf && !shop.willing_to_shelf) return false;
      if (filters.visited && !shop.visited) return false;
      if (filters.online_order && !shop.online_order) return false;

      // Spatial radius filter
      if (radiusCenter && filters.radiusKm && !isNaN(filters.radiusKm)) {
        const dist = getDistanceInKm(radiusCenter[0], radiusCenter[1], shop.latitude, shop.longitude);
        if (dist == null || dist > parseFloat(filters.radiusKm)) {
          return false;
        }
      }

      return true;
    });
  }, [shops, filters, radiusCenter]);

  // Determine color logic
  const getColorData = (shop) => {
    const palette = COLOR_PALETTES[filters.colorBy];
    if (palette) {
      const colorInfo = palette.getColor(shop);
      return { icon: createPinIcon(colorInfo.hex), hex: colorInfo.hex };
    }
    return { icon: createPinIcon("#9ca3af"), hex: "#9ca3af" };
  };

  return (
    <div className="map-view-wrapper">
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        isRadiusMode={isRadiusMode}
        setIsRadiusMode={setIsRadiusMode}
        radiusCenter={radiusCenter}
        setRadiusCenter={setRadiusCenter}
        filteredShops={filteredShops}
      />

      <MapContainer
        center={[25.5941, 85.1376]}
        zoom={zoom}
        style={{ height: "100vh", width: "100vw", cursor: isRadiusMode ? 'crosshair' : 'grab' }}
      >
        <ZoomTracker onChange={(z) => setZoom(z)} />
        <MapClickHandler
          isRadiusMode={isRadiusMode}
          setRadiusCenter={setRadiusCenter}
          setIsRadiusMode={setIsRadiusMode}
        />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />

        {/* Draw Radius Circle if active */}
        {radiusCenter && filters.radiusKm && !isNaN(filters.radiusKm) && (
          <Circle
            center={radiusCenter}
            radius={parseFloat(filters.radiusKm) * 1000}
            pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.1, weight: 2 }}
          />
        )}

        {/* Render Radius Center Pin */}
        {radiusCenter && (
          <Marker position={radiusCenter} icon={createPinIcon("#2563eb")}>
            <Popup>Radius Center</Popup>
          </Marker>
        )}

        {/* Render Shops */}
        {filteredShops.map((shop) => {
          const { icon, hex } = getColorData(shop);

          // Tiny dots for zoomed out
          if (zoom < 16) {
            return (
              <CircleMarker
                key={`dot-${shop.id || shop.shop_id}`}
                center={[shop.latitude, shop.longitude]}
                radius={4}
                pathOptions={{ color: hex, fillColor: hex, fillOpacity: 0.8, weight: 1 }}
                eventHandlers={{ click: () => setSelectedShop(shop) }}
              />
            );
          }

          // Rich markers for zoomed in
          return (
            <Marker
              key={`marker-${shop.id || shop.shop_id}`}
              position={[shop.latitude, shop.longitude]}
              icon={icon}
              eventHandlers={{ click: () => setSelectedShop(shop) }}
            >
              <Popup>
                <b>{shop.shop_name}</b>
                <br />
                Category: {shop.category}{shop.sub_category ? ` - ${shop.sub_category}` : ''}<br />
                Model: {shop.model}<br />
                Orders/Day: {shop.no_of_orders_per_day}<br />
                Visited: {shop.visited ? "Yes" : "No"}<br />
                Willing to Shelf: {shop.willing_to_shelf ? "Yes" : "No"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <SidePanel shop={selectedShop} onClose={() => setSelectedShop(null)} />
    </div>
  );
}

export default MapView;
