import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff, User, Mail, Lock, Search, Calendar, Phone } from "lucide-react-native";
import api from "../services/api";
import * as SecureStore from "expo-secure-store";
import { registerLocalOperator, loginLocalOperator } from "../database/db";
import { testCloudConnection } from "../services/geminiService";
import DateTimePicker from "@react-native-community/datetimepicker";

const GOLD = "#c5a059";
const DARK = "#0b0f14";
const BORDER = "rgba(197,160,89,0.4)";
const LIGHT = "rgba(255,255,255,0.7)";

export default function RegistrationScreen({ setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [dobDate, setDobDate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [serverUrl, setServerUrl] = useState("https://pink-news-smoke.loca.lt");
  const [biometricUrl, setBiometricUrl] = useState("https://slow-showers-build.loca.lt");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleFooterTap = () => {
    const newCount = tapCount + 1;
    if (newCount >= 5) {
      setTapCount(0);
      setShowSettings(true);
    } else {
      setTapCount(newCount);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDobDate(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDob(day + '/' + month + '/' + year);
    }
  };

  const saveUrl = async () => {
    await SecureStore.setItemAsync("server_url", serverUrl);
    await SecureStore.setItemAsync("biometric_url", biometricUrl);
    await SecureStore.setItemAsync("gemini_api_key", geminiApiKey);
    setShowSettings(false);
    alert("System Configurations Updated.\nCloud AI Ready.");
  };

  const handleTestCloud = async () => {
    alert("Probing Cloud AI models for your key...");
    const result = await testCloudConnection();
    if (result.ok) {
      alert(`✅ CLOUD STATUS: ONLINE\n\n${result.msg}\n\nYour key is valid and configured correctly.`);
    } else {
      alert(`❌ CLOUD STATUS: ERROR\n\n${result.msg}\n\nPlease check your key in Google AI Studio.`);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotUsername.trim()) {
      alert("Please enter your username.");
      return;
    }
    if (!forgotNewPass || forgotNewPass.length < 4) {
      alert("New password must be at least 4 characters.");
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      alert("Passwords do not match.");
      return;
    }
    setForgotLoading(true);
    try {
      // Try server reset first
      await api.post('/auth/reset-password', { username: forgotUsername.trim(), newPassword: forgotNewPass });
      // Also update local SQLite if record exists
      try {
        const db = await import('../database/db');
        await db.updateLocalOperatorPassword(forgotUsername.trim(), forgotNewPass);
      } catch (_) { }
      alert(`✅ Password reset successfully!\nYou can now login with your new password.`);
      setShowForgot(false);
      setForgotUsername(""); setForgotNewPass(""); setForgotConfirmPass("");
    } catch (err) {
      const msg = err?.response?.data?.msg || err.message || 'Reset failed';
      alert('❌ ' + msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleAction = async () => {
    if (isLogin) {
      if (!username || !password) {
        alert("Please fill in all mandatory fields");
        return;
      }
    } else {
      if (!name || !dob || !username || !password || !confirmPassword) {
        alert("Please fill in Name, DOB, Username, and Password");
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        // ── Step 1: Try backend server login ──
        let loggedIn = false;
        let serverReachable = false;
        try {
          const res = await api.post('/auth/login', { username, password });

          // Check if response is actually valid JSON with a token
          // If it's an HTML page (like Localtunnel warning), this will be false
          if (res.data && typeof res.data === 'object' && res.data.token) {
            serverReachable = true;
            await SecureStore.setItemAsync('token', res.data.token);
            await SecureStore.setItemAsync('operator', username);
            // Seed local DB so offline login works next time
            try {
              await registerLocalOperator({ username, password, name: res.data.user?.name || '', dob: '', email: '', contact: '' });
            } catch (_) { /* already exists locally */ }
            loggedIn = true;
          } else {
            // Server returned something else (e.g. Localtunnel landing page)
            console.log('Server returned invalid response format, falling back to local.');
            serverReachable = false;
          }
        } catch (serverErr) {
          const status = serverErr?.response?.status;
          // If 401/403, the server ACTIVELY rejected the login
          if (status === 401 || status === 403) {
            serverReachable = true;
            const msg = serverErr?.response?.data?.msg || 'Invalid Credentials';
            throw new Error(msg);
          }
          // Otherwise (500, network error, etc.), treat as unreachable
          serverReachable = false;
          console.log('Server unreachable/error:', serverErr.message);
        }

        // ── Step 2: Fallback to local ──
        if (!loggedIn) {
          try {
            const operator = await loginLocalOperator(username, password);
            if (operator) {
              await SecureStore.setItemAsync('token', 'local_token_' + (operator.id || 'offline'));
              await SecureStore.setItemAsync('operator', operator.username);
              loggedIn = true;
            }
          } catch (localErr) {
            if (!serverReachable) {
              throw new Error("Offline: This account is not registered on this device yet. Please register once while online.");
            }
          }
        }

        if (loggedIn) {
          setIsAuthenticated(true);
        }
      } else {
        // ── Step 1: Try backend server registration ──
        let registeredOnServer = false;
        try {
          const res = await api.post('/auth/register', { username, password, name, dob, email, contact });
          if (res.data && res.data.token) {
            registeredOnServer = true;
          }
        } catch (serverErr) {
          console.log('Server registration failed, registering locally only:', serverErr.message);
        }

        // ── Step 2: Also save locally (backup for offline use) ──
        try {
          await registerLocalOperator({ username, password, name, dob, email, contact });
        } catch (_) {
          // Already exists locally — fine if server already registered
        }

        const successMsg = registeredOnServer
          ? "Account Created on Server ✅\nYou can now login on any device."
          : "Account Created Locally ✅\nNote: Data may be lost on reinstall. Connect to server for permanent storage.";

        alert(successMsg);
        setIsLogin(true);
        setName(""); setDob(""); setEmail(""); setContact("");
        setUsername(""); setPassword(""); setConfirmPassword("");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />

      <ImageBackground
        source={require("../images/login.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              {/* 🔰 Top Header */}
              <View style={styles.topHeader}>
                <Text style={styles.appName}>BEMISAAL RAKSHAK</Text>
                <Text style={styles.appTag}>CHECKPOST SCREENING SYSTEM</Text>
              </View>

              {/* ✨ Glass Card Container */}
              <View style={styles.card}>
                <Text style={styles.title}>{isLogin ? "LOGIN" : "CREATE ACCOUNT"}</Text>

                {/* 👤 Full Name (Only for Register) */}
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                    <View style={styles.inputWrapper}>
                      <User color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Enter your name"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        style={styles.boxInputWithIcon}
                        value={name}
                        onChangeText={setName}
                      />
                    </View>
                  </View>
                )}

                {/* 📧 Username for Login / Email for Register (Actually specialized now) */}
                {isLogin ? (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username <Text style={styles.required}>*</Text></Text>
                    <View style={styles.inputWrapper}>
                      <User color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Enter your username"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        style={styles.boxInputWithIcon}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Date of Birth <Text style={styles.required}>*</Text></Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
                        <View style={styles.inputWrapper} pointerEvents="none">
                          <Calendar color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                          <TextInput
                            placeholder="DD/MM/YYYY"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            style={styles.boxInputWithIcon}
                            value={dob}
                            onChangeText={setDob}
                            editable={false}
                          />
                        </View>
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={dobDate}
                          mode="date"
                          display="default"
                          themeVariant="dark"
                          onChange={onDateChange}
                          maximumDate={new Date()}
                        />
                      )}
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>E-Mail</Text>
                      <View style={styles.inputWrapper}>
                        <Mail color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                        <TextInput
                          placeholder="Enter your email (optional)"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          style={styles.boxInputWithIcon}
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Phone Number</Text>
                      <View style={styles.inputWrapper}>
                        <Phone color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                        <TextInput
                          placeholder="Enter 10-digit number"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          style={styles.boxInputWithIcon}
                          value={contact}
                          onChangeText={setContact}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>User Name <Text style={styles.required}>*</Text></Text>
                      <View style={styles.inputWrapper}>
                        <User color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                        <TextInput
                          placeholder="Enter username"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          style={styles.boxInputWithIcon}
                          value={username}
                          onChangeText={setUsername}
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  </>
                )}

                {/* 🔒 Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
                  <View style={styles.inputWrapper}>
                    <Lock color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      style={styles.boxInputPasswordWithIcon}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff color="rgba(255,255,255,0.6)" size={22} />
                      ) : (
                        <Eye color="rgba(255,255,255,0.6)" size={22} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 🔒 Confirm Password (Only for Register) */}
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
                    <View style={styles.inputWrapper}>
                      <Lock color="rgba(255,255,255,0.5)" size={20} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Re-enter your password"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        style={styles.boxInputPasswordWithIcon}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff color="rgba(255,255,255,0.6)" size={22} />
                        ) : (
                          <Eye color="rgba(255,255,255,0.6)" size={22} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* 🚀 Action Button */}
                <TouchableOpacity style={styles.button} onPress={handleAction}>
                  <LinearGradient
                    colors={["#ffffff", "#e0e0e0"]}
                    style={styles.pillButton}
                  >
                    <Text style={styles.buttonText}>{isLogin ? "LOGIN" : "REGISTER"}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* 🔑 Forgot Password (login only) */}
                {isLogin && (
                  <TouchableOpacity
                    onPress={() => setShowForgot(true)}
                    style={{ alignItems: 'center', marginTop: 16 }}
                  >
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* 🔁 Toggle Login/Register */}
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(!isLogin);
                  setName("");
                  setDob("");
                  setEmail("");
                  setContact("");
                  setUsername("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <Text style={styles.linkBold}>
                    {isLogin ? "Register" : "Login"}
                  </Text>
                </Text>
              </TouchableOpacity>


              {/* 🔁 Footer */}
              <TouchableOpacity onPress={handleFooterTap}>
                <Text style={styles.footer}>
                  Tactical Division | Established Command
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>

        {/* ⚙️ Hidden Settings Modal */}
        <Modal visible={showSettings} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>SECURE CONNECTION CONFIG</Text>
              <Text style={styles.label}>MAIN BACKEND API</Text>
              <TextInput
                style={styles.modalInput}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="https://..."
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
              <Text style={styles.label}>BIOMETRIC ENGINE API</Text>
              <TextInput
                style={styles.modalInput}
                value={biometricUrl}
                onChangeText={setBiometricUrl}
                placeholder="https://..."
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
              <Text style={styles.label}>STABLE CLOUD AI KEY (GEMINI)</Text>
              <TextInput
                style={styles.modalInput}
                value={geminiApiKey}
                onChangeText={setGeminiApiKey}
                placeholder="Paste API Key here..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={saveUrl}>
                  <Text style={styles.saveBtnText}>SAVE CONFIG</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#4285F4' }]} onPress={handleTestCloud}>
                  <Text style={[styles.saveBtnText, { color: '#fff' }]}>TEST CLOUD</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSettings(false)}>
                  <Text style={styles.closeBtnText}>ABORT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 🔑 Forgot Password Modal */}
        <Modal visible={showForgot} transparent animationType="slide" onRequestClose={() => setShowForgot(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>RESET PASSWORD</Text>

              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.modalInput}
                value={forgotUsername}
                onChangeText={setForgotUsername}
                placeholder="Your username"
                placeholderTextColor="rgba(255,255,255,0.3)"
                autoCapitalize="none"
              />

              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.modalInput}
                value={forgotNewPass}
                onChangeText={setForgotNewPass}
                placeholder="Min 4 characters"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry
              />

              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.modalInput}
                value={forgotConfirmPass}
                onChangeText={setForgotConfirmPass}
                placeholder="Re-enter new password"
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.saveBtn, forgotLoading && { opacity: 0.6 }]}
                  onPress={handleForgotPassword}
                  disabled={forgotLoading}
                >
                  <Text style={styles.saveBtnText}>{forgotLoading ? 'RESETTING...' : 'RESET PASSWORD'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={() => {
                  setShowForgot(false);
                  setForgotUsername(''); setForgotNewPass(''); setForgotConfirmPass('');
                }}>
                  <Text style={styles.closeBtnText}>CANCEL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: "5%",
    paddingTop: 70,
    paddingBottom: 60,
    alignItems: "center",
  },

  /* 🔰 Header */
  topHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: 80,
  },

  appName: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 3,
    textAlign: "center",
  },

  appTag: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
    marginTop: 8,
  },

  /* ✨ Glass Card */
  card: {
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 25,
    padding: 30,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    width: "90%",
    maxWidth: 450,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
    textAlign: "center",
    letterSpacing: 1,
  },

  /* 🔐 Inputs */
  inputContainer: {
    marginBottom: 25,
  },

  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    opacity: 1,
  },

  required: {
    color: "#ff4d4d",
    fontSize: 16,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 55,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  inputIcon: {
    marginLeft: 15,
  },

  boxInputWithIcon: {
    flex: 1,
    height: "100%",
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 15,
  },

  boxInputPasswordWithIcon: {
    flex: 1,
    height: "100%",
    color: "#fff",
    fontSize: 16,
    paddingLeft: 15,
    paddingRight: 50,
  },

  eyeBtn: {
    position: "absolute",
    right: 15,
  },

  /* 🚀 Button */
  button: {
    width: "100%",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },

  pillButton: {
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
    letterSpacing: 1,
    fontSize: 16,
  },

  /* 🔗 Links */
  linkContainer: {
    marginTop: 25,
    alignItems: "center",
  },

  linkText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },

  linkBold: {
    color: "#fff",
    fontWeight: "bold",
  },

  forgotText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
    letterSpacing: 0.5,
  },

  /* 🔻 Footer */
  footer: {
    marginTop: 40,
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.5,
    textAlign: "center",
  },

  /* ⚙️ Modal Styling */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: DARK,
    borderRadius: 20,
    padding: 30,
    borderWidth: 2,
    borderColor: GOLD,
  },
  modalTitle: {
    color: GOLD,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    letterSpacing: 2,
  },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    color: "#fff",
    padding: 15,
    fontSize: 14,
    marginBottom: 25,
  },
  modalActions: {
    flexDirection: "row",
    gap: 15,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: GOLD,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
  closeBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
