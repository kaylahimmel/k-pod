import { StyleSheet } from 'react-native';
import { ColorPalette } from '../../constants';

export const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    headerSection: {
      backgroundColor: colors.cardBackground,
      alignItems: 'center',
      paddingVertical: 24,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.cardBackground,
    },
    userEmail: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    statsSection: {
      backgroundColor: colors.cardBackground,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    actionsSection: {
      backgroundColor: colors.cardBackground,
      marginBottom: 16,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionItemLast: {
      borderBottomWidth: 0,
    },
    actionText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    actionTextDanger: {
      fontSize: 16,
      color: colors.danger,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
