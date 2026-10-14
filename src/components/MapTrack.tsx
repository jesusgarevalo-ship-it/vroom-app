import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { WebView } from 'react-native-webview'

const COLORS = {
  voltBlue: '#0066FF',
  ignitionYellow: '#FFD600',
  background: '#0a0a0f',
  surface: '#0d1420',
}

const { width, height } = Dimensions.get('window')

interface MapTrackProps {
  driverLat: number
  driverLng: number
  destLat: number
  destLng: number
}

const MAP_HTML = (driverLat: number, driverLng: number, destLat: number, destLng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
    body { background: #0d1420; }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-control-zoom { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([${(driverLat + destLat) / 2}, ${(driverLng + destLng) / 2}], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    const driverIcon = L.divIcon({
      html: '<div style="background:#0066FF;width:24px;height:24px;border-radius:50%;border:3px solid #FFD600;display:flex;align-items:center;justify-content:center;font-size:12px;">🛵</div>',
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const destIcon = L.divIcon({
      html: '<div style="background:#FFD600;width:24px;height:24px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:12px;">📍</div>',
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const driverMarker = L.marker([${driverLat}, ${driverLng}], { icon: driverIcon }).addTo(map);
    const destMarker = L.marker([${destLat}, ${destLng}], { icon: destIcon }).addTo(map);

    const routeLine = L.polyline([], { color: '#0066FF', weight: 4, opacity: 0.8 }).addTo(map);

    // Simple direct route line
    routeLine.setLatLngs([
      [${driverLat}, ${driverLng}],
      [${destLat}, ${destLng}]
    ]);

    function updateDriver(lat, lng) {
      driverMarker.setLatLng([lat, lng]);
      routeLine.setLatLngs([
        [lat, lng],
        [${destLat}, ${destLng}]
      ]);
    }

    window.updateDriver = updateDriver;
  </script>
</body>
</html>
`

export function MapTrack({ driverLat, driverLng, destLat, destLng }: MapTrackProps) {
  const webViewRef = useRef<WebView>(null)

  const updateDriver = (lat: number, lng: number) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `if(window.updateDriver) window.updateDriver(${lat}, ${lng});`
      )
    }
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: MAP_HTML(driverLat, driverLng, destLat, destLng) }}
        style={styles.webview}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={() => {}}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    alignSelf: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
})