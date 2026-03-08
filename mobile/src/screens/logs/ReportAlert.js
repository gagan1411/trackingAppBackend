import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ScrollView, ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveAlert } from '../../database/db';
import {
    AlertCircle, ShieldAlert, Flag, Camera,
    MapPin, X, Shield, Send, ArrowLeft
} from 'lucide-react-native';

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const CARD_BG = 'rgba(0,0,0,0.85)';
const BORDER = 'rgba(255,255,255,0.15)';
const INPUT_BG = 'rgba(255,255,255,0.05)';
const RED_ACCENT = '#FF4D4D';

export default function ReportAlert({ navigation }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Suspicious');

    const handleSubmit = async () => {
        if (!title || !description) {
            return Alert.alert('Report Incomplete', 'Title and Description are required to file an incident.');
        }

        try {
            await saveAlert({ title: title.toUpperCase(), description, type });
            Alert.alert('✅ Report Filed', 'Incident report has been logged and queued for synchronization.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('System Error', 'Failed to save the incident report.');
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
                        <Text style={styles.headerTitle}>INCIDENT REPORTING</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

                        <View style={styles.card}>
                            <View style={styles.statusRow}>
                                <Shield color={GOLD} size={14} />
                                <Text style={styles.statusText}>TACTICAL DIVISION | BEMISAAL RAKSHAK</Text>
                            </View>

                            <Text style={styles.label}>CLASSIFICATION</Text>
                            <View style={styles.typeRow}>
                                {['Suspicious', 'Emergency', 'Illegal'].map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                                        onPress={() => setType(t)}
                                    >
                                        <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>{t.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <FLabel required>INCIDENT SUBJECT</FLabel>
                            <FInput
                                placeholder="E.G. UNIDENTIFIED DRONE SIGHTED"
                                value={title}
                                onChange={setTitle}
                                autoCapitalize="characters"
                            />

                            <FLabel required>DETAILED INTELLIGENCE</FLabel>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="ENTER FULL DETAILS OF THE INCIDENT..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                multiline
                                numberOfLines={6}
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        <View style={styles.quickActions}>
                            <TouchableOpacity style={styles.mediaBtn}>
                                <Camera color={GOLD} size={20} />
                                <Text style={styles.mediaBtnText}>ATTACH PHOTO</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.mediaBtn}>
                                <MapPin color={GOLD} size={20} />
                                <Text style={styles.mediaBtnText}>TAG LOCATION</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                                <Send color="#000" size={20} style={{ marginRight: 10 }} />
                                <Text style={styles.submitBtnText}>TRANSMIT REPORT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                                <Text style={styles.cancelBtnText}>DISCARD</Text>
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

const FInput = ({ placeholder, value, onChange, ...props }) => (
    <View style={styles.inputWrapper}>
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
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 25, alignSelf: 'center' },
    statusText: { color: GOLD, fontSize: 9, fontWeight: 'bold', letterSpacing: 1.5 },

    label: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1.5 },

    typeRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
    typeBtn: {
        flex: 1, paddingVertical: 12, borderRadius: 10,
        borderWidth: 1.5, borderColor: BORDER, alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)'
    },
    typeBtnActive: { backgroundColor: RED_ACCENT, borderColor: RED_ACCENT },
    typeBtnText: { color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', fontSize: 10, letterSpacing: 1 },
    typeBtnTextActive: { color: '#000' },

    inputWrapper: {
        backgroundColor: INPUT_BG, borderRadius: 12, marginBottom: 20,
        borderWidth: 1.5, borderColor: BORDER, height: 55, paddingHorizontal: 15
    },
    input: { flex: 1, height: '100%', color: '#FFF', fontSize: 14, fontWeight: 'bold' },
    textArea: {
        backgroundColor: INPUT_BG, borderWidth: 1.5, borderColor: BORDER,
        borderRadius: 12, padding: 15, height: 120, textAlignVertical: 'top',
        color: '#FFF', fontSize: 14, fontWeight: 'bold'
    },

    quickActions: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    mediaBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        padding: 15, borderRadius: 12, justifyContent: 'center',
        borderWidth: 1.5, borderColor: GOLD, backgroundColor: 'rgba(197, 160, 89, 0.05)', gap: 10
    },
    mediaBtnText: { color: GOLD, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

    actionRow: { flexDirection: 'row', gap: 15 },
    submitBtn: {
        flex: 2, height: 65, backgroundColor: RED_ACCENT, borderRadius: 30,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        shadowColor: RED_ACCENT, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10
    },
    submitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15, letterSpacing: 1.5 },
    cancelBtn: {
        flex: 1, height: 65, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 30,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: BORDER
    },
    cancelBtnText: { color: 'rgba(255,255,255,0.3)', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 }
});
