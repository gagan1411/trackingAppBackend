import * as SQLite from 'expo-sqlite';

const dbName = 'tracking.db';
let _db = null;

const getDB = async () => {
    if (!_db) {
        _db = await SQLite.openDatabaseAsync(dbName);
    }
    return _db;
};

export const initDB = async () => {
    const db = await getDB();
    await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicleNumber TEXT NOT NULL,
      driverName TEXT NOT NULL,
      fromLocation TEXT NOT NULL,
      toLocation TEXT NOT NULL,
      date TEXT NOT NULL,
      syncId TEXT UNIQUE NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS civilians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      fatherName TEXT NOT NULL,
      mobile TEXT,
      idProof TEXT,
      idNumber TEXT,
      religion TEXT,
      occupation TEXT,
      dob TEXT,
      physiologicalCharacteristics TEXT,
      fenceCardNo TEXT,
      vehicles TEXT,
      state TEXT,
      district TEXT,
      tehsil TEXT,
      village TEXT,
      houseDetails TEXT,
      category TEXT,
      bloodRelatives TEXT,
      photo TEXT,
      fingerprintLinked INTEGER DEFAULT 0,
      faceIrisLinked INTEGER DEFAULT 0,
      approved INTEGER DEFAULT 0,
      lat REAL,
      lon REAL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS entry_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      civilianId INTEGER NOT NULL,
      name TEXT NOT NULL,
      village TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      exitTimestamp TEXT,
      purposeOfVisit TEXT,
      placeOfVisit TEXT,
      vehicleDetails TEXT,
      itemsCashCarried TEXT,
      animals TEXT,
      otherImpDetails TEXT,
      isInternational INTEGER DEFAULT 0,
      passportDetails TEXT,
      visaDetails TEXT,
      flightTicketDetails TEXT,
      internationalCash TEXT,
      internationalOtherDetails TEXT,
      phoneCheckDetails TEXT,
      completed INTEGER DEFAULT 0,
      category TEXT,
      syncId TEXT UNIQUE NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS civilian_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      civilianId INTEGER NOT NULL,
      name TEXT NOT NULL,
      village TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      syncId TEXT UNIQUE NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS biometric_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      template TEXT NOT NULL,
      civilian_id INTEGER,
      UNIQUE(user_id, type)
    );

    CREATE TABLE IF NOT EXISTS census (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      houseNumber TEXT,
      headOfFamily TEXT NOT NULL,
      membersCount INTEGER,
      address TEXT NOT NULL,
      village TEXT,
      contactNumber TEXT,
      surveyDate TEXT NOT NULL,
      syncId TEXT UNIQUE NOT NULL,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS operators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      dob TEXT,
      email TEXT,
      contact TEXT,
      role TEXT DEFAULT 'operator',
      createdAt TEXT NOT NULL
    );
  `);

    // Migrations for civilians table
    const civilianFields = await db.getAllAsync("PRAGMA table_info(civilians)");
    const civCols = civilianFields.map(col => col.name);
    if (!civCols.includes('religion')) await db.execAsync("ALTER TABLE civilians ADD COLUMN religion TEXT;");
    if (!civCols.includes('occupation')) await db.execAsync("ALTER TABLE civilians ADD COLUMN occupation TEXT;");
    if (!civCols.includes('dob')) await db.execAsync("ALTER TABLE civilians ADD COLUMN dob TEXT;");
    if (!civCols.includes('physiologicalCharacteristics')) await db.execAsync("ALTER TABLE civilians ADD COLUMN physiologicalCharacteristics TEXT;");
    if (!civCols.includes('fenceCardNo')) await db.execAsync("ALTER TABLE civilians ADD COLUMN fenceCardNo TEXT;");
    if (!civCols.includes('vehicles')) await db.execAsync("ALTER TABLE civilians ADD COLUMN vehicles TEXT;");
    if (!civCols.includes('state')) await db.execAsync("ALTER TABLE civilians ADD COLUMN state TEXT;");
    if (!civCols.includes('district')) await db.execAsync("ALTER TABLE civilians ADD COLUMN district TEXT;");
    if (!civCols.includes('tehsil')) await db.execAsync("ALTER TABLE civilians ADD COLUMN tehsil TEXT;");
    if (!civCols.includes('houseDetails')) await db.execAsync("ALTER TABLE civilians ADD COLUMN houseDetails TEXT;");
    if (!civCols.includes('category')) await db.execAsync("ALTER TABLE civilians ADD COLUMN category TEXT;");
    if (!civCols.includes('bloodRelatives')) await db.execAsync("ALTER TABLE civilians ADD COLUMN bloodRelatives TEXT;");
    if (!civCols.includes('approved')) await db.execAsync("ALTER TABLE civilians ADD COLUMN approved INTEGER DEFAULT 0;");
    if (!civCols.includes('idNumber')) await db.execAsync("ALTER TABLE civilians ADD COLUMN idNumber TEXT;");
    if (!civCols.includes('photo')) await db.execAsync("ALTER TABLE civilians ADD COLUMN photo TEXT;");
    if (!civCols.includes('fingerprintLinked')) await db.execAsync("ALTER TABLE civilians ADD COLUMN fingerprintLinked INTEGER DEFAULT 0;");
    if (!civCols.includes('faceIrisLinked')) await db.execAsync("ALTER TABLE civilians ADD COLUMN faceIrisLinked INTEGER DEFAULT 0;");
    if (!civCols.includes('lat')) await db.execAsync("ALTER TABLE civilians ADD COLUMN lat REAL;");
    if (!civCols.includes('lon')) await db.execAsync("ALTER TABLE civilians ADD COLUMN lon REAL;");
    if (!civCols.includes('createdAt')) await db.execAsync("ALTER TABLE civilians ADD COLUMN createdAt TEXT;");

    // Migrations for entry_logs table
    const logFields = await db.getAllAsync("PRAGMA table_info(entry_logs)");
    const logCols = logFields.map(col => col.name);
    if (!logCols.includes('category')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN category TEXT;");
    if (!logCols.includes('purposeOfVisit')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN purposeOfVisit TEXT;");
    if (!logCols.includes('placeOfVisit')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN placeOfVisit TEXT;");
    if (!logCols.includes('vehicleDetails')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN vehicleDetails TEXT;");
    if (!logCols.includes('itemsCashCarried')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN itemsCashCarried TEXT;");
    if (!logCols.includes('animals')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN animals TEXT;");
    if (!logCols.includes('phoneCheckDetails')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN phoneCheckDetails TEXT;");
    if (!logCols.includes('isInternational')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN isInternational INTEGER DEFAULT 0;");
    if (!logCols.includes('otherImpDetails')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN otherImpDetails TEXT;");
    if (!logCols.includes('passportDetails')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN passportDetails TEXT;");
    if (!logCols.includes('visaDetails')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN visaDetails TEXT;");
    if (!logCols.includes('flightTicketDetails')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN flightTicketDetails TEXT;");
    if (!logCols.includes('internationalCash')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN internationalCash TEXT;");
    if (!logCols.includes('internationalOtherDetails')) await db.execAsync("ALTER TABLE entry_logs ADD COLUMN internationalOtherDetails TEXT;");

    // Migration for existing operators table
    const tableInfo = await db.getAllAsync("PRAGMA table_info(operators)");
    const columns = tableInfo.map(col => col.name);

    if (!columns.includes('name')) {
        await db.execAsync("ALTER TABLE operators ADD COLUMN name TEXT;");
    }
    if (!columns.includes('dob')) {
        await db.execAsync("ALTER TABLE operators ADD COLUMN dob TEXT;");
    }
    if (!columns.includes('email')) {
        await db.execAsync("ALTER TABLE operators ADD COLUMN email TEXT;");
    }
    if (!columns.includes('contact')) {
        await db.execAsync("ALTER TABLE operators ADD COLUMN contact TEXT;");
    }
    if (!columns.includes('role')) {
        await db.execAsync("ALTER TABLE operators ADD COLUMN role TEXT DEFAULT 'operator';");
    }

    return db;
};

// ─── AUTHENTICATION (Offline) ──────────────────────────────────────────────────

export const registerLocalOperator = async (data) => {
    const { username, password, name, dob, email, contact } = data;
    const db = await getDB();
    const existing = await db.getFirstAsync('SELECT * FROM operators WHERE username = ?', [username]);
    if (existing) throw new Error('Operator already exists locally.');

    await db.runAsync(
        'INSERT INTO operators (username, password, name, dob, email, contact, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, password, name, dob, email, contact, new Date().toISOString()]
    );
    return true;
};

export const loginLocalOperator = async (username, password) => {
    const db = await getDB();
    const operator = await db.getFirstAsync('SELECT * FROM operators WHERE username = ? AND password = ?', [username, password]);
    if (!operator) throw new Error('Invalid Credentials');
    return operator;
};

export const updateLocalOperatorPassword = async (username, newPassword) => {
    const db = await getDB();
    await db.runAsync('UPDATE operators SET password = ? WHERE username = ?', [newPassword, username]);
};

// ─── CENSUS ────────────────────────────────────────────────────────────────────

export const saveCensusData = async (data) => {
    const db = await getDB();
    const { houseNumber, headOfFamily, membersCount, address, village, contactNumber } = data;
    const surveyDate = new Date().toISOString();
    const syncId = 'cen_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

    await db.runAsync(
        'INSERT INTO census (houseNumber, headOfFamily, membersCount, address, village, contactNumber, surveyDate, syncId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [houseNumber, headOfFamily, membersCount, address, village, contactNumber, surveyDate, syncId]
    );

};

export const getCensusRecords = async () => {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM census ORDER BY id DESC');

};

// ─── VEHICLE MOVEMENTS ─────────────────────────────────────────────────────────

export const saveMovementLocal = async (movement) => {
    const db = await getDB();
    const { vehicleNumber, driverName, fromLocation, toLocation, date, syncId } = movement;

    await db.runAsync(
        'INSERT INTO movements (vehicleNumber, driverName, fromLocation, toLocation, date, syncId, synced) VALUES (?, ?, ?, ?, ?, ?, 0)',
        [vehicleNumber, driverName, fromLocation, toLocation, date, syncId]
    );

};

export const getUnsyncedMovements = async () => {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM movements WHERE synced = 0');

};

export const markAsSynced = async (syncId) => {
    const db = await getDB();
    await db.runAsync('UPDATE movements SET synced = 1 WHERE syncId = ?', [syncId]);

};

export const getLocalMovements = async () => {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM movements ORDER BY id DESC');

};

// ─── CIVILIANS ─────────────────────────────────────────────────────────────────

export const saveCivilian = async (civilian) => {
    const db = await getDB();
    const {
        name, fatherName, mobile, idProof, idNumber, religion, occupation,
        dob, physiologicalCharacteristics, fenceCardNo, vehicles,
        state, district, tehsil, village, houseDetails, category,
        bloodRelatives, photo, fingerprintLinked, lat, lon
    } = civilian;
    const createdAt = new Date().toISOString();

    await db.runAsync(
        `INSERT INTO civilians (
            name, fatherName, mobile, idProof, idNumber, religion, occupation,
            dob, physiologicalCharacteristics, fenceCardNo, vehicles,
            state, district, tehsil, village, houseDetails, category,
            bloodRelatives, photo, fingerprintLinked, faceIrisLinked, approved, lat, lon, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name, fatherName, mobile, idProof, idNumber, religion, occupation,
            dob, physiologicalCharacteristics, fenceCardNo, vehicles,
            state, district, tehsil, village, houseDetails, category,
            bloodRelatives, photo, fingerprintLinked ? 1 : 0, photo ? 1 : 0, 0, lat, lon, createdAt
        ]
    );
};

export const getCivilians = async () => {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM civilians ORDER BY id DESC');
};

// ─── ENTRY LOGS (Entry/Exit with Completion) ───────────────────────────────────

export const saveEntryLog = async (log) => {
    const db = await getDB();
    const {
        civilianId, name, village, type, category, purposeOfVisit, placeOfVisit,
        vehicleDetails, itemsCashCarried, animals, otherImpDetails,
        isInternational, passportDetails, visaDetails, flightTicketDetails,
        internationalCash, internationalOtherDetails, phoneCheckDetails
    } = log;
    const timestamp = new Date().toISOString();
    const syncId = 'ent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

    await db.runAsync(
        `INSERT INTO entry_logs (
            civilianId, name, village, type, timestamp, completed, syncId, category,
            purposeOfVisit, placeOfVisit, vehicleDetails, itemsCashCarried,
            animals, otherImpDetails, isInternational, passportDetails,
            visaDetails, flightTicketDetails, internationalCash,
            internationalOtherDetails, phoneCheckDetails
        ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            civilianId, name, village, type, timestamp, syncId, category,
            purposeOfVisit, placeOfVisit, vehicleDetails, itemsCashCarried,
            animals, otherImpDetails, isInternational ? 1 : 0, passportDetails,
            visaDetails, flightTicketDetails, internationalCash,
            internationalOtherDetails, phoneCheckDetails
        ]
    );
};


export const markEntryComplete = async (entryId) => {
    const db = await getDB();
    const exitTimestamp = new Date().toISOString();
    await db.runAsync(
        'UPDATE entry_logs SET completed = 1, exitTimestamp = ? WHERE id = ?',
        [exitTimestamp, entryId]
    );

};

export const getEntryLogs = async () => {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM entry_logs ORDER BY id DESC');

};

export const getPendingEntries = async () => {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM entry_logs WHERE completed = 0 ORDER BY id DESC');

};

// ─── CIVILIAN MOVEMENTS (legacy) ───────────────────────────────────────────────

export const saveCivilianMovement = async (log) => {
    const db = await getDB();
    const { civilianId, name, village, type } = log;
    const timestamp = new Date().toISOString();
    const syncId = 'civ_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

    await db.runAsync(
        'INSERT INTO civilian_movements (civilianId, name, village, type, timestamp, syncId) VALUES (?, ?, ?, ?, ?, ?)',
        [civilianId, name, village, type, timestamp, syncId]
    );

};

export const getCivilianMovements = async () => {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM civilian_movements ORDER BY id DESC');

};

// ─── STATS ─────────────────────────────────────────────────────────────────────

export const getDailyStats = async () => {
    const db = await getDB();
    const today = new Date().toISOString().split('T')[0];

    const entryStats = await db.getFirstAsync(
        "SELECT COUNT(*) as count FROM entry_logs WHERE timestamp LIKE ?",
        [`${today}%`]
    );

    const exitStats = await db.getFirstAsync(
        "SELECT COUNT(*) as count FROM entry_logs WHERE completed = 1 AND exitTimestamp LIKE ?",
        [`${today}%`]
    );

    const insideStats = await db.getFirstAsync(
        "SELECT COUNT(*) as count FROM entry_logs WHERE completed = 0 AND timestamp LIKE ?",
        [`${today}%`]
    );

    const alertStats = await db.getFirstAsync(
        "SELECT COUNT(*) as count FROM alerts WHERE timestamp LIKE ?",
        [`${today}%`]
    );

    return {
        entries: entryStats?.count || 0,
        exits: exitStats?.count || 0,
        inside: insideStats?.count || 0,
        alerts: alertStats?.count || 0,
    };

};

// ─── BIOMETRIC TEMPLATES (Local offline storage) ──────────────────────────────

export const saveBiometricTemplate = async ({ user_id, type, template, civilian_id }) => {
    const db = await getDB();
    await db.runAsync(
        `INSERT OR REPLACE INTO biometric_templates (user_id, type, template, civilian_id) VALUES (?, ?, ?, ?)`,
        [user_id, type, template, civilian_id || null]
    );
};

export const getBiometricTemplates = async (type) => {
    const db = await getDB();
    if (type) {
        return await db.getAllAsync(`SELECT * FROM biometric_templates WHERE type = ?`, [type]);
    }
    return await db.getAllAsync(`SELECT * FROM biometric_templates`);
};

export const deleteBiometricTemplate = async (user_id, type) => {
    const db = await getDB();
    await db.runAsync(`DELETE FROM biometric_templates WHERE user_id = ? AND type = ?`, [user_id, type]);
};

// ─── ALERTS ────────────────────────────────────────────────────────────────────

export const saveAlert = async (alert) => {
    const db = await getDB();
    const { title, description, type } = alert;
    const timestamp = new Date().toISOString();

    await db.runAsync(
        'INSERT INTO alerts (title, description, type, timestamp) VALUES (?, ?, ?, ?)',
        [title, description, type, timestamp]
    );

};
