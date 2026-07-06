import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMapEvents } from "react-leaflet";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "./supabaseClient";
import SidePanel from "./SidePanel";
import FilterPanel from "./FilterPanel";
import { getDistanceInKm } from "./utils/geo";
import "./fixLeaflet";
import ZoomTracker from "./ZoomTracker";
import L from "leaflet";
import "./MapView.css";

const statusIcons = {
  ready: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconSize: [20, 30], iconAnchor: [10, 30], popupAnchor: [1, -28],
  }),
  notReady: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [20, 30], iconAnchor: [10, 30], popupAnchor: [1, -28],
  }),
  unknown: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    iconSize: [20, 30], iconAnchor: [10, 30], popupAnchor: [1, -28],
  }),
  blue: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconSize: [20, 30], iconAnchor: [10, 30], popupAnchor: [1, -28],
  }),
  gold: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
    iconSize: [20, 30], iconAnchor: [10, 30], popupAnchor: [1, -28],
  }),
  violet: L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    iconSize: [20, 30], iconAnchor: [10, 30], popupAnchor: [1, -28],
  })
};

const hexColors = {
  green: "#2ecc71",
  red: "#e74c3c",
  grey: "#95a5a6",
  blue: "#3498db",
  gold: "#f1c40f",
  violet: "#9b59b6"
};

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
    colorBy: 'willing_to_shelf',
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
    if (filters.colorBy === 'willing_to_shelf') {
      if (shop.willing_to_shelf === true) return { icon: statusIcons.ready, hex: hexColors.green };
      if (shop.willing_to_shelf === false) return { icon: statusIcons.notReady, hex: hexColors.red };
      return { icon: statusIcons.unknown, hex: hexColors.grey };
    }
    if (filters.colorBy === 'category') {
      if (shop.category === 'Goods') return { icon: statusIcons.blue, hex: hexColors.blue };
      if (shop.category === 'Service') return { icon: statusIcons.gold, hex: hexColors.gold };
      return { icon: statusIcons.unknown, hex: hexColors.grey };
    }
    if (filters.colorBy === 'model') {
      if (shop.model === 'Rental') return { icon: statusIcons.violet, hex: hexColors.violet };
      if (shop.model === 'Commission') return { icon: statusIcons.ready, hex: hexColors.green };
      return { icon: statusIcons.unknown, hex: hexColors.grey };
    }
    if (filters.colorBy === 'visited') {
      if (shop.visited) return { icon: statusIcons.blue, hex: hexColors.blue };
      return { icon: statusIcons.unknown, hex: hexColors.grey };
    }
    return { icon: statusIcons.unknown, hex: hexColors.grey };
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
          <Marker position={radiusCenter} icon={statusIcons.blue}>
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
