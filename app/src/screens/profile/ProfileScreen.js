import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ShieldCheck, LogOut, Mail, Building, MapPin, Sparkles } from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { HeaderBar } from "../../components/common/HeaderBar";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Student Profile"
        subtitle="Identity & Account Settings"
        accentColor={colors.violet}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <PopCard style={styles.userCard}>
          <PopAvatar name={user?.name || "Student"} size={68} />
          <Text style={styles.userName}>{user?.name || "Alex Rivera"}</Text>

          <View style={styles.verifiedTag}>
            <ShieldCheck size={14} color={colors.mint} />
            <Text style={styles.verifiedText}>Verified Student Member</Text>
          </View>
        </PopCard>

        {/* Profile Info Items */}
        <PopCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.violetSoft }]}>
              <Mail size={16} color={colors.violet} />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>COLLEGE EMAIL</Text>
              <Text style={styles.infoValue}>{user?.email || "alex.tech@college.edu"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.mintSoft }]}>
              <Building size={16} color={colors.mint} />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>DEPARTMENT</Text>
              <Text style={styles.infoValue}>{user?.department || "Computer Science"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={[styles.infoIconCircle, { backgroundColor: colors.coralSoft }]}>
              <MapPin size={16} color={colors.coral} />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>HOSTEL RESIDENCE</Text>
              <Text style={styles.infoValue}>{user?.hostel || "Hostel Block A"}</Text>
            </View>
          </View>
        </PopCard>

        {/* Sign Out Button */}
        <PopButton
          title="Sign Out of Campus"
          onPress={logout}
          variant="surface"
          size="lg"
          icon={<LogOut size={18} color={colors.ink} />}
          style={styles.logoutBtn}
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
  scrollContent: {
    padding: spacing.containerPadding,
    paddingBottom: 90
  },
  userCard: {
    alignItems: "center",
    padding: spacing.xl,
    marginBottom: spacing.lg
  },
  userName: {
    ...typography.title,
    fontSize: 22,
    marginTop: spacing.md,
    marginBottom: 6
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.mintSoft,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    ...shadows.hardSm
  },
  verifiedText: {
    ...typography.badge,
    color: colors.mint,
    fontSize: 11.5
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  },
  infoMeta: {
    flex: 1
  },
  infoLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.inkFaint,
    marginBottom: 2
  },
  infoValue: {
    ...typography.badge,
    color: colors.ink,
    fontSize: 14
  },
  divider: {
    height: 1.5,
    backgroundColor: colors.line,
    marginVertical: spacing.md
  },
  logoutBtn: {
    width: "100%"
  }
});
