import NetInfo from '@react-native-community/netinfo';
import { getUnsyncedMovements, markAsSynced } from '../database/db';
import api from './api';

export const syncData = async () => {
    try {
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            console.log('No internet connection, skipping sync.');
            return;
        }

        const unsynced = await getUnsyncedMovements();
        if (unsynced.length === 0) return;

        console.log(`Attempting to sync ${unsynced.length} records...`);

        // Send in bulk
        const response = await api.post('/movements/sync', unsynced);
        const results = response.data;

        for (const res of results) {
            if (res.status === 'synced' || res.status === 'already_synced') {
                await markAsSynced(res.syncId);
            }
        }

        console.log('Sync complete.');
    } catch (error) {
        // Log full error so we can inspect stack / native exception
        console.error('Error during sync:', error);

        // If the error is coming from a broken Expo SQLite instance,
        // clear the cached DB so the next attempt recreates it.  This
        // usually manifests as a `NativeDatabase.prepareAsync` rejection
        // with a NullPointerException on Android.
        if (
            error?.message?.includes('NativeDatabase.prepareAsync') ||
            error?.message?.includes('NullPointerException')
        ) {
            try {
                const { resetDBInstance } = require('../database/db');
                resetDBInstance();
                console.log('Database instance reset after error.');
            } catch {}
        }
    }
};
