import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  User, Mail, BadgeCheck, LogOut, Settings, Bell
} from "lucide-react-native";
import { colors, shadows, borders, radii, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";
import { PopHeader } from "../../components/common/PopHeader";

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const displayName = user?.name || "Student";

  return (
    <View style={styles.container}>
      <PopHeader
        title="Profile"
        accent={colors.violet}
        icon={User}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Student Identity Card */}
        <PopCard accent={colors.violet} style={styles.identityCard}>
          <View style={styles.identityRow}>
            <PopAvatar name={displayName} size={60} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{displayName}</Text>
              <View style={styles.emailRow}>
                <Mail size={13} color={colors.inkFaint} />
                <Text style={styles.email}>{user?.email || "student@campus.edu"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.verifiedStrip}>
            <BadgeCheck size={16} color={colors.mint} strokeWidth={2.4} />
            <Text style={styles.verifiedText}>Verified Student</Text>
          </View>
        </PopCard>

        {/* Stats */}
        <PopCard style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Campus Activity</Text>
          <View style={styles.statsGrid}>
            {[
              { label: "Posts", value: "—", color: colors.violet },
              { label: "Bids", value: "—", color: colors.coral },
              { label: "Rides", value: "—", color: colors.mint },
              { label: "Tasks", value: "—", color: colors.sun },
            ].map(stat => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </PopCard>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <PopButton
            title="Sign Out"
            onPress={logout}
            variant="outline"
            accent={colors.rose}
            icon={LogOut}
            block
          />
        </View>

        <Text style={styles.footerText}>CampusSync v1.0 — One app for the whole campus</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  scrollContent: { padding: spacing.containerPadding, paddingBottom: 40, gap: 16 },
  identityCard: { padding: 24 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  name: { fontSize: 20, fontWeight: "800", color: colors.ink, marginBottom: 4 },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  email: { fontSize: 13, color: colors.inkSoft },
  verifiedStrip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.mintSoft, borderRadius: radii.sm, ...borders.card,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  verifiedText: { fontSize: 13, fontWeight: "700", color: colors.mint },
  statsCard: { padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.ink, marginBottom: 14 },
  statsGrid: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] },
  statLabel: { fontSize: 11, fontWeight: "600", color: colors.inkFaint },
  actionsSection: { gap: 12 },
  footerText: { fontSize: 12, color: colors.inkFaint, textAlign: "center", marginTop: 16 },
});
