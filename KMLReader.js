import React, { useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DOMParser } from "xmldom";

const KMLReader = () => {
  const [kmlData, setKmlData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [detailed, setDetailed] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => parseKML(e.target.result);
      reader.readAsText(file);
    }
  };

  const parseKML = (kmlText) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, "text/xml");
    const placemarks = xmlDoc.getElementsByTagName("Placemark");
    let elements = { Point: 0, LineString: 0, Polygon: 0 };
    let details = [];

    let parsedData = [];
    for (let i = 0; i < placemarks.length; i++) {
      let placemark = placemarks[i];
      let name = placemark.getElementsByTagName("name")[0]?.textContent || `Placemark ${i + 1}`;
      let coordinates;

      if (placemark.getElementsByTagName("Point").length > 0) {
        coordinates = placemark.getElementsByTagName("coordinates")[0].textContent.trim().split(",");
        parsedData.push({ type: "Point", name, coordinates: [parseFloat(coordinates[1]), parseFloat(coordinates[0])] });
        elements.Point++;
      }

      if (placemark.getElementsByTagName("LineString").length > 0) {
        coordinates = placemark.getElementsByTagName("coordinates")[0].textContent.trim().split(" ").map(coord => {
          const [lng, lat] = coord.split(",");
          return [parseFloat(lat), parseFloat(lng)];
        });
        parsedData.push({ type: "LineString", name, coordinates });
        elements.LineString++;
        details.push({ type: "LineString", length: coordinates.length });
      }
    }

    setKmlData(parsedData);
    setSummary(elements);
    setDetailed(details);
  };

  return (
    <div>
      <h2>KML File Reader</h2>
      <input type="file" accept=".kml" onChange={handleFileUpload} />
      <button onClick={() => alert(JSON.stringify(summary, null, 2))}>Summary</button>
      <button onClick={() => alert(JSON.stringify(detailed, null, 2))}>Detailed</button>

      <MapContainer center={[20, 78]} zoom={5} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {kmlData &&
          kmlData.map((item, index) => {
            if (item.type === "Point") {
              return (
                <Marker key={index} position={item.coordinates}>
                  <Popup>{item.name}</Popup>
                </Marker>
              );
            }
            if (item.type === "LineString") {
              return <Polyline key={index} positions={item.coordinates} color="blue" />;
            }
            return null;
          })}
      </MapContainer>
    </div>
  );
};

export default KMLReader;
