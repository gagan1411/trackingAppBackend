import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet, ImageBackground,
    TouchableOpacity, StatusBar as RNStatusBar, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLocalMovements, getEntryLogs, syncDailyEntryLogsToLocal } from '../database/db';
import api from '../services/api';
import {
    CheckCircle, Clock, Truck, User, ArrowLeft,
    ArrowRightLeft, FileText, X, Navigation
} from 'lucide-react-native';

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';
const RED_ACCENT = '#FF4D4D';

export default function MovementList({ navigation }) {
    const [movements, setMovements] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadMovements = async () => {
        const vehicleData = await getLocalMovements();
        const civilianData = await getEntryLogs();

        const combined = [
            ...vehicleData.map(v => ({ ...v, logType: 'vehicle', displayDate: v.date })),
            ...civilianData.map(c => ({ ...c, logType: 'civilian', displayDate: c.timestamp }))
        ].sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate));

        setMovements(combined);
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadMovements();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Aggressively natively pull today's strict logs universally from Central Command MongoDB!
            const logResp = await api.get('/logs/today');
            if (logResp.data && logResp.data.length > 0) {
                await syncDailyEntryLogsToLocal(logResp.data);
            }
        } catch (err) {
            console.warn("Global Sync Failed mathematically", err.message);
        }
        await loadMovements();
        setRefreshing(false);
    };


    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerTitleRow}>
                    <View style={styles.iconCircle}>
                        {item.logType === 'vehicle' ? <Truck size={18} color={GOLD} /> : <User size={18} color={GOLD} />}
                    </View>
                    <View>
                        <Text style={styles.vehicle}>{item.logType === 'vehicle' ? item.vehicleNumber : item.name.toUpperCase()}</Text>
                        <Text style={styles.logCategory}>{item.logType === 'vehicle' ? 'TACTICAL VEHICLE' : 'PERSONNEL ENTRY'}</Text>
                    </View>
                </View>
                <View style={styles.syncStatus}>
                    {item.synced === 1 ? (
                        <CheckCircle size={14} color="#8BC34A" />
                    ) : (
                        <Clock size={14} color={GOLD} />
                    )}
                </View>
            </View>

            <View style={styles.cardBody}>
                {item.logType === 'vehicle' ? (
                    <View style={styles.routeContainer}>
                        <View style={styles.routePoint}>
                            <Text style={styles.routeLabel}>ORIGIN</Text>
                            <Text style={styles.routeValue}>{item.fromLocation}</Text>
                        </View>
                        <ArrowRightLeft size={16} color="rgba(255,255,255,0.1)" style={{ marginHorizontal: 15 }} />
                        <View style={styles.routePoint}>
                            <Text style={styles.routeLabel}>DESTINATION</Text>
                            <Text style={styles.routeValue}>{item.toLocation}</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.civRow}>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeTag}>{(item.type || 'UNKNOWN').toUpperCase()}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Navigation size={10} color={GOLD} />
                            <Text style={styles.villageText}>{(item.village || 'UNKNOWN').toUpperCase()}</Text>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.driverText}>{item.logType === 'vehicle' ? `OPERATOR: ${item.driverName}` : 'VERIFIED: SYSTEM'}</Text>
                <Text style={styles.dateText}>{new Date(item.displayDate).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</Text>
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={require('../images/pages.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safe}>
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <ArrowLeft color={GOLD} size={28} />
                        </TouchableOpacity>
                        <Text style={styles.title}>OPERATIONAL LOGS</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <FlatList
                        data={movements}
                        keyExtractor={(item) => item.syncId || Math.random().toString()}
                        renderItem={renderItem}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />
                        }
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Text style={styles.emptyText}>NO OPERATIONAL RECORDS</Text>
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
        padding: 20, backgroundColor: 'rgba(0,0,0,0.85)',
        borderBottomWidth: 1.5, borderBottomColor: BORDER
    },
    title: { fontSize: 16, fontWeight: 'bold', color: GOLD, letterSpacing: 1.5 },

    listContent: { padding: 20, paddingBottom: 40 },

    card: {
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: BORDER,
        shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 15, borderWidth: 1, borderColor: BORDER
    },
    vehicle: { fontSize: 16, fontWeight: 'bold', color: '#FFF', letterSpacing: 1 },
    logCategory: { fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 'bold', letterSpacing: 1, marginTop: 4 },

    syncStatus: { padding: 4 },

    cardBody: { marginBottom: 20 },
    routeContainer: { flexDirection: 'row', alignItems: 'center' },
    routePoint: { flex: 1 },
    routeLabel: { fontSize: 8, color: GOLD, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
    routeValue: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' },

    civRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    typeBadge: { backgroundColor: 'rgba(139,195,74,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(139,195,74,0.2)' },
    typeTag: { color: '#8BC34A', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    villageText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' },

    cardFooter: {
        borderTopWidth: 1, borderTopColor: BORDER,
        paddingTop: 15, flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center'
    },
    driverText: { fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 'bold', letterSpacing: 1 },
    dateText: { fontSize: 10, color: GOLD, fontWeight: 'bold' },

    empty: { marginTop: 100, alignItems: 'center' },
    emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 'bold', letterSpacing: 2 }
});
