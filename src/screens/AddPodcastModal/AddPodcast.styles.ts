import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 17,
    color: COLORS.primary,
  },
  headerButtonDisabled: {
    color: COLORS.textSecondary,
  },
  inputSection: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 14,
  },
  clearButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    flex: 1,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.cardBackground,
  },
  addButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  previewContainer: {
    flex: 1,
  },
  previewCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  previewArtwork: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  previewAuthor: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  previewDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.cardBackground,
  },
  alreadySubscribedButton: {
    backgroundColor: COLORS.border,
  },
  alreadySubscribedText: {
    color: COLORS.textSecondary,
  },
  changeUrlButton: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  changeUrlText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  hintContainer: {
    marginBottom: 20,
  },
  hintText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
