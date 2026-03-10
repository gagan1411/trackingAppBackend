import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ImageBackground, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeafletMapView from '../../components/LeafletMapView';
import {
    ArrowLeft, MapPin, Mountain, User, Hash, Navigation,
    Shield, Clock, Eye
} from 'lucide-react-native';
import { galutaPers } from '../../../assets/Galuta/GALUTA_filtered_data_with_images.json';

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';

// Parse HTML description to extract person name
function extractPersonName(html) {
    if (!html) return null;
    const match = html.match(/<i>(.*?)<\/i>/);
    return match ? match[1].trim() : null;
}

// Count images in description
function countImages(html) {
    if (!html) return 0;
    const matches = html.match(/<img /g);
    return matches ? matches.length : 0;
}

export default function LandmarkDetail({ navigation, route }) {
    const { feature } = route.params;
    const props = feature.properties;
    const coords = feature.geometry.coordinates;
    const lng = coords[0];
    const lat = coords[1];
    const altitude = coords[2];

    const personName = extractPersonName(props.description);
    const imageCount = countImages(props.description);

    // Determine the type of landmark based on name
    const getLandmarkType = (name) => {
        if (!name) return 'UNKNOWN';
        const n = name.toUpperCase();
        if (n.includes('MASJID')) return 'MOSQUE';
        if (n.includes('SCHOOL')) return 'SCHOOL';
        if (n.includes('KABRISTAN')) return 'CEMETERY';
        if (n.includes('BUNKER')) return 'MILITARY';
        if (n.includes('OP')) return 'OBSERVATION POST';
        if (n.includes('PHC')) return 'HEALTH CENTER';
        if (n.includes('CHAKKI')) return 'UTILITY';
        if (n.startsWith('G/')) return 'RESIDENCE';
        return 'LANDMARK';
    };

    const landmarkType = getLandmarkType(props.Name);

    const getTypeColor = (type) => {
        switch (type) {
            case 'RESIDENCE': return '#4FC3F7';
            case 'MOSQUE': return '#8BC34A';
            case 'SCHOOL': return '#FF9800';
            case 'CEMETERY': return '#9E9E9E';
            case 'MILITARY': return '#FF5252';
            case 'OBSERVATION POST': return '#FF7043';
            case 'HEALTH CENTER': return '#66BB6A';
            case 'UTILITY': return '#AB47BC';
            default: return GOLD;
        }
    };

    const typeColor = getTypeColor(landmarkType);

    // const persDisp = galutaPers.filter((item) => {
    //     if (item.Name === props.Name) {
    //         return (item
    //         )
    //     }
    // })
    console.log(galutaPers);




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
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <ArrowLeft color={GOLD} size={24} />
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <Text style={styles.headerSubtitle}>INTEL DOSSIER</Text>
                            <Text style={styles.headerTitle} numberOfLines={1}>{(props.Name || 'UNKNOWN').toUpperCase()}</Text>
                        </View>
                        <View style={{ width: 44 }} />
                    </View>

                    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

                        {/* Mini Map */}
                        {/* <View style={styles.mapFrame}>
                            <LeafletMapView
                                style={styles.map}
                                latitude={lat}
                                longitude={lng}
                                zoom={17}
                                markers={[{ lat, lng, label: props.Name, color: typeColor }]}
                                mapType="satellite"
                                fitBounds={false}
                            />
                            <View style={[styles.typeBadge, { backgroundColor: typeColor + '22', borderColor: typeColor + '66' }]}>
                                <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
                                <Text style={[styles.typeBadgeText, { color: typeColor }]}>{landmarkType}</Text>
                            </View>
                        </View> */}


                        {/* Primary Info Card */}
                        <View style={styles.infoCard}>
                            <View style={styles.cardHeader}>
                                <Shield color={GOLD} size={14} />
                                <Text style={styles.cardHeaderText}>LOCATION DETAILS</Text>
                            </View>

                            <View style={styles.divider} />

                            {/* Name */}
                            <View style={styles.infoRow}>
                                <View style={styles.infoIconBox}>
                                    <Hash size={16} color={GOLD} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>DESIGNATION</Text>
                                    <Text style={styles.infoValue}>{(props.Name || 'N/A').toUpperCase()}</Text>
                                </View>
                            </View>

                            {/* Person */}
                            {personName && (
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconBox}>
                                        <User size={16} color="#4FC3F7" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>OCCUPANT / CONTACT</Text>
                                        <Text style={styles.infoValue}>{personName.toUpperCase()}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Altitude */}
                            {/* {altitude != null && (
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconBox}>
                                        <Mountain size={16} color="#8BC34A" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>ALTITUDE</Text>
                                        <Text style={styles.infoValue}>{altitude.toFixed(0)} M ASL</Text>
                                    </View>
                                </View>
                            )} */}

                            {/* Image count */}
                            {/* {imageCount > 0 && (
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconBox}>
                                        <Navigation size={16} color="#AB47BC" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>FIELD PHOTOS ON RECORD</Text>
                                        <Text style={styles.infoValue}>{imageCount} IMAGES CAPTURED</Text>
                                    </View>
                                </View>
                            )} */}
                        </View>

                        {/* Coordinates Detail Card */}
                        <View style={styles.coordsCard}>
                            <View style={styles.cardHeader}>
                                <Navigation color={GOLD} size={14} />
                                <Text style={styles.cardHeaderText}>GRID REFERENCE</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.coordsGrid}>
                                <View style={styles.coordItem}>
                                    <Text style={styles.coordLabel}>LAT</Text>
                                    <Text style={styles.coordValue}>{lat.toFixed(7)}</Text>
                                </View>
                                <View style={[styles.coordItem, styles.coordItemCenter]}>
                                    <Text style={styles.coordLabel}>LONG</Text>
                                    <Text style={styles.coordValue}>{lng.toFixed(7)}</Text>
                                </View>
                                <View style={styles.coordItem}>
                                    <Text style={styles.coordLabel}>ALT</Text>
                                    <Text style={styles.coordValue}>{altitude ? `${altitude.toFixed(0)}m` : 'N/A'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Visibility & Meta */}
                        {/* <View style={styles.metaCard}>
                            <View style={styles.cardHeader}>
                                <Clock color={GOLD} size={14} />
                                <Text style={styles.cardHeaderText}>RECORD METADATA</Text>
                            </View>
                            <View style={styles.divider} />

                            <View style={styles.metaGrid}>
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaLabel}>VISIBILITY</Text>
                                    <View style={[styles.statusDot, { backgroundColor: props.visibility === 1 ? '#8BC34A' : '#FF5252' }]} />
                                    <Text style={styles.metaValue}>{props.visibility === 1 ? 'VISIBLE' : 'HIDDEN'}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaLabel}>TESSELLATE</Text>
                                    <Text style={styles.metaValue}>{props.tessellate === -1 ? 'YES' : 'NO'}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaLabel}>EXTRUDE</Text>
                                    <Text style={styles.metaValue}>{props.extrude === 0 ? 'NO' : 'YES'}</Text>
                                </View>
                            </View>
                        </View> */}

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
        flexDirection: 'row', alignItems: 'center',
        padding: 16, paddingTop: 12,
        backgroundColor: 'rgba(0,0,0,0.9)',
        borderBottomWidth: 1.5, borderBottomColor: BORDER,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: BORDER,
        justifyContent: 'center', alignItems: 'center',
    },
    headerCenter: { flex: 1, marginLeft: 14 },
    headerSubtitle: {
        fontSize: 9, color: 'rgba(255,255,255,0.3)',
        fontWeight: 'bold', letterSpacing: 2, marginBottom: 3,
    },
    headerTitle: {
        fontSize: 18, fontWeight: 'bold', color: GOLD, letterSpacing: 1,
    },

    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 60 },

    // Map
    mapFrame: {
        height: 260, margin: 16, marginBottom: 12,
        borderRadius: 24, overflow: 'hidden',
        borderWidth: 1.5, borderColor: BORDER,
        elevation: 12, shadowColor: '#000',
    },
    map: { width: '100%', height: '100%' },
    typeBadge: {
        position: 'absolute', top: 16, left: 16,
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 10, borderWidth: 1, gap: 6,
    },
    typeDot: { width: 8, height: 8, borderRadius: 4 },
    typeBadgeText: {
        fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5,
    },

    // Info Card
    infoCard: {
        marginHorizontal: 16, marginBottom: 12,
        backgroundColor: CARD_BG, borderRadius: 24,
        padding: 22, borderWidth: 1.5, borderColor: BORDER,
        elevation: 8, shadowColor: '#000',
    },
    cardHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14,
    },
    cardHeaderText: {
        fontSize: 10, fontWeight: 'bold', color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5,
    },
    divider: {
        height: 1, backgroundColor: BORDER, marginBottom: 18,
    },

    infoRow: {
        flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20,
    },
    infoIconBox: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: BORDER,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14,
    },
    infoContent: { flex: 1 },
    infoLabel: {
        fontSize: 9, fontWeight: 'bold', color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1.5, marginBottom: 4,
    },
    infoValue: {
        fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5,
    },
    infoValueMono: {
        fontSize: 14, fontWeight: 'bold', color: '#FFF',
        letterSpacing: 1, fontFamily: 'monospace',
    },

    typeTagRow: { flexDirection: 'row', marginTop: 2 },
    typeTag: {
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: 8, borderWidth: 1,
    },
    typeTagText: {
        fontSize: 11, fontWeight: 'bold', letterSpacing: 1,
    },

    // Coords Card
    coordsCard: {
        marginHorizontal: 16, marginBottom: 12,
        backgroundColor: CARD_BG, borderRadius: 24,
        padding: 22, borderWidth: 1.5, borderColor: BORDER,
        elevation: 8, shadowColor: '#000',
    },
    coordsGrid: {
        flexDirection: 'row', justifyContent: 'space-between',
    },
    coordItem: { flex: 1, alignItems: 'center' },
    coordItemCenter: {
        borderLeftWidth: 1, borderRightWidth: 1, borderColor: BORDER,
    },
    coordLabel: {
        fontSize: 9, fontWeight: 'bold', color: 'rgba(255,255,255,0.3)',
        letterSpacing: 2, marginBottom: 6,
    },
    coordValue: {
        fontSize: 15, fontWeight: 'bold', color: GOLD, letterSpacing: 0.5,
        fontFamily: 'monospace',
    },

    // Meta Card
    metaCard: {
        marginHorizontal: 16, marginBottom: 12,
        backgroundColor: CARD_BG, borderRadius: 24,
        padding: 22, borderWidth: 1.5, borderColor: BORDER,
        elevation: 8, shadowColor: '#000',
    },
    metaGrid: {
        flexDirection: 'row', justifyContent: 'space-around',
    },
    metaItem: { alignItems: 'center', gap: 6 },
    metaLabel: {
        fontSize: 9, fontWeight: 'bold', color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1.5,
    },
    metaValue: {
        fontSize: 13, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
});
