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
    sectionHeader: {
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingsSection: {
      backgroundColor: colors.cardBackground,
      marginBottom: 8,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: 48,
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.textPrimary,
      flex: 1,
    },
    settingValue: {
      fontSize: 16,
      color: colors.textSecondary,
      marginRight: 8,
    },
    touchableSettingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      minHeight: 48,
    },
    touchableSettingRowLast: {
      borderBottomWidth: 0,
    },
    optionSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    optionButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionButtonText: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    optionButtonTextSelected: {
      color: colors.cardBackground,
      fontWeight: '600',
    },
    appInfoSection: {
      backgroundColor: colors.cardBackground,
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    appName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    appVersion: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    resetButton: {
      marginTop: 24,
      marginHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: colors.cardBackground,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.danger,
    },
    resetButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.danger,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
