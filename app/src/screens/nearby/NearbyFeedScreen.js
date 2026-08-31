import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl
} from "react-native";
import { Compass, MapPin, Copy, Check, Tag, Store } from "lucide-react-native";
import { colors, shadows, borders, radii, spacing, typography } from "../../theme/theme";
import { nearbyService } from "../../services/nearbyService";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopHeader } from "../../components/common/PopHeader";
import { PopButton } from "../../components/common/PopButton";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/SkeletonLoader";
import * as Clipboard from "expo-clipboard";

const ACCENT = colors.sky;
const CATEGORIES = ["All", "Food", "Shopping", "Services", "Entertainment"];

export const NearbyFeedScreen = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("All");

  const load = useCallback(async () => {
    try {
      const data = await nearbyService.getDeals(category);
      setDeals(data?.deals || data || []);
    } catch (err) {
      console.warn("[NearbyFeed] Load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const renderDeal = ({ item }) => <DealCard deal={item} />;

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusNearby"
        subtitle={`${deals.length} student deal${deals.length !== 1 ? "s" : ""}`}
        accent={ACCENT}
        icon={Compass}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
        {CATEGORIES.map(cat => (
          <PopPill key={cat} label={cat} active={category === cat} onPress={() => setCategory(cat)} accent={ACCENT} />
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ padding: spacing.containerPadding, gap: 16 }}>
          <SkeletonCard /><SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={deals}
          keyExtractor={item => item._id || item.id}
          renderItem={renderDeal}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          ListEmptyComponent={
            <EmptyState icon={Store} title="No deals nearby right now" hint="Local businesses post exclusive student discounts here." />
          }
        />
      )}
    </View>
  );
};

function DealCard({ deal }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (deal.promoCode) {
      try { await Clipboard.setStringAsync(deal.promoCode); } catch {}
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PopCard accent={ACCENT} style={styles.dealCard}>
      <View style={styles.topRow}>
        <View style={[styles.discountBadge, { backgroundColor: colors.skySoft }]}>
          <Tag size={12} color={ACCENT} strokeWidth={2.6} />
          <Text style={[styles.discountText, { color: ACCENT }]}>{deal.discount}</Text>
        </View>
        {deal.distance && (
          <View style={styles.distanceBadge}>
            <MapPin size={11} color={colors.inkFaint} strokeWidth={2.4} />
            <Text style={styles.distanceText}>{deal.distance}</Text>
          </View>
        )}
      </View>

      <Text style={styles.dealTitle} numberOfLines={2}>{deal.businessName || deal.title}</Text>
      <Text style={styles.dealDesc} numberOfLines={2}>{deal.description}</Text>

      {deal.category && (
        <View style={styles.categoryRow}>
          <Text style={styles.categoryText}>{deal.category}</Text>
        </View>
      )}

      {deal.promoCode && (
        <TouchableOpacity style={styles.promoBox} onPress={handleCopy} activeOpacity={0.7}>
          <Text style={styles.promoCode}>{deal.promoCode}</Text>
          {copied ? (
            <Check size={16} color={colors.mint} strokeWidth={2.6} />
          ) : (
            <Copy size={16} color={ACCENT} strokeWidth={2} />
          )}
        </TouchableOpacity>
      )}

      {deal.validUntil && (
        <Text style={styles.validText}>Valid until {deal.validUntil}</Text>
      )}
    </PopCard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  pillsRow: { paddingHorizontal: spacing.containerPadding, paddingVertical: 12, gap: 8 },
  listContent: { paddingHorizontal: spacing.containerPadding, paddingBottom: 100, gap: 16 },
  dealCard: { padding: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  discountBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.pill, ...borders.card },
  discountText: { fontSize: 13, fontWeight: "800" },
  distanceBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.pill, backgroundColor: colors.surfaceInset, ...borders.card },
  distanceText: { fontSize: 11, fontWeight: "600", color: colors.inkFaint },
  dealTitle: { fontSize: 16, fontWeight: "700", color: colors.ink, marginBottom: 6, lineHeight: 22 },
  dealDesc: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 12 },
  categoryRow: { marginBottom: 12 },
  categoryText: { fontSize: 11, fontWeight: "600", color: colors.inkFaint },
  promoBox: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.surfaceInset, borderRadius: radii.sm, ...borders.card,
    paddingHorizontal: 16, paddingVertical: 12, marginBottom: 10,
  },
  promoCode: { fontSize: 16, fontWeight: "800", color: colors.ink, letterSpacing: 2, fontVariant: ["tabular-nums"] },
  validText: { fontSize: 11, color: colors.inkFaint },
});
