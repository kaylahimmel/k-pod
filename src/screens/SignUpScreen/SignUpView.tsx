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
import { COLORS } from '../../constants';

export const SignUpView = ({ onSignInPress }: SignUpViewProps) => {
  const viewModel = useSignUpViewModel();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start listening to your podcasts</Text>
        </View>

        <View style={styles.form}>
          {/* Email field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <View
              style={[
                styles.inputWrapper,
                viewModel.errorMessage ? styles.inputWrapperError : null,
              ]}
            >
              <TextInput
                style={styles.input}
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
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                viewModel.errorMessage ? styles.inputWrapperError : null,
              ]}
            >
              <TextInput
                style={styles.input}
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
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View
              style={[
                styles.inputWrapper,
                viewModel.errorMessage ? styles.inputWrapperError : null,
              ]}
            >
              <TextInput
                style={styles.input}
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
            <View style={styles.errorContainer}>
              <Ionicons name='alert-circle' size={16} color={COLORS.danger} />
              <Text style={styles.errorText}>{viewModel.errorMessage}</Text>
            </View>
          ) : null}

          {/* Sign Up button */}
          <TouchableOpacity
            style={[
              styles.button,
              viewModel.isLoading ? styles.buttonDisabled : null,
            ]}
            onPress={viewModel.handleSignUp}
            disabled={viewModel.isLoading}
            accessibilityLabel='Create account'
          >
            {viewModel.isLoading ? (
              <ActivityIndicator color={COLORS.cardBackground} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
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
