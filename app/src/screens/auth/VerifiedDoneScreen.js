import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BadgeCheck, Sparkles, ArrowRight } from "lucide-react-native";
import { colors, borders, radii, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";

export const VerifiedDoneScreen = () => {
  const { user, enterCampus } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        {/* Celebration Badge */}
        <View style={styles.badgeCircle}>
          <BadgeCheck size={48} color={colors.mint} strokeWidth={2} />
        </View>

        <Text style={styles.congratsTitle}>You're Verified!</Text>
        <Text style={styles.congratsSub}>
          Welcome to the campus network. Every member here is a real, verified student.
        </Text>

        {/* Student Card */}
        <PopCard accent={colors.violet} style={styles.profileCard}>
          <View style={styles.profileRow}>
            <PopAvatar name={user?.name || "Student"} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user?.name || "Student"}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Sparkles size={12} color={colors.violet} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </PopCard>

        <PopButton
          title="Enter Campus"
          onPress={enterCampus}
          accent={colors.violet}
          icon={ArrowRight}
          block
          size="lg"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.containerPadding,
  },
  badgeCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.mintSoft,
    ...borders.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  congratsTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  congratsSub: {
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  profileCard: {
    width: "100%",
    padding: spacing.lg,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.violetSoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    ...borders.card,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.violet,
  },
});
