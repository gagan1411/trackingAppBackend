import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    TextInput, ImageBackground, StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCivilians } from '../../database/db';
import {
    Fingerprint, ScanFace, ChevronRight, Search,
    User, MapPin, Shield, X, ArrowLeft
} from 'lucide-react-native';

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';
const INPUT_BG = 'rgba(255,255,255,0.05)';
const RED_ACCENT = '#FF4D4D';

export default function CivilianList({ navigation }) {
    const [civilians, setCivilians] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadCivilians();
        });
        return unsubscribe;
    }, [navigation]);

    const loadCivilians = async () => {
        const data = await getCivilians();
        setCivilians(data);
    };

    const filteredCivilians = civilians.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.mobile && c.mobile.includes(searchQuery))
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BiometricVerify', { civilian: item })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <User color={GOLD} size={24} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name.toUpperCase()}</Text>
                    <View style={styles.villageRow}>
                        <MapPin size={10} color={GOLD} />
                        <Text style={styles.subText}>{item.village.toUpperCase()}</Text>
                    </View>
                </View>
                <View style={styles.iconRow}>
                    {item.fingerprintLinked === 1 && <Fingerprint color={GOLD} size={18} style={{ marginRight: 8 }} />}
                    <ChevronRight color="rgba(255,255,255,0.3)" size={20} />
                </View>
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                    <Shield size={10} color="rgba(255,255,255,0.4)" style={{ marginRight: 4 }} />
                    <Text style={styles.footerText}>ID: {item.idProof}</Text>
                </View>
                <Text style={styles.dateText}>REG: {new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../../images/pages.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safe}>
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <ArrowLeft color={GOLD} size={28} />
                        </TouchableOpacity>
                        <Text style={styles.title}>PERSONNEL VERIFICATION</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <View style={styles.searchBar}>
                        <View style={styles.searchInner}>
                            <Search color="rgba(255,255,255,0.3)" size={20} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="SEARCH BY NAME / VILLAGE / MOBILE"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <View style={styles.countBadge}>
                            <Text style={styles.count}>{filteredCivilians.length} RECORDS</Text>
                        </View>
                    </View>

                    <FlatList
                        data={filteredCivilians}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Text style={styles.emptyText}>NO RECORDS FOUND</Text>
                            </View>
                        }
                        contentContainerStyle={styles.listContent}
                    />
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
        padding: 20, backgroundColor: 'rgba(0,0,0,0.8)',
        borderBottomWidth: 1.5, borderBottomColor: BORDER
    },
    title: { fontSize: 16, fontWeight: 'bold', color: GOLD, letterSpacing: 1.5 },

    searchBar: {
        padding: 20, gap: 12
    },
    searchInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: INPUT_BG,
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1.5,
        borderColor: BORDER,
        height: 55
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: '100%', color: '#FFF', fontSize: 13, fontWeight: 'bold' },

    countBadge: {
        alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
        borderWidth: 1, borderColor: BORDER
    },
    count: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', letterSpacing: 1 },

    listContent: { padding: 20, paddingBottom: 40 },

    card: {
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: BORDER,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatar: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 15, borderWidth: 1, borderColor: BORDER
    },
    info: { flex: 1 },
    name: { fontSize: 15, fontWeight: 'bold', color: '#FFF', letterSpacing: 1 },
    villageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 5 },
    subText: { fontSize: 11, color: GOLD, fontWeight: 'bold', letterSpacing: 0.5 },
    iconRow: { flexDirection: 'row', alignItems: 'center' },

    cardFooter: {
        borderTopWidth: 1, borderTopColor: BORDER,
        paddingTop: 15, flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center'
    },
    footerItem: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
    footerText: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 'bold', letterSpacing: 0.5 },
    dateText: { fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 'bold' },

    empty: { marginTop: 100, alignItems: 'center' },
    emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 'bold', letterSpacing: 2 }
});
