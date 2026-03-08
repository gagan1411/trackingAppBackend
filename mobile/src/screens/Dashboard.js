import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ImageBackground, StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    UserPlus, Fingerprint, Map, FileText, AlertCircle,
    LogOut, RefreshCcw, Wifi, WifiOff, Clock, Search,
    Car, ShieldAlert, ClipboardList, Shield, Contact,
    Calendar, Files, FileBarChart, PieChart, LayoutDashboard,
    ArrowLeft, Clipboard
} from 'lucide-react-native';
import { getUnsyncedMovements, getDailyStats } from '../database/db';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';
const RED_ACCENT = '#FF4D4D';

export default function Dashboard({ navigation, setIsAuthenticated }) {
    const [stats, setStats] = useState({ entries: 0, exits: 0, inside: 0, alerts: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [operator, setOperator] = useState('OPERATOR');

    const refreshData = async () => {
        try {
            const dailyStats = await getDailyStats();
            setStats(dailyStats);
        } catch (e) {
            console.log('Error refreshing data:', e);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const unsubFocus = navigation.addListener('focus', refreshData);

        SecureStore.getItemAsync('operator').then(op => { if (op) setOperator(op.toUpperCase()); });
        refreshData();

        return () => { clearInterval(timer); unsubFocus(); };
    }, [navigation]);


    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('operator');
        setIsAuthenticated(false);
    };

    const fTime = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const fDate = d => d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

    return (
        <ImageBackground
            source={require('../images/pages.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safe}>
                <View style={styles.overlay}>
                    {/* Status Bar */}
                    <View style={styles.statusBar}>
                        <View style={styles.headerTop}>
                            <View>
                                <Text style={styles.headerDate}>{fDate(currentTime)}</Text>
                                <Text style={styles.headerTime}>{fTime(currentTime)}</Text>
                            </View>
                            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtnTop}>
                                <LogOut color={RED_ACCENT} size={24} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ alignItems: 'center', marginTop: 10 }}>
                            <Text style={styles.unitName}>BEMISAAL RAKSHAK</Text>
                            <Text style={styles.cpName}>OPERATIONAL DASHBOARD</Text>
                        </View>
                    </View>

                    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                        {/* Tactical Grid Panel */}
                        <View style={styles.tacticalPanel}>
                            <View style={styles.gridRow}>
                                <DashboardIcon
                                    label="Register New"
                                    icon={<Contact size={32} color="#4A90E2" />}
                                    onPress={() => navigation.navigate('RegisterCivilian')}
                                />
                                <DashboardIcon
                                    label="Biometric Auth"
                                    icon={<Fingerprint size={32} color="#FF4081" />}
                                    onPress={() => navigation.navigate('BiometricVerify')}
                                />
                                <DashboardIcon
                                    label="Movement Log"
                                    icon={<Calendar size={32} color="#9E9E9E" />}
                                    onPress={() => navigation.navigate('EntryLog')}
                                />
                            </View>
                            <View style={styles.gridRow}>
                                <DashboardIcon
                                    label="Census Mode"
                                    icon={<Files size={32} color="#90A4AE" />}
                                    onPress={() => navigation.navigate('CensusMode')}
                                />
                                <DashboardIcon
                                    label="Village Map"
                                    icon={<Map size={32} color={GOLD} />}
                                    onPress={() => navigation.navigate('OfflineMap')}
                                />
                                <DashboardIcon
                                    label="Daily Summary"
                                    icon={<PieChart size={32} color="#FF7043" />}
                                    onPress={() => navigation.navigate('DailySummary')}
                                />
                            </View>
                        </View>

                        {/* Summary Status Panel */}
                        <View style={styles.panel}>
                            <Text style={styles.panelTitle}>OPERATIONAL SUMMARY — {fDate(currentTime)}</Text>
                            <View style={styles.statsRow}>
                                <StatBlock label="ENTRIES" value={stats.entries} color={GOLD} />
                                <StatBlock label="INSIDE" value={stats.inside} color="#FFF" divider />
                                <StatBlock
                                    label="FLAGGED" value={stats.alerts}
                                    color={stats.alerts > 0 ? RED_ACCENT : 'rgba(255,255,255,0.3)'}
                                    divider
                                />
                            </View>
                        </View>

                        {/* Secondary Quick Actions */}
                        <View style={styles.secondaryContainer}>
                            <TouchableOpacity
                                style={[styles.secondaryAction, { borderColor: RED_ACCENT }]}
                                onPress={() => navigation.navigate('ReportAlert')}
                            >
                                <ShieldAlert color={RED_ACCENT} size={20} />
                                <Text style={[styles.secondaryText, { color: RED_ACCENT }]}>INCIDENT REPORT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.secondaryAction}
                                onPress={() => navigation.navigate('MovementList')}
                            >
                                <Car color={GOLD} size={20} />
                                <Text style={styles.secondaryText}>VEHICLE LOGS</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Shield color={GOLD} size={16} />
                            <Text style={styles.operatorText}>OPERATOR: <Text style={{ color: GOLD, fontWeight: 'bold' }}>{operator}</Text></Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const StatBlock = ({ label, value, color, divider }) => (
    <View style={[styles.statBlock, divider && styles.statDivider]}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const DashboardIcon = ({ label, icon, onPress }) => (
    <TouchableOpacity style={styles.gridItem} onPress={onPress}>
        <View style={styles.iconContainer}>
            {icon}
        </View>
        <Text style={styles.gridLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    background: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(11, 15, 20, 0.6)' },
    safe: { flex: 1 },

    statusBar: {
        paddingHorizontal: 25, paddingTop: 50, paddingBottom: 20
    },
    headerTop: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15
    },
    headerDate: { color: GOLD, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    headerTime: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 2 },
    unitName: { color: '#FFF', fontWeight: 'bold', fontSize: 26, letterSpacing: 2, textAlign: 'center' },
    cpName: { color: GOLD, fontSize: 14, fontWeight: 'bold', letterSpacing: 3, marginTop: 5, opacity: 0.9, textAlign: 'center' },
    logoutBtnTop: {
        width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255,77,77,0.1)',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,77,77,0.2)'
    },

    scrollContent: { paddingTop: 10, paddingBottom: 60 },

    panel: {
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 25,
        padding: 24, marginHorizontal: 20, marginBottom: 30,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    panelTitle: { color: GOLD, fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, letterSpacing: 2 },
    statsRow: { flexDirection: 'row' },
    statBlock: { flex: 1, alignItems: 'center' },
    statDivider: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)' },
    statValue: { fontSize: 32, fontWeight: 'bold' },
    statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, marginTop: 5, fontWeight: 'bold' },

    actionGridContainer: { paddingHorizontal: 20, marginBottom: 30 },
    tacticalPanel: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 35,
        padding: 30,
        marginHorizontal: 20,
        marginBottom: 75, // Standardized gap
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 15
    },
    gridRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 25 },
    gridItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    iconContainer: {
        width: 64, height: 64, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    gridLabel: { color: '#FFF', fontSize: 11, fontWeight: 'bold', textAlign: 'center', opacity: 0.85, lineHeight: 15 },

    secondaryContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 15 },
    secondaryAction: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: CARD_BG, height: 55, borderRadius: 15,
        borderWidth: 1.5, borderColor: BORDER, gap: 10
    },
    secondaryText: { color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', fontSize: 12 },

    footer: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 20, opacity: 0.5
    },
    operatorText: { color: '#FFF', fontSize: 11, letterSpacing: 1 },
});
