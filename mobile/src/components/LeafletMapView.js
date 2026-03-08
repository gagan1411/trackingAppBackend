import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * LeafletMapView — Free ESRI Satellite Map (No API Key Required)
 *
 * Props:
 *  - latitude (number): Initial center latitude
 *  - longitude (number): Initial center longitude
 *  - zoom (number): Initial zoom level (default 17)
 *  - markerLat (number|null): Marker latitude
 *  - markerLng (number|null): Marker longitude
 *  - onMapPress (function): Called with { latitude, longitude } when map is tapped
 *  - style (object): Additional style for the WebView container
 *  - mapType (string): 'satellite' | 'street' (default 'satellite')
 */
export default function LeafletMapView({
    latitude = 34.5262,
    longitude = 74.2546,
    zoom = 17,
    markerLat = null,
    markerLng = null,
    onMapPress,
    style,
    mapType = 'satellite',
}) {
    const webViewRef = useRef(null);

    const esriSatellite = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    const esriStreet = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    const tileUrl = mapType === 'satellite' ? esriSatellite : esriStreet;
    const tileAttrib = 'Tiles &copy; Esri &mdash; Source: Esri, USGS, AeroGRID, IGN';

    const markerScript = (markerLat && markerLng)
        ? `
          if (window._marker) { window._marker.remove(); }
          window._marker = L.marker([${markerLat}, ${markerLng}], {
              icon: L.divIcon({
                  html: '<div style="background:#C5A059;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.7);"></div>',
                  iconSize: [18, 18],
                  iconAnchor: [9, 9]
              })
          }).addTo(window._map);
        `
        : `if (window._marker) { window._marker.remove(); window._marker = null; }`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #000; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', {
    center: [${latitude}, ${longitude}],
    zoom: ${zoom},
    zoomControl: true,
    attributionControl: false
  });
  window._map = map;
  window._marker = null;

  L.tileLayer('${tileUrl}', {
    maxZoom: 19,
    attribution: '${tileAttrib}'
  }).addTo(map);

  ${markerScript}

  map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    // Move marker
    if (window._marker) { window._marker.remove(); }
    window._marker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: '<div style="background:#C5A059;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.7);"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      })
    }).addTo(map);

    // Post message to React Native
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_PRESS', lat: lat, lng: lng }));
  });
</script>
</body>
</html>
    `;

    // When props change (e.g. GPS fetched), update map center
    useEffect(() => {
        if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
                window._map.setView([${latitude}, ${longitude}], window._map.getZoom());
                ${markerScript}
                true;
            `);
        }
    }, [latitude, longitude, markerLat, markerLng]);

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MAP_PRESS' && onMapPress) {
                onMapPress({ latitude: data.lat, longitude: data.lng });
            }
        } catch (e) { }
    };

    return (
        <WebView
            ref={webViewRef}
            style={[styles.map, style]}
            source={{ html }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            mixedContentMode="always"
            allowFileAccess={true}
            scrollEnabled={false}
        />
    );
}

const styles = StyleSheet.create({
    map: { flex: 1 },
});
