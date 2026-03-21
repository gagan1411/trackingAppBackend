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
 *  - markerLat (number|null): Single marker latitude (legacy)
 *  - markerLng (number|null): Single marker longitude (legacy)
 *  - markers (array): Array of { lat, lng, label, color? } for multiple points
 *  - onMapPress (function): Called with { latitude, longitude } when map is tapped
 *  - onMarkerPress (function): Called with { index, lat, lng, label } when a marker is tapped
 *  - style (object): Additional style for the WebView container
 *  - mapType (string): 'satellite' | 'street' (default 'satellite')
 *  - fitBounds (boolean): Auto-fit map to show all markers (default true when markers provided)
 */
export default function LeafletMapView({
    latitude = 34.5262,
    longitude = 74.2546,
    zoom = 17,
    markerLat = null,
    markerLng = null,
    markers = [],
    onMapPress,
    onMarkerPress,
    style,
    mapType = 'satellite',
    fitBounds = true,
}) {
    const webViewRef = useRef(null);

    const esriSatellite = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    const esriStreet = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    const tileUrl = mapType === 'satellite' ? esriSatellite : esriStreet;
    const tileAttrib = 'Tiles &copy; Esri &mdash; Source: Esri, USGS, AeroGRID, IGN';

    // Build multi-marker JS
    const markersJSON = JSON.stringify(markers);
    const multiMarkerScript = `
      // Clear previous markers
      if (window._markers) {
        window._markers.forEach(function(m) { m.remove(); });
      }
      window._markers = [];

      var markersData = ${markersJSON};

      if (markersData.length > 0) {
        var bounds = [];
        markersData.forEach(function(pt, idx) {
          var color = pt.color || '#C5A059';
          var pulseColor = color;
          var marker = L.marker([pt.lat, pt.lng], {
            icon: L.divIcon({
              className: '',
              html: '<div style="position:relative;">' +
                '<div style="position:absolute;top:-6px;left:-6px;width:24px;height:24px;border-radius:50%;background:' + color + ';opacity:0.25;animation:pulse 2s infinite;"></div>' +
                '<div style="background:' + color + ';width:14px;height:14px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 10px ' + color + ',0 0 20px rgba(0,0,0,0.5);"></div>' +
              '</div>',
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            })
          }).addTo(window._map);

          if (pt.label) {
            marker.bindTooltip(pt.label, {
              permanent: true,
              direction: 'top',
              offset: [0, -12],
              className: 'marker-tooltip'
            });
          }

          // Marker click handler
          (function(markerIdx, markerPt) {
            marker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MARKER_PRESS',
                index: markerIdx,
                lat: markerPt.lat,
                lng: markerPt.lng,
                label: markerPt.label || ''
              }));
            });
          })(idx, pt);

          window._markers.push(marker);
          bounds.push([pt.lat, pt.lng]);
        });

        ${fitBounds ? `
        if (bounds.length > 1) {
          window._map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        } else if (bounds.length === 1) {
          window._map.setView(bounds[0], ${zoom});
        }
        ` : ''}
      }
    `;

    // Legacy single-marker support
    const singleMarkerScript = (markerLat && markerLng)
        ? `
          if (window._singleMarker) { window._singleMarker.remove(); }
          window._singleMarker = L.marker([${markerLat}, ${markerLng}], {
              icon: L.divIcon({
                  className: '',
                  html: '<div style="background:#C5A059;width:14px;height:14px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 10px #C5A059,0 0 20px rgba(0,0,0,0.5);"></div>',
                  iconSize: [14, 14],
                  iconAnchor: [7, 7]
              })
          }).addTo(window._map);
        `
        : `if (window._singleMarker) { window._singleMarker.remove(); window._singleMarker = null; }`;

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
    html, body, #map { width: 100%; height: 100%; background: #0B0F14; }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(2.2); opacity: 0; }
      100% { transform: scale(1); opacity: 0; }
    }

    .marker-tooltip {
      background: rgba(11, 15, 20, 0.92) !important;
      color: #C5A059 !important;
      border: 1px solid rgba(197, 160, 89, 0.4) !important;
      border-radius: 6px !important;
      padding: 4px 10px !important;
      font-size: 10px !important;
      font-weight: bold !important;
      letter-spacing: 1px !important;
      text-transform: uppercase !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
      white-space: nowrap !important;
    }
    .marker-tooltip::before {
      border-top-color: rgba(197, 160, 89, 0.4) !important;
    }

    .leaflet-control-zoom a {
      background: rgba(11, 15, 20, 0.9) !important;
      color: #C5A059 !important;
      border-color: rgba(197, 160, 89, 0.3) !important;
    }
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
  window._singleMarker = null;
  window._markers = [];

  L.tileLayer('${tileUrl}', {
    maxZoom: 19,
    attribution: '${tileAttrib}'
  }).addTo(map);

  ${multiMarkerScript}
  ${singleMarkerScript}

  map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_PRESS', lat: lat, lng: lng }));
  });
</script>
</body>
</html>
    `;

    // When props change, update map view and markers
    useEffect(() => {
        if (webViewRef.current) {
            const updateScript = markers.length > 0
                ? multiMarkerScript
                : `
                    window._map.setView([${latitude}, ${longitude}], window._map.getZoom());
                    ${singleMarkerScript}
                  `;
            webViewRef.current.injectJavaScript(updateScript + '\ntrue;');
        }
    }, [latitude, longitude, markerLat, markerLng, JSON.stringify(markers)]);

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MAP_PRESS' && onMapPress) {
                onMapPress({ latitude: data.lat, longitude: data.lng });
            }
            if (data.type === 'MARKER_PRESS' && onMarkerPress) {
                onMarkerPress({ index: data.index, lat: data.lat, lng: data.lng, label: data.label });
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
