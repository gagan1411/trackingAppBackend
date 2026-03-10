import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Alert, ActivityIndicator, FlatList, Keyboard,
    ImageBackground, StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeafletMapView from '../../components/LeafletMapView';
import {
    Download, CheckCircle, Map as MapIcon,
    Search, Globe, X, Compass, Layers, Shield, ArrowLeft
} from 'lucide-react-native';
import galuta from "../../../assets/Galuta/GalutaLandmarks.json";

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';
const INPUT_BG = 'rgba(255,255,255,0.05)';
const GREEN_ACCENT = '#8BC34A';

export default function OfflineMap({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [mapType, setMapType] = useState('satellite');

    const [downloadedMaps, setDownloadedMaps] = useState([
        { id: 1, name: 'KUPWARA SECTOR A', size: '12.4 MB', date: '2024-02-20' },
        { id: 2, name: 'HANDWARA MAIN', size: '8.1 MB', date: '2024-02-18' }
    ]);

    // Patrol / checkpoint markers across the region
    // const PATROL_POINTS = [
    //     { lat: 34.5262, lng: 74.2546, label: 'HQ KUPWARA', color: '#C5A059' },
    //     { lat: 34.3920, lng: 74.3140, label: 'CP HANDWARA', color: '#4FC3F7' },
    //     { lat: 34.0900, lng: 74.7970, label: 'BASE SRINAGAR', color: '#8BC34A' },
    //     { lat: 34.4400, lng: 74.1500, label: 'OP TANGDHAR', color: '#FF7043' },
    //     { lat: 34.5800, lng: 74.3500, label: 'FP KERAN', color: '#FF7043' },
    //     { lat: 34.6500, lng: 74.1800, label: 'TEETWAL POST', color: '#FF7043' },
    //     { lat: 34.2950, lng: 74.6200, label: 'PATROL ALPHA', color: '#4FC3F7' },
    //     { lat: 34.1600, lng: 74.4300, label: 'PATROL BRAVO', color: '#4FC3F7' },
    // ];

    const PATROL_POINTS = galuta.features.map((feature) => ({
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        label: feature.properties.Name,
    }));

    const [region, setRegion] = useState({
        latitude: 34.35,
        longitude: 74.35,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length > 2) {
                fetchSuggestions(searchQuery);
            } else {
                setSuggestions([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchSuggestions = async (query) => {
        const runTask = async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
                    {
                        headers: {
                            'User-Agent': 'TrackingApp_CensusModule/1.0',
                            'Accept-Language': 'en'
                        }
                    }
                );
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setSuggestions(data || []);
            } catch (error) {
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        };
        setTimeout(runTask, 0);
    };

    const handleSelectSuggestion = (item) => {
        const newCoords = {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        };
        setRegion(newCoords);
        setSearchQuery(item.display_name.split(',')[0].toUpperCase());
        setSuggestions([]);
        Keyboard.dismiss();
    };

    const handleDownload = () => {
        if (!searchQuery) {
            Alert.alert('Selection Required', 'Please specify a target region or village.');
            return;
        }

        setIsDownloading(true);
        setDownloadProgress(0);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 0.1;
            setDownloadProgress(progress);
            if (progress >= 1) {
                clearInterval(interval);
                setIsDownloading(false);
                const newMap = {
                    id: Date.now(),
                    name: searchQuery,
                    size: (Math.random() * 10 + 5).toFixed(1) + ' MB',
                    date: new Date().toISOString().split('T')[0]
                };
                setDownloadedMaps([newMap, ...downloadedMaps]);
                Alert.alert('✅ Intelligence Downloaded', `${searchQuery} map tiles are now available for offline tactical use.`);
            }
        }, 300);
    };

    return (
        <ImageBackground
            source={require('../../images/pages.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safe}>
                <View style={styles.overlay}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <ArrowLeft color={GOLD} size={28} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>TACTICAL MAP ENGINE</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                        <View style={styles.searchCard}>
                            <View style={styles.metaRow}>
                                <Shield color={GOLD} size={14} />
                                <Text style={styles.metaText}>VILLAGE INTELLIGENCE DOWNLOADER</Text>
                                <TouchableOpacity
                                    style={styles.mapTypeToggle}
                                    onPress={() => setMapType(mapType === 'satellite' ? 'standard' : 'satellite')}
                                >
                                    <Layers size={16} color={GOLD} />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.inputWrapper, suggestions.length > 0 && styles.inputWithSuggestions]}>
                                <Search size={18} color="rgba(255,255,255,0.3)" style={{ marginHorizontal: 15 }} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="SEARCH VILLAGE OR LANDMARK..."
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {isSearching && <ActivityIndicator size="small" color={GOLD} style={{ marginRight: 15 }} />}
                            </View>

                            {suggestions.length > 0 && (
                                <View style={styles.suggestionsList}>
                                    {suggestions.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.suggestionItem}
                                            onPress={() => handleSelectSuggestion(item)}
                                        >
                                            <MapIcon size={14} color={GOLD} style={{ marginRight: 12 }} />
                                            <Text style={styles.suggestionText} numberOfLines={1}>{item.display_name.toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.downloadBtn, (isDownloading || !searchQuery) && styles.disabledBtn]}
                                onPress={handleDownload}
                                disabled={isDownloading || !searchQuery}
                            >
                                {isDownloading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <>
                                        <Download size={20} color="#000" />
                                        <Text style={styles.downloadBtnText}>CACHE TARGET REGION</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {isDownloading && (
                                <View style={styles.progressBox}>
                                    <View style={[styles.progressBar, { width: `${downloadProgress * 100}%` }]} />
                                    <Text style={styles.progressLabel}>{Math.round(downloadProgress * 100)}% ENCRYPTING TILES</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.mapFrame}>
                            <LeafletMapView
                                style={styles.map}
                                latitude={region.latitude}
                                longitude={region.longitude}
                                zoom={10}
                                markers={PATROL_POINTS}
                                markerLat={region.latitude}
                                markerLng={region.longitude}
                                mapType={mapType === 'satellite' ? 'satellite' : 'street'}
                                onMarkerPress={({ index }) => {
                                    const feature = galuta.features[index];
                                    if (feature) {
                                        navigation.navigate('LandmarkDetail', { feature });
                                    }
                                }}
                            />
                            <View style={styles.mapBadge}>
                                <Text style={styles.badgeText}>{mapType.toUpperCase()} FEED</Text>
                            </View>
                        </View>

                        <View style={styles.librarySection}>
                            <View style={styles.sectionHeader}>
                                <Globe size={16} color={GOLD} />
                                <Text style={styles.sectionTitle}>OFFLINE INTELLIGENCE LIBRARY</Text>
                            </View>

                            {downloadedMaps.length > 0 ? (
                                downloadedMaps.map(map => (
                                    <View key={map.id} style={styles.mapCard}>
                                        <View style={styles.mapIconBox}>
                                            <MapIcon size={20} color={GOLD} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.mapName}>{map.name}</Text>
                                            <Text style={styles.mapMeta}>{map.size} • OFFLINE READY</Text>
                                        </View>
                                        <CheckCircle size={18} color={GREEN_ACCENT} />
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>NO DATA CACHED</Text>
                                </View>
                            )}
                        </View>

                    </ScrollView>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    safe: { flex: 1 },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, backgroundColor: 'rgba(0,0,0,0.85)',
        borderBottomWidth: 1.5, borderBottomColor: BORDER
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: GOLD, letterSpacing: 1.5 },

    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 60 },

    searchCard: {
        padding: 25, backgroundColor: 'rgba(0,0,0,0.85)',
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        borderBottomWidth: 1.5, borderBottomColor: BORDER,
        elevation: 10, shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 15
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
    metaText: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 'bold', letterSpacing: 1, flex: 1 },
    mapTypeToggle: { padding: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, borderWidth: 1, borderColor: BORDER },

    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: INPUT_BG, borderRadius: 15,
        height: 60, borderWidth: 1.5, borderColor: BORDER
    },
    inputWithSuggestions: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 1, borderBottomColor: BORDER },
    input: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },

    suggestionsList: {
        backgroundColor: 'rgba(0,0,0,0.95)', borderBottomLeftRadius: 15, borderBottomRightRadius: 15,
        borderWidth: 1.5, borderColor: BORDER, borderTopWidth: 0, overflow: 'hidden'
    },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: BORDER },
    suggestionText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },

    downloadBtn: {
        backgroundColor: GOLD, flexDirection: 'row', height: 60, borderRadius: 30,
        alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 12,
        shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10
    },
    disabledBtn: { backgroundColor: 'rgba(197, 160, 89, 0.2)', opacity: 0.5 },
    downloadBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },

    progressBox: { marginTop: 20, height: 35, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: BORDER },
    progressBar: { height: '100%', backgroundColor: GREEN_ACCENT, opacity: 0.3 },
    progressLabel: { position: 'absolute', width: '100%', textAlign: 'center', fontSize: 9, fontWeight: 'bold', color: GREEN_ACCENT, top: 10, letterSpacing: 1 },

    mapFrame: {
        height: 400, margin: 20, borderRadius: 30, overflow: 'hidden',
        borderWidth: 1.5, borderColor: BORDER, elevation: 12, shadowColor: "#000"
    },
    map: { width: '100%', height: '100%' },
    mapBadge: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: BORDER },
    badgeText: { color: GOLD, fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5 },

    librarySection: { padding: 25 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    sectionTitle: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5 },

    mapCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: CARD_BG,
        padding: 20, borderRadius: 20, marginBottom: 15,
        borderWidth: 1.5, borderColor: BORDER, gap: 15
    },
    mapIconBox: {
        width: 45, height: 45, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER
    },
    mapName: { fontSize: 15, fontWeight: 'bold', color: '#FFF', letterSpacing: 1 },
    mapMeta: { fontSize: 9, color: GOLD, fontWeight: 'bold', marginTop: 4, letterSpacing: 1 },

    emptyContainer: { padding: 40, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, borderStyle: 'dotted', borderWidth: 1.5, borderColor: BORDER },
    emptyText: { color: 'rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 }
});
