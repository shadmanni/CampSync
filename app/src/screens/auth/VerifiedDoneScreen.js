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
        {/* Badge Icon */}
        <View style={styles.badgeWrapper}>
          <ShieldCheck size={52} color={colors.mint} />
          <View style={styles.checkPill}>
            <Check size={14} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>You're Verified!</Text>
        <Text style={styles.subtitle}>
          Welcome to the verified CampusSync student network. Your university identity has been authenticated.
        </Text>

        {/* Student Profile Card */}
        <PopCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <PopAvatar name={user?.name || "Alex Rivera"} size={48} accentColor={colors.violet} />
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
              <Text style={styles.detailLabel}>STATUS</Text>
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
          icon={<ArrowRight size={18} color="#FFFFFF" />}
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
    borderColor: colors.lineStrong,
    ...shadows.hard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg
  },
  checkPill: {
    position: "absolute",
    bottom: 2,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.mint,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.lineStrong
  },
  title: {
    ...typography.h1,
    textAlign: "center",
    marginBottom: spacing.xs
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
    marginBottom: spacing.xl
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  profileMeta: {
    flex: 1
  },
  userName: {
    ...typography.h3,
    fontSize: 18
  },
  userEmail: {
    ...typography.bodySm,
    color: colors.violet,
    fontWeight: "700",
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
    ...typography.bodySm,
    fontSize: 10,
    color: colors.inkFaint,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4
  },
  detailValue: {
    ...typography.body,
    color: colors.ink,
    fontWeight: "700"
  },
  continueBtn: {
    width: "100%"
  }
});
