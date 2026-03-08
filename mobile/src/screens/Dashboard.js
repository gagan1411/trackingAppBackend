import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    Modal
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
    Fingerprint,
    Map,
    LogOut,
    ShieldAlert,
    Car,
    Shield,
    Contact,
    Calendar,
    Files,
    PieChart,
    MoreVertical,
    Info,
    X,
    Cpu
} from 'lucide-react-native';

import { getDailyStats } from '../database/db';
import * as SecureStore from 'expo-secure-store';

const GOLD = '#C5A059';
const RED = '#FF4D4D';

export default function Dashboard({ navigation, setIsAuthenticated }) {

    const [stats, setStats] = useState({ entries: 0, inside: 0, alerts: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [operator, setOperator] = useState("OPERATOR");

    const [menuVisible, setMenuVisible] = useState(false);
    const [aboutVisible, setAboutVisible] = useState(false);

    useEffect(() => {

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        SecureStore.getItemAsync("operator").then(op => {
            if (op) setOperator(op.toUpperCase());
        });

        refreshData();

        return () => clearInterval(timer);

    }, []);

    const refreshData = async () => {
        try {
            const daily = await getDailyStats();
            setStats(daily);
        } catch (e) {
            console.log(e);
        }
    }

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("operator");
        setIsAuthenticated(false);
    }

    const fTime = d => d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const fDate = d => d.toLocaleDateString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).toUpperCase();

    return (

        <ImageBackground
            source={require('../images/pages.png')}
            style={styles.background}
            resizeMode="cover"
        >

            <SafeAreaView style={styles.safe}>

                <View style={styles.overlay}>

                    {/* HEADER */}

                    <View style={styles.header}>

                        <View>
                            <Text style={styles.date}>{fDate(currentTime)}</Text>
                            <Text style={styles.time}>{fTime(currentTime)}</Text>
                        </View>

                        <View style={{ zIndex: 100 }}>
                            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.logoutBtn}>
                                <MoreVertical size={24} color="#FFF" />
                            </TouchableOpacity>

                            {/* Dropdown Menu */}
                            {menuVisible && (
                                <View style={styles.dropdownMenu}>
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setMenuVisible(false);
                                            setAboutVisible(true);
                                        }}
                                    >
                                        <Info size={16} color={GOLD} />
                                        <Text style={styles.dropdownItemText}>About App</Text>
                                    </TouchableOpacity>
                                    <View style={styles.dropdownDivider} />
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setMenuVisible(false);
                                            handleLogout();
                                        }}
                                    >
                                        <LogOut size={16} color={RED} />
                                        <Text style={[styles.dropdownItemText, { color: RED }]}>Logout</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                    </View>

                    <Text style={styles.title}>BEMISAAL RAKSHAK</Text>
                    <Text style={styles.subtitle}>OPERATIONAL DASHBOARD</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>

                        {/* GLASS ICON GRID */}

                        <View style={styles.glassPanel}>

                            <View style={styles.grid}>

                                <DashboardIcon
                                    label="Register New"
                                    icon={<Contact size={30} color="#4A90E2" />}
                                    onPress={() => navigation.navigate('RegisterCivilian')}
                                />

                                <DashboardIcon
                                    label="Biometric Auth"
                                    icon={<Fingerprint size={30} color="#FF4081" />}
                                    onPress={() => navigation.navigate('BiometricVerify')}
                                />

                                <DashboardIcon
                                    label="Movement Log"
                                    icon={<Calendar size={30} color="#9E9E9E" />}
                                    onPress={() => navigation.navigate('EntryLog')}
                                />

                                <DashboardIcon
                                    label="Census Mode"
                                    icon={<Files size={30} color="#90A4AE" />}
                                    onPress={() => navigation.navigate('CensusMode')}
                                />

                                <DashboardIcon
                                    label="Village Map"
                                    icon={<Map size={30} color={GOLD} />}
                                    onPress={() => navigation.navigate('OfflineMap')}
                                />

                                <DashboardIcon
                                    label="Daily Summary"
                                    icon={<PieChart size={30} color="#FF7043" />}
                                    onPress={() => navigation.navigate('DailySummary')}
                                />

                            </View>

                        </View>

                        {/* SUMMARY */}

                        <View style={styles.summaryCard}>

                            <Text style={styles.summaryTitle}>
                                OPERATIONAL SUMMARY — {fDate(currentTime)}
                            </Text>

                            <View style={styles.statsRow}>

                                <StatBlock label="ENTRIES" value={stats.entries} color={GOLD} />

                                <StatBlock label="INSIDE" value={stats.inside} color="#FFF" />

                                <StatBlock
                                    label="FLAGGED"
                                    value={stats.alerts}
                                    color={stats.alerts > 0 ? RED : "rgba(255,255,255,0.3)"}
                                />

                            </View>

                        </View>

                        {/* ACTIONS */}

                        <View style={styles.actions}>

                            <TouchableOpacity
                                style={[styles.actionBtn, { borderColor: RED }]}
                                onPress={() => navigation.navigate('ReportAlert')}
                            >
                                <ShieldAlert size={20} color={RED} />
                                <Text style={[styles.actionText, { color: RED }]}>
                                    INCIDENT REPORT
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => navigation.navigate('MovementList')}
                            >
                                <Car size={20} color={GOLD} />
                                <Text style={styles.actionText}>
                                    VEHICLE LOGS
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </ScrollView>

                    {/* FOOTER */}

                    <View style={styles.footer}>

                        <Shield size={16} color={GOLD} />

                        <Text style={styles.operator}>
                            OPERATOR:
                            <Text style={{ color: GOLD, fontWeight: 'bold' }}> {operator}</Text>
                        </Text>

                    </View>

                    {/* ABOUT MODAL */}
                    <Modal visible={aboutVisible} animationType="fade" transparent>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>ABOUT</Text>
                                    <TouchableOpacity onPress={() => setAboutVisible(false)}>
                                        <X size={24} color="rgba(255,255,255,0.5)" />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ alignItems: 'center', padding: 20 }}>
                                    <Shield size={60} color={GOLD} style={{ marginBottom: 15 }} />
                                    <Text style={styles.appName}>Bemisaal Rakshak</Text>
                                    <Text style={styles.appVersion}>Version 1.0.0</Text>

                                    <View style={styles.infoBox}>
                                        <View style={styles.infoRow}>
                                            <Cpu size={16} color={GOLD} />
                                            <Text style={styles.infoText}>Biometric Engine v2.4 (Active)</Text>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Files size={16} color={GOLD} />
                                            <Text style={styles.infoText}>Local Storage Encrypted</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.appDesc}>
                                        Advanced civilian tracking and military intelligence gathering dashboard, featuring offline-first biometric authentication and dynamic geographical mapping.
                                    </Text>
                                </View>
                                <View style={styles.modalFooter}>
                                    <Text style={styles.madeBy}>Developed for Defense Logistics</Text>
                                </View>
                            </View>
                        </View>
                    </Modal>

                </View>

            </SafeAreaView>

        </ImageBackground>

    )
}

const DashboardIcon = ({ label, icon, onPress }) => (
    <TouchableOpacity style={styles.iconCard} onPress={onPress}>
        <View style={styles.iconBox}>{icon}</View>
        <Text style={styles.iconLabel}>{label}</Text>
    </TouchableOpacity>
)

const StatBlock = ({ label, value, color }) => (
    <View style={styles.stat}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
)

const styles = StyleSheet.create({

    background: { flex: 1 },

    safe: { flex: 1 },

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(11,15,20,0.65)'
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginTop: 45
    },

    date: {
        color: GOLD,
        fontSize: 12,
        fontWeight: 'bold'
    },

    time: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold'
    },

    logoutBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    dropdownMenu: {
        position: 'absolute',
        top: 50,
        right: 0,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        width: 160,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        gap: 12
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    dropdownItemText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold'
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#141414',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: GOLD,
        overflow: 'hidden'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    modalTitle: {
        color: GOLD,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2
    },
    appName: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginTop: 10
    },
    appVersion: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginBottom: 20,
        letterSpacing: 1
    },
    infoBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 15,
        borderRadius: 12,
        width: '100%',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 12
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    infoText: {
        color: '#CCC',
        fontSize: 12
    },
    appDesc: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 10,
        marginBottom: 10
    },
    modalFooter: {
        backgroundColor: 'rgba(197, 160, 89, 0.1)',
        padding: 15,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: GOLD
    },
    madeBy: {
        color: GOLD,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2
    },

    title: {
        color: '#FFF',
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        letterSpacing: 2
    },

    subtitle: {
        color: GOLD,
        textAlign: 'center',
        letterSpacing: 3,
        fontSize: 13,
        marginBottom: 25
    },

    glassPanel: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 28,
        marginHorizontal: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 20,
        marginBottom: 25
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },

    iconCard: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 20
    },

    iconBox: {
        width: 62,
        height: 62,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.07)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },

    iconLabel: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 0.85
    },

    summaryCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 25,
        padding: 22,
        marginHorizontal: 20,
        marginBottom: 25
    },

    summaryTitle: {
        color: GOLD,
        textAlign: 'center',
        fontSize: 11,
        letterSpacing: 2,
        marginBottom: 15
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    stat: {
        flex: 1,
        alignItems: 'center'
    },

    statValue: {
        fontSize: 32,
        fontWeight: 'bold'
    },

    statLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        marginTop: 5
    },

    actions: {
        flexDirection: 'row',
        gap: 15,
        paddingHorizontal: 20
    },

    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.85)',
        height: 55,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        gap: 10
    },

    actionText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: 'bold'
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 18,
        opacity: 0.6
    },

    operator: {
        color: '#FFF',
        fontSize: 11,
        letterSpacing: 1
    }

});