import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { User, ShieldCheck, LogOut, Mail, Building, MapPin } from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { HeaderBar } from "../../components/common/HeaderBar";
import { GlassCard } from "../../components/common/GlassCard";
import { PrimaryButton } from "../../components/common/PrimaryButton";

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <HeaderBar title="Student Profile" subtitle="Account & Verification" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <GlassCard style={styles.userCard} variant="highlight">
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || "Alex Rivera"}</Text>
          <View style={styles.verifiedTag}>
            <ShieldCheck size={14} color={colors.accentEmerald} />
            <Text style={styles.verifiedText}>Verified Student Member</Text>
          </View>
        </GlassCard>

        {/* Profile Info Items */}
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Mail size={18} color={colors.primary} />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>COLLEGE EMAIL</Text>
              <Text style={styles.infoValue}>{user?.email || "alex.tech@college.edu"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Building size={18} color={colors.primary} />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>DEPARTMENT</Text>
              <Text style={styles.infoValue}>{user?.department || "Computer Science"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <MapPin size={18} color={colors.primary} />
            </View>
            <View style={styles.infoMeta}>
              <Text style={styles.infoLabel}>HOSTEL RESIDENCE</Text>
              <Text style={styles.infoValue}>{user?.hostel || "Hostel Block A"}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Sign Out Button */}
        <PrimaryButton
          title="Sign Out of Campus"
          onPress={logout}
          variant="outline"
          icon={<LogOut size={18} color={colors.primary} />}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary
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
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4
  },
  avatarLetter: {
    ...typography.h1,
    color: colors.textInverse,
    fontSize: 32
  },
  userName: {
    ...typography.h2,
    color: colors.primary,
    fontSize: 22,
    marginBottom: 6
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accentEmeraldLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full
  },
  verifiedText: {
    ...typography.bodySm,
    color: colors.accentEmerald,
    fontWeight: "700",
    fontSize: 12
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
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgDim,
    alignItems: "center",
    justifyContent: "center"
  },
  infoMeta: {
    flex: 1
  },
  infoLabel: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.textSubtle,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600"
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderGlass,
    marginVertical: spacing.md
  },
  logoutBtn: {
    borderColor: colors.borderHighlight
  }
});
