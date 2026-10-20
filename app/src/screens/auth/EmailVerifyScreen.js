import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Switch, TouchableOpacity
} from "react-native";
import { ShieldCheck, Mail, ArrowRight, User, LockKeyhole, LogIn, CheckCircle2 } from "lucide-react-native";
import { colors, borders, radii, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";

const ALLOWED_DOMAINS = ["@learner.manipal.edu", "@manipal.edu"];

export const EmailVerifyScreen = ({ navigation }) => {
  const { register, login } = useAuth();
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const signingUp = mode === "signup";

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setErrorMsg("");
  };

  const handleSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    setErrorMsg("");

    if (!ALLOWED_DOMAINS.some(domain => cleanEmail.endsWith(domain))) {
      setErrorMsg("Please enter an official Manipal email address.");
      return;
    }
    if (signingUp && !isAnonymous && cleanName.length < 2) {
      setErrorMsg("Enter your name, or turn on the anonymous profile option.");
      return;
    }
    if (password.length < 8 || password.length > 128) {
      setErrorMsg("Password must contain between 8 and 128 characters.");
      return;
    }
    if (signingUp && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (signingUp) {
        await register({ email: cleanEmail, name: cleanName, password, isAnonymous });
      } else {
        await login({ email: cleanEmail, password });
      }
      navigation.navigate("VerifiedDone");
    } catch (err) {
      setErrorMsg(err.message || `Could not ${signingUp ? "create your account" : "sign in"}.`);
      if (err.status === 409) {
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.heroBanner}>
          <View style={styles.shieldIconWrapper}>
            <ShieldCheck size={38} color={colors.onAccent} />
          </View>
          <Text style={styles.heroTitle}>{signingUp ? "Join CampSync" : "Welcome Back"}</Text>
          <Text style={styles.heroSubtitle}>
            {signingUp
              ? "Create a password-protected account with your official Manipal email."
              : "Sign in with your Manipal email and account password."}
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <PopCard accent={colors.violet} style={styles.card}>
            {signingUp && (
              <>
                <Text style={styles.inputLabel}>Display Name</Text>
                <View style={[styles.inputContainer, isAnonymous && styles.disabledInput]}>
                  <User size={18} color={colors.violet} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={isAnonymous ? "Anonymous Student" : "Your name"}
                    placeholderTextColor={colors.inkFaint}
                    value={name}
                    onChangeText={(text) => { setName(text); setErrorMsg(""); }}
                    autoCapitalize="words"
                    maxLength={80}
                    editable={!isAnonymous}
                  />
                </View>

                <View style={styles.anonymousRow}>
                  <View style={styles.anonymousCopy}>
                    <Text style={styles.anonymousTitle}>Keep my profile anonymous</Text>
                    <Text style={styles.anonymousHint}>Students will see “Anonymous Student”.</Text>
                  </View>
                  <Switch
                    value={isAnonymous}
                    onValueChange={(value) => { setIsAnonymous(value); setErrorMsg(""); }}
                    trackColor={{ false: colors.surfaceInset, true: colors.violet }}
                    thumbColor={colors.onAccent}
                  />
                </View>
              </>
            )}

            <Text style={styles.inputLabel}>Official Manipal Email</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color={colors.violet} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="yourname@learner.manipal.edu"
                placeholderTextColor={colors.inkFaint}
                value={email}
                onChangeText={(text) => { setEmail(text); setErrorMsg(""); }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <LockKeyhole size={18} color={colors.violet} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.inkFaint}
                value={password}
                onChangeText={(text) => { setPassword(text); setErrorMsg(""); }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={128}
              />
            </View>

            {signingUp && (
              <>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <LockKeyhole size={18} color={colors.violet} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter the same password again"
                    placeholderTextColor={colors.inkFaint}
                    value={confirmPassword}
                    onChangeText={(text) => { setConfirmPassword(text); setErrorMsg(""); }}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={128}
                  />
                </View>
              </>
            )}

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            {signingUp && (
              <View style={styles.domainsRow}>
                <CheckCircle2 size={13} color={colors.mint} />
                <Text style={styles.domainHint}>Supported: @learner.manipal.edu, @manipal.edu</Text>
              </View>
            )}

            <PopButton
              title={signingUp ? "Create Account" : "Sign In"}
              onPress={handleSubmit}
              loading={loading}
              accent={colors.violet}
              icon={signingUp ? ArrowRight : LogIn}
              block
            />

            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => changeMode(signingUp ? "login" : "signup")}
              disabled={loading}
            >
              <Text style={styles.modeButtonText}>
                {signingUp ? "Already have an account? Sign in" : "New to CampSync? Create account"}
              </Text>
            </TouchableOpacity>
          </PopCard>
        </View>

        <View style={styles.trustBadges}>
          <View style={styles.trustItem}>
            <ShieldCheck size={14} color={colors.mint} />
            <Text style={styles.trustText}>Password protected</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  scrollContent: { flexGrow: 1 },
  heroBanner: {
    backgroundColor: colors.violet, paddingTop: 60, paddingBottom: 50,
    paddingHorizontal: spacing.containerPadding, alignItems: "center",
    borderBottomLeftRadius: radii.xl, borderBottomRightRadius: radii.xl,
    ...borders.card, borderTopWidth: 0,
  },
  shieldIconWrapper: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.18)", borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)", alignItems: "center",
    justifyContent: "center", marginBottom: spacing.md,
  },
  heroTitle: { fontSize: 26, fontWeight: "800", color: colors.onAccent, textAlign: "center", marginBottom: spacing.sm },
  heroSubtitle: { fontSize: 14, color: "rgba(255, 255, 255, 0.85)", textAlign: "center", paddingHorizontal: spacing.md, lineHeight: 22 },
  cardContainer: { paddingHorizontal: spacing.containerPadding, marginTop: -30 },
  card: { padding: spacing.lg },
  inputLabel: { ...typography.label, marginBottom: spacing.sm },
  inputContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceInset,
    borderRadius: radii.sm, ...borders.card, paddingHorizontal: spacing.md, marginBottom: spacing.md,
  },
  disabledInput: { opacity: 0.55 },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, height: 48, color: colors.ink, fontSize: 15 },
  anonymousRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg, gap: spacing.md },
  anonymousCopy: { flex: 1 },
  anonymousTitle: { fontSize: 14, fontWeight: "700", color: colors.ink },
  anonymousHint: { fontSize: 12, color: colors.inkFaint, marginTop: 2 },
  errorText: { fontSize: 12, color: colors.rose, marginBottom: spacing.sm, fontWeight: "600" },
  domainsRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.lg },
  domainHint: { fontSize: 12, color: colors.inkFaint, flex: 1 },
  modeButton: { alignItems: "center", paddingTop: spacing.lg },
  modeButtonText: { fontSize: 13, color: colors.violet, fontWeight: "700" },
  trustBadges: { alignItems: "center", paddingVertical: spacing.xl },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  trustText: { fontSize: 12, color: colors.inkSoft, fontWeight: "600" },
});
