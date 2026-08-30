import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShieldCheck, Check, ArrowRight } from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";

export const VerifiedDoneScreen = () => {
  const { user, enterCampus } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Celebration Shield */}
        <View style={styles.badgeWrapper}>
          <ShieldCheck size={52} color={colors.mint} />
          <View style={styles.checkPill}>
            <Check size={14} color={colors.surface} />
          </View>
        </View>

        <Text style={styles.title}>You're Verified!</Text>
        <Text style={styles.subtitle}>
          Welcome to the verified CampusSync student network. Your university identity is authenticated.
        </Text>

        {/* Student Profile Card */}
        <PopCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <PopAvatar name={user?.name || "Student"} size={48} />
            <View style={styles.profileMeta}>
              <Text style={styles.userName}>{user?.name || "Alex Rivera"}</Text>
              <Text style={styles.userEmail}>{user?.email || "alex.tech@college.edu"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>DEPARTMENT</Text>
              <Text style={styles.detailValue}>{user?.department || "Computer Science"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>CAMPUS STATUS</Text>
              <Text style={[styles.detailValue, { color: colors.mint }]}>Active & Verified</Text>
            </View>
          </View>
        </PopCard>

        {/* Continue Button */}
        <PopButton
          title="Enter Campus Hub"
          onPress={enterCampus}
          variant="violet"
          size="lg"
          icon={<ArrowRight size={18} color={colors.surface} />}
          style={styles.continueBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: "center",
    padding: spacing.containerPadding
  },
  content: {
    alignItems: "center"
  },
  badgeWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.mintSoft,
    borderWidth: 2,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    ...shadows.hard
  },
  checkPill: {
    position: "absolute",
    bottom: 0,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.mint,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    ...typography.hero,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 4
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm
  },
  profileCard: {
    width: "100%",
    padding: spacing.lg,
    marginBottom: spacing.xl
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center"
  },
  profileMeta: {
    marginLeft: spacing.md,
    flex: 1
  },
  userName: {
    ...typography.heading,
    fontSize: 18
  },
  userEmail: {
    ...typography.bodySm,
    color: colors.violet,
    fontWeight: "600",
    marginTop: 2
  },
  divider: {
    height: 1.5,
    backgroundColor: colors.line,
    marginVertical: spacing.md
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  detailItem: {
    flex: 1
  },
  detailLabel: {
    ...typography.caption,
    color: colors.inkFaint,
    fontSize: 10.5,
    marginBottom: 2
  },
  detailValue: {
    ...typography.badge,
    color: colors.ink,
    fontSize: 13
  },
  continueBtn: {
    width: "100%"
  }
});
