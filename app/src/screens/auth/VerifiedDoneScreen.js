import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShieldCheck, Check, ArrowRight, Award, Sparkles } from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { GlassCard } from "../../components/common/GlassCard";
import { PrimaryButton } from "../../components/common/PrimaryButton";

export const VerifiedDoneScreen = () => {
  const { user, enterCampus } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Badge Icon */}
        <View style={styles.badgeWrapper}>
          <ShieldCheck size={56} color={colors.accentEmerald} />
          <View style={styles.checkPill}>
            <Check size={16} color={colors.textInverse} />
          </View>
        </View>

        <Text style={styles.title}>You're Verified!</Text>
        <Text style={styles.subtitle}>
          Welcome to the verified CampusSync student network. Your university identity has been authenticated.
        </Text>

        {/* Student Profile Card */}
        <GlassCard style={styles.profileCard} variant="highlight">
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
              </Text>
            </View>
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
              <Text style={[styles.detailValue, { color: colors.accentEmerald }]}>Active & Verified</Text>
            </View>
          </View>
        </GlassCard>

        {/* Continue Button */}
        <PrimaryButton
          title="Enter Campus Hub"
          onPress={enterCampus}
          icon={<ArrowRight size={18} color={colors.textInverse} />}
          style={styles.continueBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    justifyContent: "center",
    padding: spacing.containerPadding
  },
  content: {
    alignItems: "center"
  },
  badgeWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.accentEmeraldLight,
    borderWidth: 3,
    borderColor: "rgba(16, 185, 129, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg
  },
  checkPill: {
    position: "absolute",
    bottom: 2,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentEmerald,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.xs
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 22,
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
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md
  },
  avatarLetter: {
    ...typography.h2,
    color: colors.textInverse,
    fontSize: 22
  },
  profileMeta: {
    flex: 1
  },
  userName: {
    ...typography.h3,
    color: colors.primary,
    fontSize: 18
  },
  userEmail: {
    ...typography.bodySm,
    color: colors.primaryLight,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderGlass,
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
    color: colors.textSubtle,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4
  },
  detailValue: {
    ...typography.body,
    color: colors.textMain,
    fontWeight: "700"
  },
  continueBtn: {
    width: "100%"
  }
});
