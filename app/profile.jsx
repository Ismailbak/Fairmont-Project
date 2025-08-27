// app/profile.jsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Modal,
  TextInput,
  Image,
  Button,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";

export default function ProfileSettings() {
  const router = useRouter();
  // ---- App state (fetch from AuthService or context)
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  React.useEffect(() => {
    (async () => {
      try {
        const { AuthService } = await import("../src/services/authService");
        const user = await AuthService.getUser();
        setUserName(user?.full_name || "");
        setEmail(user?.email || "");
      } catch {
        setUserName("");
        setEmail("");
      }
    })();
  }, []);
  const [avatar, setAvatar] = useState(null);

  // Toggles / modals
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileModal, setProfileModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [policyModal, setPolicyModal] = useState(false);
  const [termsModal, setTermsModal] = useState(false);

  // Password fields
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.length) {
      setAvatar(result.assets[0].uri);
    }
  }, []);

  // --- Save handlers (stubbed; plug in your services)
  const saveProfile = () => {
    // TODO: call your API with { email, avatar }
    setProfileModal(false);
    Alert.alert("Saved", "Your profile changes have been saved.");
  };

  const savePassword = () => {
    if (!oldPw || !newPw || !confirmPw) {
      Alert.alert("Missing info", "Please fill all fields.");
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert("Mismatch", "New passwords do not match.");
      return;
    }
    // TODO: call your API with { oldPw, newPw }
    setPasswordModal(false);
    setOldPw(""); setNewPw(""); setConfirmPw("");
    Alert.alert("Password changed", "Your password has been updated.");
  };

  const signOut = async () => {
    try {
      if (global.AuthService?.signout) {
        await global.AuthService.signout();
      } else {
        const { AuthService } = await import("../src/services/authService");
        await AuthService.signout();
      }
    } catch (e) {}
    router.replace("/signin");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
            <Icon name="arrow-left" size={22} color="#8B7355" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Profile */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={() => setProfileModal(true)} activeOpacity={0.8}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: "#8B7355" }]}>
                <Text style={styles.avatarText}>
                  {(userName?.trim?.()?.[0] || email?.[0] || "U").toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
          </View>

          <TouchableOpacity onPress={() => setProfileModal(true)}>
            <Icon name="edit-2" size={20} color="#8B7355" />
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.card}>
          <Row
            icon="bell"
            label="Push Notifications"
            subLabel="Receive chat notifications"
            toggleValue={notificationsEnabled}
            onToggle={() => setNotificationsEnabled((v) => !v)}
          />
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Row icon="lock" label="Change Password" arrow onPress={() => setPasswordModal(true)} />
          <Row icon="shield" label="Privacy Policy" arrow onPress={() => setPolicyModal(true)} />
          <Row icon="file-text" label="Terms of Service" arrow onPress={() => setTermsModal(true)} />
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ------------------- MODALS ------------------- */}

      {/* Edit Profile */}
      <Modal visible={profileModal} animationType="slide" transparent onRequestClose={() => setProfileModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TouchableOpacity style={styles.avatarPicker} onPress={pickImage} activeOpacity={0.8}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarLarge} />
              ) : (
                <View style={[styles.avatarLarge, { backgroundColor: "#EDE7DF" }]}>
                  <Icon name="camera" size={22} color="#8B7355" />
                </View>
              )}
              <Text style={styles.avatarPickerText}>Change picture</Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <Button title="Save" onPress={saveProfile} />
              <Button title="Cancel" color="#b00020" onPress={() => setProfileModal(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password */}
      <Modal visible={passwordModal} animationType="slide" transparent onRequestClose={() => setPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              placeholder="Current Password"
              placeholderTextColor="#6c5c43"
              secureTextEntry
              value={oldPw}
              onChangeText={setOldPw}
              style={styles.input}
            />
            <TextInput
              placeholder="New Password"
              placeholderTextColor="#6c5c43"
              secureTextEntry
              value={newPw}
              onChangeText={setNewPw}
              style={styles.input}
            />
            <TextInput
              placeholder="Confirm New Password"
              placeholderTextColor="#6c5c43"
              secureTextEntry
              value={confirmPw}
              onChangeText={setConfirmPw}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <Button title="Change" onPress={savePassword} />
              <Button title="Cancel" color="#b00020" onPress={() => setPasswordModal(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy */}
      <Modal visible={policyModal} animationType="slide" transparent onRequestClose={() => setPolicyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: "75%" }]}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <ScrollView style={{ marginBottom: 12 }}>
              <Text style={styles.legalText}>
                We value your privacy. Your data is securely stored and never shared with third
                parties without your consent. You can request deletion of your data at any time.
                (Replace this text with your real policy.)
              </Text>
            </ScrollView>
            <Button title="Close" onPress={() => setPolicyModal(false)} />
          </View>
        </View>
      </Modal>

      {/* Terms of Service */}
      <Modal visible={termsModal} animationType="slide" transparent onRequestClose={() => setTermsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: "75%" }]}>
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <ScrollView style={{ marginBottom: 12 }}>
              <Text style={styles.legalText}>
                By using this app, you agree to use it responsibly and not misuse any features.
                The app is provided as-is without warranty. (Replace with your real TOS.)
              </Text>
            </ScrollView>
            <Button title="Close" onPress={() => setTermsModal(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- Row Component ---------------- */
function Row({ icon, label, subLabel, toggleValue, onToggle, arrow, onPress }) {
  const Right = () => {
    if (typeof onToggle === "function") {
      return (
        <Switch
          value={Boolean(toggleValue)}
          onValueChange={onToggle}
          trackColor={{ false: "#E5E5E5", true: "#8B7355" }}
          thumbColor="#fff"
        />
      );
    }
    if (arrow) return <Icon name="chevron-right" size={20} color="#aaa" />;
    return null;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      style={styles.row}
    >
      <View style={styles.rowLeft}>
        <Icon name={icon} size={20} color="#8B7355" style={{ marginRight: 12 }} />
        <View>
          <Text style={styles.rowLabel}>{label}</Text>
          {subLabel ? <Text style={styles.rowSubLabel}>{subLabel}</Text> : null}
        </View>
      </View>
      <Right />
    </TouchableOpacity>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#222" },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F4F0",
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  profileName: { fontSize: 18, fontWeight: "700", color: "#222" },
  profileEmail: { fontSize: 14, color: "#777" },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
    marginTop: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#F6F4F0",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E8E2DA",
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  rowLabel: { fontSize: 16, color: "#222", fontWeight: "600" },
  rowSubLabel: { fontSize: 12, color: "#777", marginTop: 2 },

  signOutBtn: {
    backgroundColor: "#fff",
    borderColor: "#F0D5D6",
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  signOutText: { textAlign: "center", color: "#dc3545", fontWeight: "700", fontSize: 16 },

  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#E5DED5",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },

  avatarPicker: { alignItems: "center", marginBottom: 14 },
  avatarLarge: { width: 88, height: 88, borderRadius: 44, marginBottom: 8 },
  avatarPickerText: { color: "#8B7355", fontWeight: "600" },

  legalText: { fontSize: 14, color: "#555", lineHeight: 20 },
});
