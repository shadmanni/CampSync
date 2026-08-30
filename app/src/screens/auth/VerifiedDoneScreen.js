import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShieldCheck, Sparkles, Check, ArrowRight } from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { GlassCard } from "../../components/common/GlassCard";
import { PrimaryButton } from "../../components/common/PrimaryButton";

export const VerifiedDoneScreen = ({ navigation }) => {
  const { user, enterCampus } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Badge Icon */}
        <View style={styles.badgeWrapper}>
          <ShieldCheck size={54} color={colors.accentEmerald} />
          <View style={styles.checkPill}>
            <Check size={14} color={colors.textMain} />
          </View>
        </View>

        <Text style={styles.title}>You're Verified!</Text>
        <Text style={styles.subtitle}>
          Welcome to the verified CampusSync student network. Your identity has been authenticated.
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
              <Text style={styles.userName}>{user?.name || "Verified Student"}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
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
              <Text style={[styles.detailValue, { color: colors.accentEmerald }]}>Active & Verified</Text>
            </View>
          </View>
        </GlassCard>

        {/* Continue Button */}
        <PrimaryButton
          title="Enter Campus Hub"
          onPress={() => {
            enterCampus();
          }}
          icon={<ArrowRight size={18} color={colors.textMain} />}
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
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg
  },
  checkPill: {
    position: "absolute",
    bottom: 2,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentEmerald,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    ...typography.h1,
    textAlign: "center",
    marginBottom: spacing.sm
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md
  },
  avatarLetter: {
    ...typography.h2,
    fontSize: 20
  },
  profileMeta: {
    flex: 1
  },
  userName: {
    ...typography.h3,
    fontSize: 17
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
    fontWeight: "600"
  },
  continueBtn: {
    width: "100%"
  }
});
