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
import { useSignUpViewModel } from './SignUpViewModel';
import { SignUpViewProps } from './SignUp.types';
import { styles } from './SignUp.styles';
import { styles as authStyles } from '../../styles/auth.styles';
import { COLORS } from '../../constants';

export const SignUpView = ({ onSignInPress }: SignUpViewProps) => {
  const viewModel = useSignUpViewModel();

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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start listening to your podcasts</Text>
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
                placeholder='Min. 6 characters'
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                returnKeyType='next'
                accessibilityLabel='Password'
              />
            </View>
          </View>

          {/* Confirm password field */}
          <View style={authStyles.fieldContainer}>
            <Text style={authStyles.label}>Confirm Password</Text>
            <View
              style={[
                authStyles.inputWrapper,
                viewModel.errorMessage ? authStyles.inputWrapperError : null,
              ]}
            >
              <TextInput
                style={authStyles.input}
                value={viewModel.confirmPassword}
                onChangeText={viewModel.handleConfirmPasswordChange}
                placeholder='Re-enter your password'
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry
                returnKeyType='go'
                onSubmitEditing={viewModel.handleSignUp}
                accessibilityLabel='Confirm password'
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

          {/* Sign Up button */}
          <TouchableOpacity
            style={[
              authStyles.button,
              viewModel.isLoading ? authStyles.buttonDisabled : null,
            ]}
            onPress={viewModel.handleSignUp}
            disabled={viewModel.isLoading}
            accessibilityLabel='Create account'
          >
            {viewModel.isLoading ? (
              <ActivityIndicator color={COLORS.cardBackground} />
            ) : (
              <Text style={authStyles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Sign in link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={onSignInPress}
            accessibilityLabel='Sign in'
          >
            <Text style={styles.signInLinkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
