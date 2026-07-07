import L from "leaflet";

/**
 * Creates a modern, clean circular marker.
 * Scales perfectly and looks great for data visualization.
 */
export function createPinIcon(color, size = 18) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size + 8}" height="${size + 8}" viewBox="0 0 ${size + 8} ${size + 8}">
      <defs>
        <filter id="shadow-${color.replace('#', '')}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="${(size + 8) / 2}" cy="${(size + 8) / 2}" r="${size / 2}" 
              fill="${color}" stroke="white" stroke-width="2.5" 
              filter="url(#shadow-${color.replace('#', '')})" />
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "custom-svg-pin",
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
    popupAnchor: [0, -((size + 8) / 2)],
  });
}

/**
 * Full color palette designed for clarity and accessibility.
 * Each "Color By" mode gets its own harmonious palette.
 */
export const COLOR_PALETTES = {
  all: {
    label: "All Shops",
    getColor: () => ({ hex: "#3b82f6", name: "Shop" }), // Default blue color
    legend: [
      { color: "#3b82f6", label: "Shop" }
    ]
  },
  willing_to_shelf: {
    label: "Willing to Shelf",
    getColor: (shop) => {
      if (shop.willing_to_shelf === true) return { hex: "#16a34a", name: "Yes" };
      if (shop.willing_to_shelf === false) return { hex: "#dc2626", name: "No" };
      return { hex: "#9ca3af", name: "Unknown" };
    },
    legend: [
      { color: "#16a34a", label: "Willing" },
      { color: "#dc2626", label: "Not Willing" },
      { color: "#9ca3af", label: "Unknown" },
    ]
  },
  category: {
    label: "Category",
    getColor: (shop) => {
      if (shop.category === "Goods") return { hex: "#2563eb", name: "Goods" };
      if (shop.category === "Service") return { hex: "#f59e0b", name: "Service" };
      return { hex: "#9ca3af", name: "N/A" };
    },
    legend: [
      { color: "#2563eb", label: "Goods" },
      { color: "#f59e0b", label: "Service" },
      { color: "#9ca3af", label: "N/A" },
    ]
  },
  model: {
    label: "Model",
    getColor: (shop) => {
      if (shop.model === "Rental") return { hex: "#7c3aed", name: "Rental" };
      if (shop.model === "Commission") return { hex: "#0891b2", name: "Commission" };
      return { hex: "#9ca3af", name: "N/A" };
    },
    legend: [
      { color: "#7c3aed", label: "Rental" },
      { color: "#0891b2", label: "Commission" },
      { color: "#9ca3af", label: "N/A" },
    ]
  },
  visited: {
    label: "Visited Status",
    getColor: (shop) => {
      if (shop.visited === true) return { hex: "#0d9488", name: "Visited" };
      return { hex: "#e11d48", name: "Not Visited" };
    },
    legend: [
      { color: "#0d9488", label: "Visited" },
      { color: "#e11d48", label: "Not Visited" },
    ]
  },
  sub_category: {
    label: "Sub Category",
    getColor: (shop) => {
      const subCat = shop.sub_category || "Unknown";
      // Generate a consistent pseudo-random color based on string
      let hash = 0;
      for (let i = 0; i < subCat.length; i++) {
        hash = subCat.charCodeAt(i) + ((hash << 5) - hash);
      }
      const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
      const hex = "#" + "00000".substring(0, 6 - c.length) + c;
      return { hex: hex, name: subCat };
    },
    // We don't display a static legend for 30+ subcategories because it's too large,
    // but we can list a few common ones or leave it empty so the UI doesn't clutter.
    legend: [
      { color: "#000000", label: "Dynamic Subcategory Colors" } // placeholder
    ]
  }
};
