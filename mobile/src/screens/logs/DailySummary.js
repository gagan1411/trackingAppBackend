import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator,
    ImageBackground, TouchableOpacity, StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDailyStats } from '../../database/db';
import {
    BarChart3, TrendingUp, AlertTriangle, Users,
    X, Shield, ArrowUpRight, ArrowDownRight, Activity, ArrowLeft
} from 'lucide-react-native';

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';
const RED_ACCENT = '#FF4D4D';
const GREEN_ACCENT = '#8BC34A';

export default function DailySummary({ navigation }) {
    const [stats, setStats] = useState({ entries: 0, exits: 0, inside: 0, alerts: 0 });
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            const data = await getDailyStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);


    if (loading) {
        return (
            <View style={[styles.loadingOverlay, { backgroundColor: DARK }]}>
                <ActivityIndicator size="large" color={GOLD} />
            </View>
        );
    }

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
                        <Text style={styles.headerTitle}>OPERATIONAL SUMMARY</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

                        <View style={styles.summaryCard}>
                            <View style={styles.metaRow}>
                                <Shield color={GOLD} size={14} />
                                <Text style={styles.metaText}>CP-ALPHA | {new Date().toDateString().toUpperCase()}</Text>
                            </View>

                            <View style={styles.mainGrid}>
                                <View style={styles.statBox}>
                                    <View style={[styles.iconCircle, { borderColor: GREEN_ACCENT }]}>
                                        <ArrowUpRight color={GREEN_ACCENT} size={20} />
                                    </View>
                                    <Text style={styles.statLabel}>TOTAL ENTRIES</Text>
                                    <Text style={[styles.statValue, { color: GREEN_ACCENT }]}>{stats.entries}</Text>
                                </View>

                                <View style={styles.statBox}>
                                    <View style={[styles.iconCircle, { borderColor: RED_ACCENT }]}>
                                        <ArrowDownRight color={RED_ACCENT} size={20} />
                                    </View>
                                    <Text style={styles.statLabel}>TOTAL EXITS</Text>
                                    <Text style={[styles.statValue, { color: RED_ACCENT }]}>{stats.exits}</Text>
                                </View>
                            </View>

                            <View style={[styles.wideStat, { borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 25 }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                    <View style={[styles.iconCircle, { borderColor: GOLD }]}>
                                        <Users color={GOLD} size={20} />
                                    </View>
                                    <View>
                                        <Text style={styles.statLabel}>PERSONNEL CURRENTLY INSIDE</Text>
                                        <Text style={[styles.statValue, { fontSize: 32, marginTop: 2 }]}>{stats.inside}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.wideStat, stats.alerts > 0 && styles.alertWideStat]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                                    <View style={[styles.iconCircle, { borderColor: stats.alerts > 0 ? RED_ACCENT : 'rgba(255,255,255,0.1)' }]}>
                                        <AlertTriangle color={stats.alerts > 0 ? RED_ACCENT : 'rgba(255,255,255,0.2)'} size={20} />
                                    </View>
                                    <View>
                                        <Text style={styles.statLabel}>SUSPICIOUS / INCIDENTS</Text>
                                        <Text style={[styles.statValue, { fontSize: 32, color: stats.alerts > 0 ? RED_ACCENT : '#FFF', marginTop: 2 }]}>{stats.alerts}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.sitrepCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                                <Activity color={GOLD} size={16} />
                                <Text style={styles.sitrepTitle}>SITUATION REPORT (SITREP)</Text>
                            </View>
                            <Text style={styles.sitrepText}>
                                CP-ALPHA operations are running under standard protocol.
                                No high-value target alerts triggered.
                                Database synchronization: COMPLETED.
                                All local registers are healthy and up to date.
                            </Text>
                            <View style={styles.sitrepFooter}>
                                <Text style={styles.sitrepFooterText}>AUTO-GENERATED: {new Date().toLocaleTimeString()}</Text>
                            </View>
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
    loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, backgroundColor: 'rgba(0,0,0,0.85)',
        borderBottomWidth: 1.5, borderBottomColor: BORDER
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: GOLD, letterSpacing: 1.5 },

    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 60 },

    summaryCard: {
        backgroundColor: CARD_BG, borderRadius: 25, padding: 30, marginBottom: 20,
        borderWidth: 1.5, borderColor: BORDER,
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 12
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 35, alignSelf: 'center' },
    metaText: { color: GOLD, fontSize: 9, fontWeight: 'bold', letterSpacing: 2 },

    mainGrid: { flexDirection: 'row', gap: 20, marginBottom: 30 },
    statBox: { flex: 1, alignItems: 'center' },
    iconCircle: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.02)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 15, borderWidth: 1
    },
    statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginBottom: 5 },
    statValue: { fontSize: 42, color: '#FFF', fontWeight: 'bold', letterSpacing: -1 },

    wideStat: { marginBottom: 25 },
    alertWideStat: { backgroundColor: 'rgba(255, 77, 77, 0.05)', marginHorizontal: -15, paddingHorizontal: 15, paddingVertical: 15, borderRadius: 15 },

    sitrepCard: {
        backgroundColor: CARD_BG, borderRadius: 25, padding: 25,
        borderWidth: 1.5, borderColor: BORDER, borderLeftWidth: 5, borderLeftColor: GOLD
    },
    sitrepTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },
    sitrepText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 22, fontWeight: '500' },
    sitrepFooter: { marginTop: 20, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 15 },
    sitrepFooterText: { color: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 }
});
