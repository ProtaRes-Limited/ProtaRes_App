import { View, Text, StyleSheet } from 'react-native';
import { Clock, CheckCircle, XCircle, Timer } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/auth';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';

export default function HistoryScreen() {
  const user = useAuthStore((s) => s.user);

  const totalResponses = user?.totalResponses ?? 0;
  const totalAccepted = user?.totalAccepted ?? 0;
  const totalDeclined = user?.totalDeclined ?? 0;
  const avgTime = user?.averageResponseTimeSeconds
    ? `${Math.round(user.averageResponseTimeSeconds / 60)}m ${
        user.averageResponseTimeSeconds % 60
      }s`
    : '--';

  return (
    <Screen scroll>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Response History
        </Text>
        <Text style={styles.headerSubtitle}>
          Your emergency response activity
        </Text>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <Card variant="elevated" style={styles.statCard}>
          <View style={styles.statInner}>
            <View style={[styles.statIconCircle, styles.statIconPrimary]}>
              <Clock size={20} color="#005EB8" />
            </View>
            <Text style={styles.statValue}>
              {totalResponses}
            </Text>
            <Text style={styles.statLabel}>
              Total
            </Text>
          </View>
        </Card>

        <Card variant="elevated" style={styles.statCard}>
          <View style={styles.statInner}>
            <View style={[styles.statIconCircle, styles.statIconSuccess]}>
              <CheckCircle size={20} color="#009639" />
            </View>
            <Text style={[styles.statValue, styles.statValueSuccess]}>
              {totalAccepted}
            </Text>
            <Text style={styles.statLabel}>
              Accepted
            </Text>
          </View>
        </Card>

        <Card variant="elevated" style={styles.statCard}>
          <View style={styles.statInner}>
            <View style={[styles.statIconCircle, styles.statIconWarning]}>
              <Timer size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>
              {avgTime}
            </Text>
            <Text style={styles.statLabel}>
              Avg Time
            </Text>
          </View>
        </Card>
      </View>

      {/* Declined stat */}
      <Card variant="outlined" style={styles.declinedCard}>
        <View style={styles.declinedRow}>
          <View style={[styles.statIconCircle, styles.statIconEmergency]}>
            <XCircle size={20} color="#DA291C" />
          </View>
          <View style={styles.declinedTextBlock}>
            <Text style={styles.declinedTitle}>
              Declined
            </Text>
            <Text style={styles.declinedSubtitle}>
              Alerts you could not respond to
            </Text>
          </View>
          <Text style={styles.declinedValue}>
            {totalDeclined}
          </Text>
        </View>
      </Card>

      {/* Response List or Empty */}
      <Text style={styles.sectionTitle}>
        Recent Responses
      </Text>

      <EmptyState
        icon={Clock}
        title="No Responses Yet"
        description="Your emergency response history will appear here once you accept and respond to alerts."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing[1],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCard: {
    flex: 1,
  },
  statInner: {
    alignItems: 'center',
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  statIconPrimary: {
    backgroundColor: colors.primary[100],
  },
  statIconSuccess: {
    backgroundColor: colors.success[100],
  },
  statIconWarning: {
    backgroundColor: colors.warning[100],
  },
  statIconEmergency: {
    backgroundColor: colors.emergency[100],
    marginBottom: 0,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  statValueSuccess: {
    color: colors.success[600],
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    marginTop: spacing[0.5],
  },
  declinedCard: {
    marginBottom: spacing[6],
  },
  declinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  declinedTextBlock: {
    flex: 1,
  },
  declinedTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  declinedSubtitle: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
  },
  declinedValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing[3],
  },
});
