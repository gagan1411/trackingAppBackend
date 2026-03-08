import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ScrollView, ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveMovementLocal } from '../database/db';
import {
    Car, User, Navigation, MapPin, Shield, Check, X,
    ArrowRightLeft, ArrowRight, ArrowLeft
} from 'lucide-react-native';

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';
const INPUT_BG = 'rgba(255,255,255,0.05)';

export default function AddMovement({ navigation }) {
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [driverName, setDriverName] = useState('');
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!vehicleNumber || !driverName || !fromLocation || !toLocation) {
            return Alert.alert('Mandatory Fields', 'Please fill all fields to commit the record.');
        }

        setLoading(true);
        try {
            const syncId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
            const date = new Date().toISOString();

            await saveMovementLocal({
                vehicleNumber: vehicleNumber.toUpperCase(),
                driverName,
                fromLocation,
                toLocation,
                date,
                syncId
            });

            Alert.alert('✅ Record Committed', 'Movement logged locally. Waiting for network sync.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('System Error', 'Failed to save movement data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('../images/pages.png')}
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
                        <Text style={styles.headerTitle}>LOG VEHICLE MOVEMENT</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <Shield color={GOLD} size={14} style={{ marginRight: 8 }} />
                                <Text style={styles.sectionTitle}>VEHICLE & DRIVER INTEL</Text>
                            </View>

                            <FLabel required>VEHICLE NUMBER</FLabel>
                            <FInput
                                icon={<Car />}
                                placeholder="e.g. JK01AB1234"
                                value={vehicleNumber}
                                onChange={setVehicleNumber}
                                autoCapitalize="characters"
                            />

                            <FLabel required>DRIVER NAME</FLabel>
                            <FInput
                                icon={<User />}
                                placeholder="Enter driver's name"
                                value={driverName}
                                onChange={setDriverName}
                            />
                        </View>

                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <Navigation color={GOLD} size={14} style={{ marginRight: 8 }} />
                                <Text style={styles.sectionTitle}>ROUTE CONFIGURATION</Text>
                            </View>

                            <FLabel required>ORIGIN</FLabel>
                            <FInput
                                icon={<MapPin />}
                                placeholder="e.g. Main Gate (Alpha)"
                                value={fromLocation}
                                onChange={setFromLocation}
                            />

                            <FLabel required>DESTINATION</FLabel>
                            <FInput
                                icon={<ArrowRight />}
                                placeholder="e.g. Sector 7 Supply Point"
                                value={toLocation}
                                onChange={setToLocation}
                            />
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <>
                                        <Check color="#000" size={20} style={{ marginRight: 10 }} />
                                        <Text style={styles.buttonText}>COMMIT LOG</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                                <Text style={styles.cancelText}>ABORT</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const FLabel = ({ children, required }) => (
    <Text style={styles.label}>
        {children} {required && <Text style={{ color: '#FF4D4D' }}>*</Text>}
    </Text>
);

const FInput = ({ icon, placeholder, value, onChange, ...props }) => (
    <View style={styles.inputWrapper}>
        <View style={styles.iconBox}>
            {React.cloneElement(icon, { color: 'rgba(255,255,255,0.3)', size: 20 })}
        </View>
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={value}
            onChangeText={onChange}
            {...props}
        />
    </View>
);

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
    scrollContent: { padding: 20, paddingBottom: 40 },

    card: {
        backgroundColor: CARD_BG,
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: BORDER,
        shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10
    },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { color: GOLD, fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },

    label: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: INPUT_BG,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: BORDER,
        height: 55
    },
    iconBox: { marginLeft: 15, marginRight: 10 },
    input: { flex: 1, height: '100%', color: '#FFF', fontSize: 14, fontWeight: 'bold' },

    actionRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
    button: {
        flex: 2, height: 65, backgroundColor: GOLD,
        borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8
    },
    buttonText: { color: '#000', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },

    cancelBtn: {
        flex: 1, height: 65, backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 30, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: BORDER
    },
    cancelText: { color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 }
});
