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
import { useForgotPasswordViewModel } from './ForgotPasswordViewModel';
import { ForgotPasswordViewProps } from './ForgotPassword.types';
import { createStyles } from './ForgotPassword.styles';
import { useColors } from '../../hooks';
import { createAuthStyles } from '../../styles/auth.styles';

export const ForgotPasswordView = ({
  onBackToSignInPress,
}: ForgotPasswordViewProps) => {
  const viewModel = useForgotPasswordViewModel();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const authStyles = useMemo(() => createAuthStyles(colors), [colors]);

  if (viewModel.isSuccess) {
    return (
      <View
        style={[
          authStyles.container,
          { justifyContent: 'center', padding: 24 },
        ]}
      >
        <View style={authStyles.successContainer}>
          <View style={authStyles.successIconContainer}>
            <Ionicons name='mail-outline' size={36} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successMessage}>
            We sent a password reset link to{' '}
            <Text style={styles.successEmail}>{viewModel.email}</Text>
          </Text>
          <TouchableOpacity
            style={styles.backLink}
            onPress={onBackToSignInPress}
            accessibilityLabel='Back to sign in'
          >
            <Text style={styles.backLinkText}>Back to Sign In</Text>
          </TouchableOpacity>
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
        <View style={styles.header}>
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we&#39;ll send you a link to reset your
            password.
          </Text>
        </View>

        <View style={authStyles.form}>
          {/* Email field */}
          <View style={authStyles.fieldContainer}>
            <Text style={authStyles.label}>Email</Text>
            <View
              style={[
                authStyles.inputWrapper,
                viewModel.errorMessage ? authStyles.inputWrapperError : null,
              ]}
            >
              <TextInput
                style={authStyles.input}
                value={viewModel.email}
                onChangeText={viewModel.handleEmailChange}
                placeholder='you@example.com'
                placeholderTextColor={colors.textSecondary}
                autoCapitalize='none'
                autoCorrect={false}
                keyboardType='email-address'
                returnKeyType='go'
                onSubmitEditing={viewModel.handleSendResetEmail}
                accessibilityLabel='Email address'
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

          {/* Send button */}
          <TouchableOpacity
            style={[
              authStyles.button,
              viewModel.isLoading ? authStyles.buttonDisabled : null,
            ]}
            onPress={viewModel.handleSendResetEmail}
            disabled={viewModel.isLoading}
            accessibilityLabel='Send reset email'
          >
            {viewModel.isLoading ? (
              <ActivityIndicator color={colors.cardBackground} />
            ) : (
              <Text style={authStyles.buttonText}>Send Reset Email</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backLink}
          onPress={onBackToSignInPress}
          accessibilityLabel='Back to sign in'
        >
          <Text style={styles.backLinkText}>Back to Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
