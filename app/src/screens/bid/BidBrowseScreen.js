import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, ScrollView, RefreshControl
} from "react-native";
import {
  Gavel, Plus, TrendingUp, Timer, Flame, PackageOpen, X, Send
} from "lucide-react-native";
import { colors, shadows, borders, radii, spacing, typography } from "../../theme/theme";
import { bidService } from "../../services/bidService";
import { socketService } from "../../services/socketService";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";
import { PopPill } from "../../components/common/PopPill";
import { PopHeader } from "../../components/common/PopHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/SkeletonLoader";

const ACCENT = colors.coral;
const QUICK_RAISES = [50, 100, 500];

function useCountdown(item) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  let deadline = null;
  if (item.endsAt) {
    const t = new Date(item.endsAt).getTime();
    if (!Number.isNaN(t)) deadline = t;
  }
  if (!deadline) {
    const m = /in\s+(\d+)\s*(minute|hour|day)/i.exec(item.expiresAt || "");
    if (m) {
      const unit = { minute: 60000, hour: 3600000, day: 86400000 }[m[2].toLowerCase()];
      deadline = Date.now() + Number(m[1]) * unit;
    }
  }
  if (!deadline) return null;
  const left = deadline - now;
  if (left <= 0) return { text: "Closed", urgent: true, expired: true };
  const h = Math.floor(left / 3600000);
  const min = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return {
    text: h > 0 ? `${h}h ${String(min).padStart(2, "0")}m` : `${min}:${String(s).padStart(2, "0")}`,
    urgent: left < 3600000,
    expired: false,
  };
}

export const BidBrowseScreen = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bidTarget, setBidTarget] = useState(null);
  const [listOpen, setListOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await bidService.getItems();
      setItems(data?.items || data || []);
    } catch (err) {
      console.warn("[BidBrowse] Load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  // Real-time: listen for bid updates from other clients
  useEffect(() => {
    socketService.connect();
    const handler = ({ itemId, currentBid, highestBidderName, bidCount }) => {
      setItems(prev => prev.map(it =>
        (it.id || it._id) === itemId
          ? { ...it, currentBid, highestBidderName, bidCount }
          : it
      ));
    };
    socketService.on("bid:new_highest", handler);
    return () => socketService.off("bid:new_highest", handler);
  }, []);

  const handleBid = async (item, amount) => {
    try {
      const res = await bidService.placeBid(item._id || item.id, amount, user?.name);
      setItems(prev => prev.map(it =>
        (it._id || it.id) === (item._id || item.id)
          ? { ...it, currentBid: res.currentBid || amount, bidCount: (res.bidCount || (it.bidCount || 0) + 1), highestBidderName: user?.name }
          : it
      ));
      setBidTarget(null);
    } catch (err) {
      console.warn("[BidBrowse] Bid error:", err);
    }
  };

  const handleList = async (payload) => {
    try {
      const created = await bidService.createItem(payload);
      setItems(prev => [created, ...prev]);
      setListOpen(false);
    } catch (err) {
      console.warn("[BidBrowse] List error:", err);
    }
  };

  const renderItem = ({ item }) => <ItemCard item={item} onBid={() => setBidTarget(item)} />;

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusBid"
        subtitle={`${items.filter(i => i.status !== "SOLD").length} open auctions`}
        accent={ACCENT}
        icon={Gavel}
      />

      {loading ? (
        <View style={{ padding: spacing.containerPadding, gap: 16 }}>
          <SkeletonCard height={230} /><SkeletonCard height={230} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item._id || item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          ListEmptyComponent={
            <EmptyState icon={PackageOpen} title="Nothing up for auction right now" hint="Textbooks, cycles, calculators — someone always needs yours." />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setListOpen(true)} activeOpacity={0.85}>
        <Plus size={24} color={colors.onAccent} strokeWidth={2.8} />
      </TouchableOpacity>

      <BidModal item={bidTarget} onClose={() => setBidTarget(null)} onSubmit={handleBid} />
      <ListItemModal visible={listOpen} onClose={() => setListOpen(false)} onSubmit={handleList} />
    </View>
  );
};

/* ── Item Card ── */
function ItemCard({ item, onBid }) {
  const countdown = useCountdown(item);
  const closed = countdown?.expired || item.status === "SOLD";

  return (
    <PopCard accent={ACCENT} style={styles.itemCard}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: colors.coralSoft }]}>
          <Text style={[styles.badgeText, { color: ACCENT }]}>{item.category}</Text>
        </View>
        {countdown && (
          <View style={[styles.badge, {
            backgroundColor: countdown.urgent ? colors.roseSoft : colors.surfaceInset,
          }]}>
            {countdown.urgent && !countdown.expired
              ? <Flame size={11} color={colors.rose} strokeWidth={2.8} />
              : <Timer size={11} color={colors.inkSoft} strokeWidth={2.6} />}
            <Text style={[styles.badgeText, {
              color: countdown.urgent ? colors.rose : colors.inkSoft,
              fontVariant: ["tabular-nums"],
            }]}>{countdown.text}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.sellerText}>Listed by {item.sellerName}</Text>

      {/* Price block */}
      <View style={styles.priceBlock}>
        <View>
          <Text style={styles.priceLabel}>Current highest bid</Text>
          <Text style={styles.priceValue}>₹{item.currentBid?.toLocaleString()}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.bidCountText}>{item.bidCount || 0} {(item.bidCount || 0) === 1 ? "bid" : "bids"}</Text>
          <Text style={styles.highBidder} numberOfLines={1}>{item.highestBidderName || "No bids yet"}</Text>
        </View>
      </View>

      <PopButton
        title={closed ? "Auction closed" : "Place a bid"}
        accent={ACCENT}
        icon={Gavel}
        block
        onPress={onBid}
        disabled={closed}
      />
    </PopCard>
  );
}

/* ── Bid Modal ── */
function BidModal({ item, onClose, onSubmit }) {
  const [amount, setAmount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (item) setAmount((item.currentBid || 0) + QUICK_RAISES[0]);
  }, [item]);

  const minimum = (item?.currentBid || 0) + 1;

  const submit = async () => {
    if (busy || amount < minimum) return;
    setBusy(true);
    await onSubmit(item, amount);
    setBusy(false);
  };

  if (!item) return null;

  return (
    <Modal visible={Boolean(item)} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Place your bid</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color={colors.ink} /></TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>{item.title}</Text>

          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>Current highest</Text>
            <Text style={styles.priceValue}>₹{item.currentBid?.toLocaleString()}</Text>
          </View>

          <Text style={[typography.label, { marginBottom: 8 }]}>Your bid (minimum ₹{minimum})</Text>
          <TextInput
            style={styles.bidInput}
            keyboardType="number-pad"
            value={String(amount)}
            onChangeText={t => setAmount(Number(t) || 0)}
          />

          <View style={styles.quickRaises}>
            {QUICK_RAISES.map(step => (
              <TouchableOpacity
                key={step}
                style={styles.raiseBtn}
                onPress={() => setAmount((item.currentBid || 0) + step)}
              >
                <TrendingUp size={13} color={ACCENT} strokeWidth={2.8} />
                <Text style={[styles.raiseBtnText, { color: ACCENT }]}>+₹{step}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <PopButton
            title={busy ? "Placing…" : `Bid ₹${amount.toLocaleString()}`}
            accent={ACCENT}
            icon={Gavel}
            block
            size="lg"
            onPress={submit}
            loading={busy}
            disabled={amount < minimum}
          />

          <Text style={styles.disclaimer}>
            The seller sees your verified name. Bids are binding on campus honour code.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

/* ── List Item Modal ── */
function ListItemModal({ visible, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", description: "", startingPrice: "", category: "Books" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) setForm({ title: "", description: "", startingPrice: "", category: "Books" });
  }, [visible]);

  const submit = async () => {
    if (busy || !form.title.trim() || !form.startingPrice) return;
    setBusy(true);
    await onSubmit({ ...form, startingPrice: Number(form.startingPrice) });
    setBusy(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>List something for auction</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color={colors.ink} /></TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={[typography.label, { marginBottom: 8 }]}>What are you selling?</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. Engineering Mathematics" placeholderTextColor={colors.inkFaint} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { marginBottom: 8 }]}>Starting price (₹)</Text>
                <TextInput style={styles.modalInput} keyboardType="number-pad" placeholder="400" placeholderTextColor={colors.inkFaint} value={form.startingPrice} onChangeText={t => setForm(f => ({ ...f, startingPrice: t }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { marginBottom: 8 }]}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 6, paddingBottom: 14 }}>
                    {["Books", "Electronics", "Furniture", "Transport", "Other"].map(c => (
                      <PopPill key={c} label={c} active={form.category === c} onPress={() => setForm(f => ({ ...f, category: c }))} accent={ACCENT} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <Text style={[typography.label, { marginBottom: 8 }]}>Condition & pickup</Text>
            <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: "top" }]} multiline placeholder="Be honest about wear. Say where on campus you can hand it over." placeholderTextColor={colors.inkFaint} value={form.description} onChangeText={t => setForm(f => ({ ...f, description: t }))} />
          </ScrollView>

          <View style={styles.modalActions}>
            <PopButton title="Cancel" variant="ghost" onPress={onClose} />
            <PopButton title={busy ? "Listing…" : "Open the auction"} accent={ACCENT} icon={Gavel} onPress={submit} loading={busy} disabled={!form.title.trim() || !form.startingPrice} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  listContent: { paddingHorizontal: spacing.containerPadding, paddingBottom: 100, paddingTop: 16, gap: 16 },
  itemCard: { padding: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, ...borders.card },
  badgeText: { fontSize: 11, fontWeight: "700" },
  itemTitle: { fontSize: 16, fontWeight: "700", color: colors.ink, marginBottom: 6, lineHeight: 22 },
  itemDesc: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 8 },
  sellerText: { fontSize: 11, color: colors.inkFaint, marginBottom: 14 },
  priceBlock: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
    backgroundColor: colors.surfaceInset, borderRadius: radii.sm, ...borders.subtle,
    padding: 14, marginBottom: 14,
  },
  priceLabel: { fontSize: 10, color: colors.inkFaint, marginBottom: 2 },
  priceValue: { fontSize: 22, fontWeight: "800", color: colors.ink, fontVariant: ["tabular-nums"] },
  bidCountText: { fontSize: 10, color: colors.inkFaint },
  highBidder: { fontSize: 11, fontWeight: "700", color: colors.inkSoft, maxWidth: 130 },
  fab: {
    position: "absolute", bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: ACCENT, ...borders.card, ...shadows.hard,
    alignItems: "center", justifyContent: "center",
  },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(23,21,15,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl,
    ...borders.card, borderBottomWidth: 0,
    paddingHorizontal: spacing.containerPadding, paddingTop: 20, paddingBottom: 32,
    maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: colors.ink },
  modalSubtitle: { fontSize: 15, color: colors.inkSoft, marginBottom: 16 },
  modalInput: {
    backgroundColor: colors.surfaceInset, borderRadius: radii.sm, ...borders.card,
    padding: 14, fontSize: 15, color: colors.ink, marginBottom: 14,
  },
  bidInput: {
    backgroundColor: colors.surfaceInset, borderRadius: radii.sm, ...borders.card,
    padding: 14, fontSize: 22, fontWeight: "800", color: colors.ink,
    textAlign: "center", fontVariant: ["tabular-nums"], marginBottom: 14,
  },
  quickRaises: { flexDirection: "row", gap: 8, marginBottom: 16 },
  raiseBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 10, borderRadius: radii.sm,
    backgroundColor: colors.coralSoft, ...borders.card,
  },
  raiseBtnText: { fontSize: 13, fontWeight: "700" },
  disclaimer: { fontSize: 11, color: colors.inkFaint, textAlign: "center", marginTop: 14 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
});
