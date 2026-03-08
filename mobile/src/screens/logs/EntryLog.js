import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    Alert, ActivityIndicator, ImageBackground, StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEntryLogs, markEntryComplete } from '../../database/db';
import {
    Users, Car, CheckCircle, Clock, Shield,
    ArrowLeftRight, X, ChevronRight, MapPin, ArrowLeft
} from 'lucide-react-native';

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';
const INPUT_BG = 'rgba(255,255,255,0.05)';
const RED_ACCENT = '#FF4D4D';
const GREEN_ACCENT = '#8BC34A';

export default function EntryLog({ navigation }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await getEntryLogs();
            setLogs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsub = navigation.addListener('focus', loadLogs);
        return unsub;
    }, [navigation]);


    const handleMarkComplete = (entry) => {
        Alert.alert(
            'Mark Exit / Complete',
            `Confirm exit for ${entry.name}?` + (entry.vehicleNumber ? `\nVehicle: ${entry.vehicleNumber}` : ''),
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm Exit',
                    style: 'destructive',
                    onPress: async () => {
                        await markEntryComplete(entry.id);
                        loadLogs();
                    }
                }
            ]
        );
    };

    const filteredLogs = logs.filter(l => {
        if (filter === 'pending') return l.completed === 0;
        if (filter === 'completed') return l.completed === 1;
        return true;
    });

    const pendingCount = logs.filter(l => l.completed === 0).length;

    const renderItem = ({ item }) => {
        const entryTime = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const entryDate = new Date(item.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' });
        const exitTime = item.exitTimestamp
            ? new Date(item.exitTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            : null;

        return (
            <View style={[styles.card, item.completed && styles.cardCompleted]}>
                <View style={styles.cardTop}>
                    <View style={styles.statusDot}>
                        {item.completed
                            ? <CheckCircle color={GREEN_ACCENT} size={20} />
                            : <Clock color={GOLD} size={20} />}
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.personName}>{item.name.toUpperCase()}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
                            <MapPin size={10} color={GOLD} />
                            <Text style={styles.village}>{item.village.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>{entryDate.toUpperCase()}</Text>
                        <Text style={styles.timeValue}>{entryTime}</Text>
                    </View>
                </View>

                {/* Vehicle Row */}
                {item.vehicleNumber ? (
                    <View style={styles.vehicleRow}>
                        <Car color={GOLD} size={14} />
                        <Text style={styles.vehicleText}>{item.vehicleNumber.toUpperCase()}</Text>
                    </View>
                ) : null}

                {/* Entry / Exit Timeline */}
                <View style={styles.timeline}>
                    <View style={styles.timelineItem}>
                        <ArrowLeftRight color={GOLD} size={12} />
                        <Text style={styles.timelineLabel}>ENTRY</Text>
                        <Text style={styles.timelineValue}>{entryTime}</Text>
                    </View>
                    <View style={[styles.timelineItem, { opacity: item.completed ? 1 : 0.3 }]}>
                        <X color={item.completed ? RED_ACCENT : 'rgba(255,255,255,0.2)'} size={12} />
                        <Text style={styles.timelineLabel}>EXIT</Text>
                        <Text style={styles.timelineValue}>{exitTime || '---'}</Text>
                    </View>
                </View>

                {/* Action */}
                {!item.completed && (
                    <TouchableOpacity style={styles.exitBtn} onPress={() => handleMarkComplete(item)}>
                        <CheckCircle color="#000" size={16} />
                        <Text style={styles.exitBtnText}>MARK EXIT / COMPLETE</Text>
                    </TouchableOpacity>
                )}

                {item.completed && (
                    <View style={styles.completedBadge}>
                        <CheckCircle color={GREEN_ACCENT} size={14} />
                        <Text style={styles.completedText}>SECURELY CLEARED</Text>
                    </View>
                )}
            </View>
        );
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
                        <Text style={styles.headerTitle}>ENTRY / EXIT RECORDS</Text>
                        {pendingCount > 0 ? (
                            <View style={styles.pendingBadge}>
                                <Text style={styles.pendingCount}>{pendingCount} PENDING</Text>
                            </View>
                        ) : <View style={{ width: 28 }} />}
                    </View>

                    {/* Filter Tabs */}
                    <View style={styles.filterRow}>
                        {['all', 'pending', 'completed'].map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterTab, filter === f && styles.filterTabActive]}
                                onPress={() => setFilter(f)}
                            >
                                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                    {f.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {loading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator color={GOLD} size="large" />
                        </View>
                    ) : (
                        <FlatList
                            data={filteredLogs}
                            keyExtractor={item => item.id.toString()}
                            renderItem={renderItem}
                            contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                            ListEmptyComponent={
                                <View style={styles.emptyBox}>
                                    <Users color="rgba(255,255,255,0.1)" size={64} />
                                    <Text style={styles.emptyText}>NO OPERATIONAL RECORDS FOUND</Text>
                                </View>
                            }
                        />
                    )}
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
        padding: 20, backgroundColor: 'rgba(0,0,0,0.85)',
        borderBottomWidth: 1.5, borderBottomColor: BORDER, gap: 12
    },
    headerTitle: { flex: 1, color: GOLD, fontWeight: 'bold', fontSize: 16, letterSpacing: 1.5 },
    pendingBadge: {
        backgroundColor: RED_ACCENT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12
    },
    pendingCount: { color: '#000', fontWeight: 'bold', fontSize: 9, letterSpacing: 1 },

    filterRow: {
        flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: BORDER
    },
    filterTab: {
        flex: 1, paddingVertical: 10, borderRadius: 10,
        alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1, borderColor: BORDER
    },
    filterTabActive: { backgroundColor: GOLD, borderColor: GOLD },
    filterText: { color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontSize: 10, letterSpacing: 1 },
    filterTextActive: { color: '#000' },

    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    card: {
        backgroundColor: CARD_BG, borderRadius: 20,
        padding: 24, marginBottom: 16,
        borderWidth: 1.5, borderColor: BORDER,
        shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8
    },
    cardCompleted: { opacity: 0.8 },

    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    statusDot: { marginRight: 15 },
    cardInfo: { flex: 1 },
    personName: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
    village: { color: GOLD, fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
    timeBadge: { alignItems: 'flex-end' },
    timeText: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
    timeValue: { color: '#FFF', fontWeight: 'bold', fontSize: 14, marginTop: 2 },

    vehicleRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: 'rgba(197, 160, 89, 0.1)', padding: 12, borderRadius: 10,
        marginBottom: 15, borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.2)'
    },
    vehicleText: { color: GOLD, fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },

    timeline: {
        flexDirection: 'row', gap: 16,
        paddingTop: 15, borderTopWidth: 1, borderTopColor: BORDER, marginBottom: 15
    },
    timelineItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    timelineLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
    timelineValue: { color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', fontSize: 12 },

    exitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: GOLD, padding: 16, borderRadius: 12,
        gap: 10, shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5
    },
    exitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 12, letterSpacing: 1.5 },

    completedBadge: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: 5
    },
    completedText: { color: GREEN_ACCENT, fontWeight: 'bold', fontSize: 11, letterSpacing: 2 },

    emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100, gap: 20 },
    emptyText: { color: 'rgba(255,255,255,0.1)', fontSize: 14, fontWeight: 'bold', letterSpacing: 2, textAlign: 'center' },
});
