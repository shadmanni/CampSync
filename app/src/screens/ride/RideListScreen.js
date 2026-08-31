import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, ScrollView, RefreshControl
} from "react-native";
import {
  Car, Plus, ArrowRight, Clock, Users, CalendarDays,
  MapPin, Check, Route, X
} from "lucide-react-native";
import { colors, shadows, borders, radii, spacing, typography } from "../../theme/theme";
import { rideService } from "../../services/rideService";
import { socketService } from "../../services/socketService";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";
import { PopPill } from "../../components/common/PopPill";
import { PopHeader } from "../../components/common/PopHeader";
import { PopAvatar } from "../../components/common/PopAvatar";
import { SeatPips } from "../../components/common/SeatPips";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/SkeletonLoader";

const ACCENT = colors.mint;

export const RideListScreen = () => {
  const { user } = useAuth();
  const [view, setView] = useState("rides");
  const [rides, setRides] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [joining, setJoining] = useState(null);
  const [joined, setJoined] = useState(new Set());
  const [rsvped, setRsvped] = useState(new Set());

  const load = useCallback(async () => {
    try {
      const [r, e] = await Promise.all([rideService.getRides(), rideService.getEvents()]);
      setRides(r?.rides || r || []);
      setEvents(e?.events || e || []);
    } catch (err) {
      console.warn("[RideList] Load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  // Real-time: listen for seat updates from other clients
  useEffect(() => {
    socketService.connect();
    const handler = ({ rideId, availableSeats }) => {
      setRides(prev => prev.map(r =>
        (r.id || r._id) === rideId ? { ...r, availableSeats } : r
      ));
    };
    socketService.on("ride:seat_updated", handler);
    return () => socketService.off("ride:seat_updated", handler);
  }, []);

  const handleJoin = async (ride) => {
    const id = ride._id || ride.id;
    setJoining(id);
    setRides(prev => prev.map(r =>
      (r._id || r.id) === id ? { ...r, availableSeats: Math.max(0, r.availableSeats - 1) } : r
    ));
    try {
      const updated = await rideService.bookSeat(id, user?.name);
      setRides(prev => prev.map(r => (r._id || r.id) === id ? { ...r, ...updated } : r));
      setJoined(prev => new Set(prev).add(id));
    } catch (err) {
      setRides(prev => prev.map(r =>
        (r._id || r.id) === id ? { ...r, availableSeats: Math.min(r.totalSeats, r.availableSeats + 1) } : r
      ));
    } finally {
      setJoining(null);
    }
  };

  const handleRsvp = async (event) => {
    const id = event._id || event.id;
    if (rsvped.has(id)) return;
    setRsvped(prev => new Set(prev).add(id));
    setEvents(prev => prev.map(e =>
      (e._id || e.id) === id ? { ...e, attendeesCount: (e.attendeesCount || 0) + 1 } : e
    ));
    try {
      await rideService.rsvpEvent(id);
    } catch {
      setRsvped(prev => { const n = new Set(prev); n.delete(id); return n; });
      setEvents(prev => prev.map(e =>
        (e._id || e.id) === id ? { ...e, attendeesCount: Math.max(0, (e.attendeesCount || 1) - 1) } : e
      ));
    }
  };

  const handlePost = async (payload) => {
    try {
      const created = await rideService.createRide(payload);
      setRides(prev => [created, ...prev]);
      setPostOpen(false);
    } catch (err) {
      console.warn("[RideList] Post error:", err);
    }
  };

  const seatsLeft = rides.reduce((s, r) => s + (r.availableSeats || 0), 0);

  const renderRide = ({ item }) => (
    <RideCard
      ride={item}
      joined={joined.has(item._id || item.id)}
      busy={joining === (item._id || item.id)}
      onJoin={() => handleJoin(item)}
    />
  );

  const renderEvent = ({ item }) => (
    <EventCard
      event={item}
      going={rsvped.has(item._id || item.id)}
      onRsvp={() => handleRsvp(item)}
    />
  );

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusRide"
        subtitle={`${seatsLeft} open seat${seatsLeft !== 1 ? "s" : ""}`}
        accent={ACCENT}
        icon={Car}
      />

      {/* View Toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleContainer}>
          {[
            { id: "rides", label: "Carpools", icon: Car, count: rides.length },
            { id: "events", label: "Events", icon: CalendarDays, count: events.length },
          ].map(tab => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setView(tab.id)}
                style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                activeOpacity={0.7}
              >
                <Icon size={15} color={active ? ACCENT : colors.inkSoft} strokeWidth={2.4} />
                <Text style={[styles.toggleLabel, active && { color: ACCENT }]}>{tab.label}</Text>
                <Text style={styles.toggleCount}>{tab.count}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={{ padding: spacing.containerPadding, gap: 16 }}>
          <SkeletonCard height={220} /><SkeletonCard height={220} />
        </View>
      ) : view === "rides" ? (
        <FlatList
          data={rides}
          keyExtractor={item => item._id || item.id}
          renderItem={renderRide}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          ListEmptyComponent={
            <EmptyState icon={Route} title="No carpools posted yet" hint="Heading to the station? Offer the empty seats." />
          }
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item._id || item.id}
          renderItem={renderEvent}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          ListEmptyComponent={
            <EmptyState icon={CalendarDays} title="Nothing on the calendar" hint="Post the next fest, match or open mic." />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setPostOpen(true)} activeOpacity={0.85}>
        <Plus size={24} color={colors.onAccent} strokeWidth={2.8} />
      </TouchableOpacity>

      <PostRideModal visible={postOpen} onClose={() => setPostOpen(false)} onSubmit={handlePost} />
    </View>
  );
};

/* ── Ride Card ── */
function RideCard({ ride, joined, busy, onJoin }) {
  const full = ride.availableSeats <= 0;
  const scarce = ride.availableSeats === 1;

  return (
    <PopCard accent={ACCENT} style={styles.rideCard}>
      {/* Route indicator */}
      <View style={styles.routeRow}>
        <View style={styles.routeDots}>
          <View style={[styles.dotOpen, { borderColor: ACCENT }]} />
          <View style={styles.dotLine} />
          <View style={[styles.dotFilled, { backgroundColor: ACCENT }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.routeText}>{ride.origin}</Text>
          <Text style={[styles.routeText, { marginTop: 18 }]}>{ride.destination}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.priceNum}>₹{ride.pricePerSeat}</Text>
          <Text style={styles.priceSuffix}>per seat</Text>
        </View>
      </View>

      {/* Meta */}
      <View style={styles.metaRow}>
        <View style={[styles.badge, { backgroundColor: colors.surfaceInset }]}>
          <Clock size={11} color={colors.inkSoft} strokeWidth={2.6} />
          <Text style={styles.badgeText}>{ride.departureTime}</Text>
        </View>
        <View style={styles.driverRow}>
          <PopAvatar name={ride.driverName} size={22} />
          <Text style={styles.driverName}>{ride.driverName}</Text>
        </View>
      </View>

      {/* Seat counter */}
      <View style={styles.seatBlock}>
        <View style={styles.seatLeft}>
          <Users size={15} color={colors.inkFaint} />
          <Text style={[styles.seatNum, { color: full ? colors.inkFaint : ACCENT }]}>{ride.availableSeats}</Text>
          <Text style={styles.seatSuffix}>of {ride.totalSeats} left</Text>
        </View>
        <SeatPips total={ride.totalSeats} available={ride.availableSeats} accent={ACCENT} />
      </View>

      {scarce && !full && (
        <Text style={styles.scarceText}>⚡ Last seat — this one usually goes fast</Text>
      )}

      <PopButton
        title={busy ? "Booking…" : joined ? "Seat booked" : full ? "Fully booked" : "Claim a seat"}
        accent={ACCENT}
        icon={busy ? null : joined ? Check : ArrowRight}
        block
        onPress={onJoin}
        disabled={full || joined || busy}
        loading={busy}
        variant={joined ? "ghost" : "primary"}
      />
    </PopCard>
  );
}

/* ── Event Card ── */
function EventCard({ event, going, onRsvp }) {
  return (
    <PopCard accent={ACCENT} style={styles.eventCard}>
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: colors.mintSoft }]}>
          <Text style={[styles.badgeTextColored, { color: ACCENT }]}>{event.category}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.surfaceInset }]}>
          <CalendarDays size={11} color={colors.inkSoft} strokeWidth={2.6} />
          <Text style={styles.badgeText}>{event.dateTime}</Text>
        </View>
      </View>

      <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
      <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>

      <View style={styles.venueRow}>
        <MapPin size={12} color={colors.inkFaint} strokeWidth={2.4} />
        <Text style={styles.venueText}>{event.venue}</Text>
      </View>

      <View style={styles.rsvpRow}>
        <View style={styles.attendeeCount}>
          <Text style={styles.attendeeNum}>{event.attendeesCount || 0}</Text>
          <Text style={styles.attendeeSuffix}>going</Text>
        </View>
        <PopButton
          title={going ? "I'm going" : "Count me in"}
          accent={ACCENT}
          icon={going ? Check : Plus}
          variant={going ? "soft" : "ghost"}
          size="sm"
          onPress={onRsvp}
          disabled={going}
        />
      </View>
    </PopCard>
  );
}

/* ── Post Ride Modal ── */
function PostRideModal({ visible, onClose, onSubmit }) {
  const [form, setForm] = useState({ origin: "", destination: "", departureTime: "", totalSeats: "3", pricePerSeat: "80" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) setForm({ origin: "", destination: "", departureTime: "", totalSeats: "3", pricePerSeat: "80" });
  }, [visible]);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    await onSubmit({ ...form, totalSeats: Number(form.totalSeats), pricePerSeat: Number(form.pricePerSeat) });
    setBusy(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Offer a ride</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color={colors.ink} /></TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {[
              { label: "Picking up from", key: "origin", placeholder: "Main Campus Gate" },
              { label: "Heading to", key: "destination", placeholder: "City Centre Metro" },
              { label: "When", key: "departureTime", placeholder: "Today, 5:30 PM" },
            ].map(f => (
              <View key={f.key}>
                <Text style={[typography.label, { marginBottom: 8 }]}>{f.label}</Text>
                <TextInput style={styles.modalInput} placeholder={f.placeholder} placeholderTextColor={colors.inkFaint} value={form[f.key]} onChangeText={t => setForm(prev => ({ ...prev, [f.key]: t }))} />
              </View>
            ))}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { marginBottom: 8 }]}>Seats offered</Text>
                <TextInput style={styles.modalInput} keyboardType="number-pad" value={form.totalSeats} onChangeText={t => setForm(f => ({ ...f, totalSeats: t }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { marginBottom: 8 }]}>Price per seat (₹)</Text>
                <TextInput style={styles.modalInput} keyboardType="number-pad" value={form.pricePerSeat} onChangeText={t => setForm(f => ({ ...f, pricePerSeat: t }))} />
              </View>
            </View>
          </ScrollView>
          <View style={styles.modalActions}>
            <PopButton title="Cancel" variant="ghost" onPress={onClose} />
            <PopButton title={busy ? "Posting…" : "Post the ride"} accent={ACCENT} icon={Car} onPress={submit} loading={busy} disabled={!form.origin.trim()} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  toggleRow: { paddingHorizontal: spacing.containerPadding, paddingTop: 12, paddingBottom: 4 },
  toggleContainer: {
    flexDirection: "row", gap: 2, padding: 4, borderRadius: radii.pill,
    borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface2,
    alignSelf: "flex-start",
  },
  toggleBtn: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingVertical: 9, paddingHorizontal: 17, borderRadius: radii.pill,
  },
  toggleBtnActive: { backgroundColor: colors.mintSoft },
  toggleLabel: { fontSize: 13, fontWeight: "700", color: colors.inkSoft },
  toggleCount: { fontSize: 11, fontWeight: "600", color: colors.inkFaint },
  listContent: { paddingHorizontal: spacing.containerPadding, paddingBottom: 100, paddingTop: 12, gap: 16 },
  rideCard: { padding: 20 },
  eventCard: { padding: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, ...borders.card },
  badgeText: { fontSize: 11, fontWeight: "700", color: colors.inkSoft },
  badgeTextColored: { fontSize: 11, fontWeight: "700" },
  routeRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  routeDots: { flexDirection: "column", alignItems: "center", paddingTop: 5 },
  dotOpen: { width: 9, height: 9, borderRadius: 5, borderWidth: 2.5 },
  dotLine: { width: 2, height: 26, backgroundColor: colors.line },
  dotFilled: { width: 9, height: 9, borderRadius: 5 },
  routeText: { fontSize: 14, fontWeight: "700", color: colors.ink, lineHeight: 20 },
  priceNum: { fontSize: 20, fontWeight: "800", color: colors.ink, fontVariant: ["tabular-nums"] },
  priceSuffix: { fontSize: 10, color: colors.inkFaint },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" },
  driverRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  driverName: { fontSize: 11, color: colors.inkFaint },
  seatBlock: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surfaceInset, borderRadius: radii.sm, ...borders.subtle,
    padding: 12, marginBottom: 10,
  },
  seatLeft: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  seatNum: { fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },
  seatSuffix: { fontSize: 10, color: colors.inkFaint },
  scarceText: { fontSize: 11, fontWeight: "700", color: colors.sun, marginBottom: 10 },
  eventTitle: { fontSize: 16, fontWeight: "700", color: colors.ink, marginBottom: 6, lineHeight: 22 },
  eventDesc: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 10 },
  venueRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  venueText: { fontSize: 11, color: colors.inkFaint },
  rsvpRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  attendeeCount: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  attendeeNum: { fontSize: 18, fontWeight: "800", color: colors.ink, fontVariant: ["tabular-nums"] },
  attendeeSuffix: { fontSize: 10, color: colors.inkFaint },
  fab: {
    position: "absolute", bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: ACCENT, ...borders.card, ...shadows.hard,
    alignItems: "center", justifyContent: "center",
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(23,21,15,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl,
    ...borders.card, borderBottomWidth: 0,
    paddingHorizontal: spacing.containerPadding, paddingTop: 20, paddingBottom: 32,
    maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: colors.ink },
  modalInput: {
    backgroundColor: colors.surfaceInset, borderRadius: radii.sm, ...borders.card,
    padding: 14, fontSize: 15, color: colors.ink, marginBottom: 14,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
});
