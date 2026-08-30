import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert
} from "react-native";
import {
  Sparkles,
  Search,
  Plus,
  BookOpen,
  User,
  GraduationCap,
  MessageCircle,
  Tag
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { skillsService } from "../../services/skillsService";
import { HeaderBar } from "../../components/common/HeaderBar";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { CreateSkillModal } from "./CreateSkillModal";

const SKILL_CATEGORIES = [
  "All",
  "Tech & Coding",
  "Academics & Tutoring",
  "Design & Media",
  "Music & Arts",
  "Languages"
];

export const SkillsFeedScreen = () => {
  const [skills, setSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [typeFilter, setTypeFilter] = useState("ALL"); // 'ALL' | 'OFFER' | 'REQUEST'
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const fetchSkills = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await skillsService.getSkills(selectedCategory, typeFilter, searchQuery);
      setSkills(data || []);
    } catch (err) {
      setError(err.message || "Failed to load skills directory.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, typeFilter, searchQuery]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSkills(true);
  };

  const handleContact = (skill) => {
    Alert.alert(
      "Connect with Peer",
      `Reach out to ${skill.authorName} (${skill.department}) via official email:\n\n${skill.contactInfo || "student@college.edu"}`
    );
  };

  const renderSkillCard = ({ item }) => {
    const isOffer = item.type === "OFFER";

    return (
      <PopCard style={styles.card}>
        <View style={styles.cardTop}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: isOffer ? colors.roseSoft : colors.sunSoft }
            ]}
          >
            {isOffer ? (
              <GraduationCap size={12} color={colors.rose} />
            ) : (
              <BookOpen size={12} color={colors.ink} />
            )}
            <Text
              style={[
                styles.typeText,
                { color: isOffer ? colors.rose : colors.ink }
              ]}
            >
              {isOffer ? "TEACHING / OFFER" : "SEEKING HELP"}
            </Text>
          </View>

          <View style={styles.rateBadge}>
            <Text style={styles.rateText}>
              {item.hourlyRate > 0 ? `₹${item.hourlyRate}/hr` : "Free Exchange"}
            </Text>
          </View>
        </View>

        <Text style={styles.skillTitle}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.tagRow}>
          <View style={styles.categoryChip}>
            <Tag size={11} color={colors.rose} />
            <Text style={styles.categoryChipText}>{item.category || "General"}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.authorRow}>
            <PopAvatar name={item.authorName || "Peer"} size={30} />
            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>{item.authorName || "Student"}</Text>
              <Text style={styles.authorDept}>{item.department || "Campus"}</Text>
            </View>
          </View>

          <PopButton
            title="Connect"
            onPress={() => handleContact(item)}
            variant="rose"
            size="sm"
            icon={<MessageCircle size={13} color={colors.surface} />}
          />
        </View>
      </PopCard>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="CampusSkills"
        subtitle="Peer Tutoring & Collaborative Skill Directory"
        accentColor={colors.rose}
        onNotificationPress={() => {}}
      />

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={16} color={colors.inkFaint} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search subjects, coding languages, design..."
          placeholderTextColor={colors.inkFaint}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Offer vs Request Filter Pills */}
      <View style={styles.filterRow}>
        {[
          { id: "ALL", label: "All Skills" },
          { id: "OFFER", label: "🎓 Offering" },
          { id: "REQUEST", label: "🙋 Seeking" }
        ].map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, typeFilter === f.id && styles.filterChipActive]}
            onPress={() => setTypeFilter(f.id)}
          >
            <Text style={[styles.filterText, typeFilter === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories */}
      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SKILL_CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <PopPill
              label={item}
              active={selectedCategory === item}
              accentColor={colors.rose}
              accentSoftColor={colors.roseSoft}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Skills List */}
      {loading && !refreshing ? (
        <SkeletonLoader count={3} />
      ) : error ? (
        <ErrorState
          title="Could not load skills"
          message={error}
          onRetry={() => fetchSkills()}
        />
      ) : (
        <FlatList
          data={skills}
          keyExtractor={(item) => item.id}
          renderItem={renderSkillCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.rose}
              colors={[colors.rose]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Sparkles size={32} color={colors.rose} />}
              title="No skills listed yet"
              description="Offer a tutoring session or request peer study help!"
              actionTitle="List a Skill"
              onAction={() => setCreateModalVisible(true)}
              accentVariant="rose"
            />
          }
        />
      )}

      {/* Floating Plus */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setCreateModalVisible(true)}
      >
        <Plus size={24} color={colors.surface} />
      </TouchableOpacity>

      <CreateSkillModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreated={(newSkill) => {
          setSkills((prev) => [newSkill, ...prev]);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    marginHorizontal: spacing.containerPadding,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 44,
    ...shadows.hardSm
  },
  searchIcon: {
    marginRight: spacing.sm
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: "500"
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.containerPadding,
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  filterChip: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingVertical: 7,
    borderRadius: radii.md,
    alignItems: "center"
  },
  filterChipActive: {
    backgroundColor: colors.rose,
    borderColor: colors.borderInk,
    ...shadows.hardSm
  },
  filterText: {
    ...typography.badge,
    fontSize: 11.5,
    color: colors.inkSoft
  },
  filterTextActive: {
    color: colors.surface
  },
  categoryRow: {
    paddingVertical: spacing.sm
  },
  categoryList: {
    paddingHorizontal: spacing.containerPadding
  },
  listContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 90
  },
  card: {
    marginBottom: spacing.md
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderInk,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  typeText: {
    ...typography.badge,
    fontSize: 10.5
  },
  rateBadge: {
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm
  },
  rateText: {
    ...typography.badge,
    color: colors.ink,
    fontSize: 12
  },
  skillTitle: {
    ...typography.heading,
    fontSize: 16.5,
    marginBottom: 4
  },
  description: {
    ...typography.body,
    marginBottom: spacing.sm
  },
  tagRow: {
    flexDirection: "row",
    marginBottom: spacing.md
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  categoryChipText: {
    ...typography.caption,
    fontSize: 10.5,
    color: colors.inkSoft
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    paddingTop: spacing.sm
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  authorMeta: {
    justifyContent: "center"
  },
  authorName: {
    ...typography.badge,
    fontSize: 12.5,
    color: colors.ink
  },
  authorDept: {
    ...typography.bodySm,
    fontSize: 10.5
  },
  fab: {
    position: "absolute",
    bottom: 22,
    right: 18,
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.rose,
    borderWidth: 2,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hard
  }
});
