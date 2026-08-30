import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { colors, radii, spacing } from "../../theme/theme";

export const SkeletonLoader = ({ count = 3 }) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <Animated.View key={idx} style={[styles.card, { opacity: opacityAnim }]}>
          <View style={styles.row}>
            <View style={styles.avatarPlaceholder} />
            <View style={styles.metaPlaceholder}>
              <View style={styles.lineShort} />
              <View style={styles.lineTiny} />
            </View>
          </View>
          <View style={styles.titlePlaceholder} />
          <View style={styles.bodyPlaceholder} />
          <View style={[styles.bodyPlaceholder, { width: "70%" }]} />
          <View style={styles.footerPlaceholder} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.containerPadding,
    gap: spacing.md
  },
  card: {
    backgroundColor: colors.bgGlass,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderGlass
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  },
  metaPlaceholder: {
    marginLeft: spacing.sm,
    gap: 6
  },
  lineShort: {
    width: 100,
    height: 12,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  },
  lineTiny: {
    width: 60,
    height: 10,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.06)"
  },
  titlePlaceholder: {
    width: "85%",
    height: 18,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    marginBottom: spacing.sm
  },
  bodyPlaceholder: {
    width: "100%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 6
  },
  footerPlaceholder: {
    width: "40%",
    height: 24,
    borderRadius: radii.full,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginTop: spacing.sm
  }
});
