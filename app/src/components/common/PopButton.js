import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, shadows, borders, radii, typography } from '../../theme/theme';

/**
 * PopButton — accent-filled button with ink border and 3px hard shadow.
 * On press, translates +2px and reduces shadow (spring-back feedback).
 *
 * Variants: 'primary' | 'outline' | 'ghost' | 'soft'
 */
export function PopButton({
  children,
  title,
  onPress,
  accent = colors.violet,
  variant = 'primary',
  size = 'md',
  block = false,
  disabled = false,
  loading = false,
  icon: Icon,
  style,
}) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGhost   = variant === 'ghost';
  const isSoft    = variant === 'soft';

  const bgColor = isPrimary ? accent
    : isSoft ? accent + '18'
    : 'transparent';

  const textColor = isPrimary ? colors.onAccent
    : isGhost ? colors.inkSoft
    : accent;

  const borderStyle = isGhost ? {} : {
    borderWidth: 1.5,
    borderColor: isPrimary ? colors.lineStrong : isOutline ? accent : 'transparent',
  };

  const shadowStyle = (isPrimary || isOutline) ? shadows.hardSm : {};

  const sizeStyles = size === 'sm'
    ? { paddingVertical: 8, paddingHorizontal: 14 }
    : size === 'lg'
    ? { paddingVertical: 16, paddingHorizontal: 24 }
    : { paddingVertical: 12, paddingHorizontal: 20 };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        sizeStyles,
        { backgroundColor: bgColor },
        borderStyle,
        shadowStyle,
        block && { width: '100%' },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : 16} color={textColor} strokeWidth={2.6} />}
          {(title || children) && (
            <Text style={[styles.label, { color: textColor }]}>
              {title || children}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radii.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
});
