import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Dimensions, TextInput } from 'react-native';
import { ChevronDown, ChevronUp, Check, Search } from 'lucide-react-native';

const GOLD = '#C5A059';
const DARK = '#0B0F14';
const BORDER = 'rgba(255,255,255,0.15)';
const INPUT_BG = 'rgba(255,255,255,0.05)';

export default function PrimeDropdown({ value, items, setValue, placeholder, style, textStyle, searchable }) {
    const [visible, setVisible] = useState(false);
    const [query, setQuery] = useState('');

    const selectedLabel = items.find(opt => opt.value === value)?.label || placeholder;

    // Show search box if searchable prop is set OR if items > 10
    const showSearch = searchable || items.length > 10;

    const filtered = useMemo(() => {
        if (!query.trim()) return items;
        const q = query.toLowerCase();
        return items.filter(i => i.label.toLowerCase().includes(q));
    }, [query, items]);

    const handleClose = () => {
        setVisible(false);
        setQuery('');
    };

    return (
        <View style={{ marginBottom: 16 }}>
            <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.dropdownBtn, visible && styles.dropdownBtnActive, style]}
                onPress={() => setVisible(true)}
            >
                <Text style={[styles.dropdownText, textStyle, !value && { color: 'rgba(255,255,255,0.4)' }]}>
                    {selectedLabel}
                </Text>
                {visible ? <ChevronUp size={18} color={GOLD} /> : <ChevronDown size={18} color={GOLD} />}
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{placeholder}</Text>
                        </View>

                        {showSearch && (
                            <View style={styles.searchBox}>
                                <Search size={16} color="rgba(255,255,255,0.4)" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search..."
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={query}
                                    onChangeText={setQuery}
                                    autoFocus
                                />
                            </View>
                        )}

                        <FlatList
                            data={filtered}
                            keyExtractor={(item, index) => item.value + index.toString()}
                            showsVerticalScrollIndicator={true}
                            keyboardShouldPersistTaps="handled"
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No results found</Text>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.modalItem, value === item.value && styles.modalItemActive]}
                                    onPress={() => {
                                        setValue(item.value);
                                        handleClose();
                                    }}
                                >
                                    <Text style={[styles.modalItemText, value === item.value && { color: GOLD, fontWeight: 'bold' }]}>
                                        {item.label}
                                    </Text>
                                    {value === item.value && <Check size={18} color={GOLD} />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    dropdownBtn: {
        backgroundColor: INPUT_BG,
        borderColor: BORDER,
        borderWidth: 1.5,
        borderRadius: 12,
        height: 55,
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownBtnActive: {
        borderColor: GOLD,
        backgroundColor: 'rgba(197, 160, 89, 0.05)'
    },
    dropdownText: {
        color: '#FFF',
        fontSize: 14,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#141414',
        width: '100%',
        maxHeight: Dimensions.get('window').height * 0.65,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BORDER,
        overflow: 'hidden'
    },
    modalHeader: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        backgroundColor: 'rgba(255,255,255,0.02)'
    },
    modalTitle: {
        color: GOLD,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        gap: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    searchInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 14,
        height: 38,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        padding: 20,
        fontSize: 13,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    modalItemActive: {
        backgroundColor: 'rgba(197, 160, 89, 0.1)'
    },
    modalItemText: {
        color: '#CCC',
        fontSize: 14,
        flex: 1,
    }
});
