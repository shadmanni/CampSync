import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { User, ShieldCheck, LogOut, Mail, Building, MapPin, ArrowLeft } from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <PopCard style={styles.userCard}>
          <PopAvatar name={user?.name || "Alex Rivera"} size={72} accentColor={colors.violet} />
          <Text style={styles.userName}>{user?.name || "Alex Rivera"}</Text>
          <View style={styles.verifiedTag}>
            <ShieldCheck size={14} color={colors.mint} />
            <Text style={styles.verifiedText}>Verified Student Member</Text>
          </View>
        </PopCard>

        {/* Info Items */}
        <PopCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Mail size={16} color={colors.violet} />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>COLLEGE EMAIL</Text>
              <Text style={styles.infoValue}>{user?.email || "alex.tech@college.edu"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Building size={16} color={colors.violet} />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>DEPARTMENT</Text>
              <Text style={styles.infoValue}>{user?.department || "Computer Science"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <MapPin size={16} color={colors.violet} />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>HOSTEL RESIDENCE</Text>
              <Text style={styles.infoValue}>{user?.hostel || "Hostel Block A"}</Text>
            </View>
          </View>
        </PopCard>

        {/* Logout Button */}
        <PopButton
          title="Sign Out of Campus"
          onPress={logout}
          variant="surface"
          size="lg"
          icon={<LogOut size={18} color={colors.danger} />}
          textStyle={{ color: colors.danger }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.lineStrong
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100
  },
  userCard: {
    alignItems: "center",
    padding: 24,
    marginBottom: 16
  },
  userName: {
    ...typography.h2,
    fontSize: 22,
    marginTop: 12,
    marginBottom: 6
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.mintSoft,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full
  },
  verifiedText: {
    ...typography.bodySm,
    color: colors.mint,
    fontWeight: "800",
    fontSize: 11
  },
  infoCard: {
    padding: 16,
    marginBottom: 20
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.violetSoft,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center"
  },
  infoMeta: {
    flex: 1
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.inkFaint,
    letterSpacing: 0.5,
    marginBottom: 2
  },
  infoValue: {
    ...typography.body,
    fontWeight: "700",
    color: colors.ink
  },
  divider: {
    height: 1.5,
    backgroundColor: colors.line,
    marginVertical: 12
  }
});
