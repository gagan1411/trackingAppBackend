import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ImageBackground, Dimensions, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeafletMapView from '../../components/LeafletMapView';
import {
    ArrowLeft, MapPin, Mountain, User, Hash, Navigation,
    Shield, Clock, Eye
} from 'lucide-react-native';
import galutaPers from '../../../assets/Galuta/GALUTA_filtered_data_with_images.json';
import RNFS from 'react-native-fs';
import { DomUtils, parseDocument } from 'htmlparser2';
// import { imageMap } from "../../../../imagerMap.ts";

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

    const persDisp = galutaPers.filter((item) => {
        console.log(item['House No']?.toString().match(/\d+/)?.[0], props.Name.toString().match(/\d+/)?.[0]);
        if (item['House No']?.toString().match(/\d+/)?.[0] === props.Name.toString().match(/\d+/)?.[0]) {
            return (item
            )
        }
    })

    const document = parseDocument(props.description);
    const images = DomUtils.findAll(
        (elem) => elem.type === "tag" && elem.name === "img",
        document.children
    );

    const imageSources = images.map((img) => img.attribs?.src);

    const italicTag = DomUtils.findOne(
        (elem) => elem.type === "tag" && elem.name === "i",
        document.children
    );

    const name = italicTag ? DomUtils.textContent(italicTag) : "";
    console.log(imageSources);




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
                            <View style={styles.houseCard}>
                                <View style={styles.infoIconBox}>
                                    <Hash size={16} color={GOLD} />
                                </View>
                                <View style={styles.houseText}>
                                    <Text style={styles.houseLabel}>HOUSE NO</Text>
                                    <Text style={styles.houseValue}>{(props.Name || 'N/A').toUpperCase()}</Text>
                                </View>
                            </View>
                            <View key='houseImage' style={styles.houseImageContainer}>
                                {imageSources && imageSources.map((image, index) => (
                                    <Image
                                        key={index}
                                        source={{
                                            uri:
                                                "file://" +
                                                RNFS.DocumentDirectoryPath +
                                                "/Galuta/" +
                                                image,
                                        }}
                                        style={{
                                            width: 200,
                                            height: 200,
                                            borderRadius: 8
                                        }}
                                        resizeMode="contain"
                                    />
                                ))}
                            </View>

                            {/* Person */}
                            {personName && (
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconBox}>
                                        <User size={16} color="#4FC3F7" />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>FAMILY HEAD</Text>
                                        <Text style={styles.infoValue}>{personName.toUpperCase()}</Text>
                                    </View>
                                </View>
                            )}
                            {persDisp && persDisp.map((item, index) => (
                                <View key={index} style={styles.personCard}>
                                    {/* Details on the left */}
                                    <View style={styles.personDetails}>
                                    {Object.entries(item).map(([key, value]) => {
                                        if (key !== "House No" && key !== "imagePath") {
                                        return (
                                            <View key={key} style={styles.personRow}>
                                            <Text style={styles.personLabel}>{key.toUpperCase()}</Text>
                                            <Text style={styles.personValue}>{value}</Text>
                                            </View>
                                        );
                                        }
                                    })}
                                    </View>

                                    {/* Image on the right */}
                                    {item.imagePath && (
                                    <View style={styles.personImageWrapper}>
                                        <Image
                                        source={{
                                            uri: "file://" + RNFS.DocumentDirectoryPath + "/Galuta/persImages/" + item.imagePath,
                                        }}
                                        style={styles.personImage}
                                        resizeMode="cover"
                                        />
                                    </View>
                                    )}
                                </View>
                                ))}

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
    personImageContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10
    },
    personCard: {
        flexDirection: 'row',        // horizontal layout
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        alignItems: 'center',        // vertically center
        justifyContent: 'flex-start', // pack items together
        borderWidth: 1, borderColor: BORDER,
    },

    personDetails: {
        flexShrink: 1,               // shrink to fit content
        paddingRight: 8,             // small space before image
    },
    personRow: {
        marginBottom: 6,
    },
    personLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: 'bold',
    },
    personValue: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: 'bold',
    },

    personImageWrapper: {
        width: 200,
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
        marginLeft: 250,               // reduces the gap from details
    },

    personImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    houseImageContainer: {
        alignItems: 'center',   // center images horizontally
        marginVertical: 12,     // spacing above/below images
        flexDirection: 'row',   // optional if showing multiple images in a row
        flexWrap: 'wrap',       // wrap if more than one image
        justifyContent: 'center',
        gap: 12,                // space between multiple images
    },
    houseCard: {
        flexDirection: 'row',           // row layout: text left, image right
        alignItems: 'center',           // vertically center content
        justifyContent: 'space-between',// text left, image right
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderRadius: 24,
        padding: 16,
        marginVertical: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.15)',
        elevation: 6,                  // shadow for Android
        shadowColor: '#000',           // shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    houseText: {
  flex: 1,                        // take remaining width
  paddingRight: 12,               // spacing from image
},
houseLabel: {
  fontSize: 10,
  fontWeight: 'bold',
  color: 'rgba(255,255,255,0.3)',
  marginBottom: 2,
},
houseValue: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#FFF',
},
houseImage: {
  width: 120,
  height: 120,
  borderRadius: 12,
},
});
