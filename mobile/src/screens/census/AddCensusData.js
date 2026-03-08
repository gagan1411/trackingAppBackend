import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, Alert, ImageBackground, ActivityIndicator,
    StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveCensusData } from '../../database/db';
import {
    Home, Users, MapPin, Shield, Phone,
    X, Clipboard, CheckCircle, Navigation, ArrowLeft
} from 'lucide-react-native';

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';
const INPUT_BG = 'rgba(255,255,255,0.05)';
const RED_ACCENT = '#FF4D4D';

export default function AddCensusData({ navigation }) {
    const [formData, setFormData] = useState({
        houseNumber: '',
        headOfFamily: '',
        membersCount: '',
        address: '',
        village: '',
        contactNumber: ''
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!formData.headOfFamily || !formData.address) {
            Alert.alert('Required Information', 'Head of Family and Primary Address are mandatory for house enrollment.');
            return;
        }

        setSaving(true);
        try {
            await saveCensusData(formData);
            Alert.alert('✅ Data Logged', 'House registration record has been committed to the local database.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('System Error', 'Failed to synchronize local census record.');
        } finally {
            setSaving(false);
        }
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
                        <Text style={styles.headerTitle}>HOUSE ENROLLMENT</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <Shield color={GOLD} size={14} style={{ marginRight: 8 }} />
                                <Text style={styles.sectionTitle}>LOCATIONAL INTEL</Text>
                            </View>

                            <FLabel>HOUSE NUMBER / SECTOR</FLabel>
                            <FInput
                                icon={<Home />}
                                value={formData.houseNumber}
                                onChange={(text) => setFormData({ ...formData, houseNumber: text.toUpperCase() })}
                                placeholder="E.G. 12B-ALPHA"
                                autoCapitalize="characters"
                            />

                            <FLabel required>VILLAGE / OPERATIONAL AREA</FLabel>
                            <FInput
                                icon={<Navigation />}
                                value={formData.village}
                                onChange={(text) => setFormData({ ...formData, village: text })}
                                placeholder="CURRENT LOCATION"
                            />
                        </View>

                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <Users color={GOLD} size={14} style={{ marginRight: 8 }} />
                                <Text style={styles.sectionTitle}>FAMILY BIOGRAPHICS</Text>
                            </View>

                            <FLabel required>HEAD OF FAMILY</FLabel>
                            <FInput
                                icon={<Users />}
                                value={formData.headOfFamily}
                                onChange={(text) => setFormData({ ...formData, headOfFamily: text })}
                                placeholder="FULL NAME AS PER ID"
                            />

                            <FLabel>TOTAL MEMBERS</FLabel>
                            <FInput
                                icon={<Users />}
                                value={formData.membersCount}
                                onChange={(text) => setFormData({ ...formData, membersCount: text })}
                                placeholder="NUMBER OF RESIDENTS"
                                keyboardType="numeric"
                            />

                            <FLabel>CONTACT NUMBER</FLabel>
                            <FInput
                                icon={<Phone />}
                                value={formData.contactNumber}
                                onChange={(text) => setFormData({ ...formData, contactNumber: text })}
                                placeholder="10-DIGIT MOBILE"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <MapPin color={GOLD} size={14} style={{ marginRight: 8 }} />
                                <Text style={styles.sectionTitle}>PRIMARY ADDRESS</Text>
                            </View>

                            <FLabel required>DETAILED ADDRESS</FLabel>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.address}
                                onChangeText={(text) => setFormData({ ...formData, address: text })}
                                placeholder="FULL RESIDENTIAL DETAILS..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                                {saving ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <>
                                        <CheckCircle color="#000" size={20} style={{ marginRight: 10 }} />
                                        <Text style={styles.saveButtonText}>COMMIT RECORD</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                                <Text style={styles.cancelBtnText}>ABORT</Text>
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
        {children} {required && <Text style={{ color: RED_ACCENT }}>*</Text>}
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
    scrollContent: { padding: 20, paddingBottom: 60 },

    card: {
        backgroundColor: CARD_BG, borderRadius: 25, padding: 25, marginBottom: 20,
        borderWidth: 1.5, borderColor: BORDER,
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 12
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    sectionTitle: { color: GOLD, fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },

    label: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1.5 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: INPUT_BG,
        borderRadius: 12, marginBottom: 20, borderWidth: 1.5, borderColor: BORDER, height: 55
    },
    iconBox: { marginLeft: 15, marginRight: 10 },
    input: { flex: 1, height: '100%', color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    textArea: {
        backgroundColor: INPUT_BG, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12,
        padding: 15, height: 100, textAlignVertical: 'top', color: '#FFF', fontSize: 14, fontWeight: 'bold'
    },

    actionRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
    saveButton: {
        flex: 2, height: 65, backgroundColor: GOLD, borderRadius: 30,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        shadowColor: GOLD, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10
    },
    saveButtonText: { color: '#000', fontWeight: 'bold', fontSize: 15, letterSpacing: 1.5 },
    cancelBtn: {
        flex: 1, height: 65, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 30,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: BORDER
    },
    cancelBtnText: { color: 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 }
});
