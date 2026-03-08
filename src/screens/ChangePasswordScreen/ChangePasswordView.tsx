import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChangePasswordViewModel } from './ChangePasswordViewModel';
import { ChangePasswordViewProps } from './ChangePassword.types';
import { createStyles } from './ChangePassword.styles';
import { useColors } from '../../hooks';
import { createAuthStyles } from '../../styles/auth.styles';

export const ChangePasswordView = ({ onSuccess }: ChangePasswordViewProps) => {
  const viewModel = useChangePasswordViewModel(onSuccess);
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const authStyles = useMemo(() => createAuthStyles(colors), [colors]);

  if (viewModel.isSuccess) {
    return (
      <View style={authStyles.container}>
        <View style={authStyles.successContainer}>
          <View style={authStyles.successIconContainer}>
            <Ionicons
              name='checkmark-circle'
              size={36}
              color={colors.success}
            />
          </View>
          <Text style={styles.successTitle}>Password updated</Text>
          <Text style={styles.successMessage}>
            Your password has been changed successfully.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={authStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={authStyles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        <View style={authStyles.form}>
          {/* Current password field */}
          <View style={authStyles.fieldContainer}>
            <Text style={authStyles.label}>Current Password</Text>
            <View
              style={[
                authStyles.inputWrapper,
                viewModel.errorMessage ? authStyles.inputWrapperError : null,
              ]}
            >
              <TextInput
                style={authStyles.input}
                value={viewModel.currentPassword}
                onChangeText={viewModel.handleCurrentPasswordChange}
                placeholder='Enter current password'
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                returnKeyType='next'
                accessibilityLabel='Current password'
              />
            </View>
          </View>

          {/* New password field */}
          <View style={authStyles.fieldContainer}>
            <Text style={authStyles.label}>New Password</Text>
            <View
              style={[
                authStyles.inputWrapper,
                viewModel.errorMessage ? authStyles.inputWrapperError : null,
              ]}
            >
              <TextInput
                style={authStyles.input}
                value={viewModel.newPassword}
                onChangeText={viewModel.handleNewPasswordChange}
                placeholder='Min. 6 characters'
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                returnKeyType='next'
                accessibilityLabel='New password'
              />
            </View>
          </View>

          {/* Confirm new password field */}
          <View style={authStyles.fieldContainer}>
            <Text style={authStyles.label}>Confirm New Password</Text>
            <View
              style={[
                authStyles.inputWrapper,
                viewModel.errorMessage ? authStyles.inputWrapperError : null,
              ]}
            >
              <TextInput
                style={authStyles.input}
                value={viewModel.confirmNewPassword}
                onChangeText={viewModel.handleConfirmNewPasswordChange}
                placeholder='Re-enter new password'
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                returnKeyType='go'
                onSubmitEditing={viewModel.handleSubmit}
                accessibilityLabel='Confirm new password'
              />
            </View>
          </View>

          {/* Inline error */}
          {viewModel.errorMessage ? (
            <View style={authStyles.errorContainer}>
              <Ionicons name='alert-circle' size={16} color={colors.danger} />
              <Text style={authStyles.errorText}>{viewModel.errorMessage}</Text>
            </View>
          ) : null}

          {/* Submit button */}
          <TouchableOpacity
            style={[
              authStyles.button,
              viewModel.isLoading ? authStyles.buttonDisabled : null,
            ]}
            onPress={viewModel.handleSubmit}
            disabled={viewModel.isLoading}
            accessibilityLabel='Change password'
          >
            {viewModel.isLoading ? (
              <ActivityIndicator color={colors.cardBackground} />
            ) : (
              <Text style={authStyles.buttonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
