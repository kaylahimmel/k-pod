import React from 'react';
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
import { useLoginViewModel } from './LoginViewModel';
import { LoginViewProps } from './Login.types';
import { styles } from './Login.styles';
import { styles as authStyles } from '../../styles/auth.styles';
import { COLORS } from '../../constants';

export const LoginView = ({
  onSignUpPress,
  onForgotPasswordPress,
}: LoginViewProps) => {
  const viewModel = useLoginViewModel();

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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your K-Pod account</Text>
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
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize='none'
                autoCorrect={false}
                keyboardType='email-address'
                returnKeyType='next'
                accessibilityLabel='Email address'
              />
            </View>
          </View>

          {/* Password field */}
          <View style={authStyles.fieldContainer}>
            <Text style={authStyles.label}>Password</Text>
            <View
              style={[
                authStyles.inputWrapper,
                viewModel.errorMessage ? authStyles.inputWrapperError : null,
              ]}
            >
              <TextInput
                style={authStyles.input}
                value={viewModel.password}
                onChangeText={viewModel.handlePasswordChange}
                placeholder='••••••••'
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                returnKeyType='go'
                onSubmitEditing={viewModel.handleSignIn}
                accessibilityLabel='Password'
              />
            </View>
          </View>

          {/* Inline error */}
          {viewModel.errorMessage ? (
            <View style={authStyles.errorContainer}>
              <Ionicons name='alert-circle' size={16} color={COLORS.danger} />
              <Text style={authStyles.errorText}>{viewModel.errorMessage}</Text>
            </View>
          ) : null}

          {/* Sign In button */}
          <TouchableOpacity
            style={[
              authStyles.button,
              viewModel.isLoading ? authStyles.buttonDisabled : null,
            ]}
            onPress={viewModel.handleSignIn}
            disabled={viewModel.isLoading}
            accessibilityLabel='Sign in'
          >
            {viewModel.isLoading ? (
              <ActivityIndicator color={COLORS.cardBackground} />
            ) : (
              <Text style={authStyles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={onForgotPasswordPress}
            accessibilityLabel='Forgot password'
          >
            <Text style={styles.linkText}>Forgot your password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Sign up link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don&#39;t have an account?</Text>
          <TouchableOpacity
            onPress={onSignUpPress}
            accessibilityLabel='Sign up'
          >
            <Text style={styles.signUpLinkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
