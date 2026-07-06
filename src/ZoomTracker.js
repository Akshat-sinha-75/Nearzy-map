import { useMap } from "react-leaflet";
import { useEffect } from "react";

function ZoomTracker({ onChange }) {
  const map = useMap();

  useEffect(() => {
    const handler = () => {
      onChange(map.getZoom());
    };

    map.on("zoomend", handler);
    return () => map.off("zoomend", handler);
  }, [map, onChange]);

  return null;
}

export default ZoomTracker;
