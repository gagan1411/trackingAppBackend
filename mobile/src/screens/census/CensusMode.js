import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    ImageBackground, StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCensusRecords } from '../../database/db';
import {
    Home, Users, MapPin, Plus, ArrowLeft,
    Shield, X, ChevronRight, Clipboard
} from 'lucide-react-native';

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';
const RED_ACCENT = '#FF4D4D';

export default function CensusMode({ navigation }) {
    const [records, setRecords] = useState([]);

    const fetchRecords = async () => {
        const data = await getCensusRecords();
        setRecords(data);
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchRecords();
        });
        return unsubscribe;
    }, [navigation]);


    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                    <Home size={18} color={GOLD} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.houseLabel}>HOUSE RECORD NO. {item.houseNumber || 'N/A'}</Text>
                    <Text style={styles.headName}>{item.headOfFamily.toUpperCase()}</Text>
                </View>
                <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
            </View>

            <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                    <MapPin size={12} color={GOLD} />
                    <Text style={styles.detailText}>{item.address.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.statPill}>
                    <Users size={12} color={GOLD} />
                    <Text style={styles.pillText}>{item.membersCount} FAMILY MEMBERS</Text>
                </View>
                <Text style={styles.dateText}>{new Date(item.surveyDate).toLocaleDateString()}</Text>
            </View>
        </View>
    );

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
                        <Text style={styles.title}>CENSUS DATABASE</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    {/* Stats Summary Area */}
                    <View style={styles.summaryBar}>
                        <View style={styles.statSummaryItem}>
                            <Text style={styles.summaryValue}>{records.length}</Text>
                            <Text style={styles.summaryLabel}>TOTAL HOUSES SURVEYED</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => navigation.navigate('AddCensusData')}
                        >
                            <Plus size={20} color="#000" />
                            <Text style={styles.addButtonText}>NEW RECORD</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={records}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={<Text style={styles.listLabel}>RECENT SURVEY LOGS</Text>}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Users size={48} color="rgba(255,255,255,0.1)" />
                                <Text style={styles.emptyText}>NO CENSUS DATA LOADED</Text>
                                <Text style={styles.emptySubText}>Initiate a new house survey to populate database.</Text>
                            </View>
                        }
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
        padding: 20, backgroundColor: 'rgba(0,0,0,0.85)',
        borderBottomWidth: 1.5, borderBottomColor: BORDER
    },
    title: { fontSize: 16, fontWeight: 'bold', color: GOLD, letterSpacing: 1.5 },

    summaryBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 25, backgroundColor: 'rgba(0,0,0,0.6)',
        borderBottomWidth: 1, borderBottomColor: BORDER
    },
    statSummaryItem: { flex: 1 },
    summaryValue: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
    summaryLabel: { fontSize: 8, color: GOLD, fontWeight: 'bold', letterSpacing: 1, marginTop: 4 },

    addButton: {
        backgroundColor: GOLD, paddingHorizontal: 20, paddingVertical: 14,
        borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 10,
        shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8
    },
    addButtonText: { color: '#000', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },

    listLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 'bold', letterSpacing: 2, paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
    listContent: { padding: 20, paddingBottom: 60 },

    card: {
        backgroundColor: CARD_BG, borderRadius: 20, padding: 24, marginBottom: 20,
        borderWidth: 1.5, borderColor: BORDER,
        shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 15 },
    iconCircle: {
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER
    },
    houseLabel: { fontSize: 9, color: GOLD, fontWeight: 'bold', letterSpacing: 1 },
    headName: { fontSize: 18, fontWeight: 'bold', color: '#FFF', letterSpacing: 1, marginTop: 4 },

    cardBody: { marginBottom: 20 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    detailText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', letterSpacing: 0.5 },

    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 15, borderTopWidth: 1, borderTopColor: BORDER
    },
    statPill: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(197, 160, 89, 0.1)',
        paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20
    },
    pillText: { fontSize: 10, color: GOLD, fontWeight: 'bold', letterSpacing: 1 },
    dateText: { fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 'bold' },

    emptyContainer: { alignItems: 'center', marginTop: 100, gap: 20 },
    emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 'bold', letterSpacing: 2 },
    emptySubText: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', lineHeight: 20 }
});
