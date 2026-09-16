import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function AuthScreen({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const persistSession = async (profile) => {
    await AsyncStorage.setItem("@user_session", JSON.stringify(profile));
    if (onLoginSuccess) {
      onLoginSuccess(profile);
    }
  };

  const handleEmailAuth = async () => {
    setErrorMsg("");
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const userProfile = {
        email: email.trim().toLowerCase(),
        username: username.trim() || email.split("@")[0],
        provider: "email",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
        token: "session_" + Date.now(),
        createdAt: new Date().toISOString(),
      };
      await persistSession(userProfile);
    } catch (e) {
      setErrorMsg("Authentication error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const googleProfile = {
        email: "streamer.user@gmail.com",
        username: "Google User",
        provider: "google",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
        token: "google_token_" + Date.now(),
        createdAt: new Date().toISOString(),
      };
      await persistSession(googleProfile);
    } catch (e) {
      setErrorMsg("Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    setLoading(true);
    try {
      const fbProfile = {
        email: "streamer.user@facebook.com",
        username: "Facebook User",
        provider: "facebook",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200",
        token: "fb_token_" + Date.now(),
        createdAt: new Date().toISOString(),
      };
      await persistSession(fbProfile);
    } catch (e) {
      setErrorMsg("Facebook Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="play" size={30} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Stream-Hub</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Create an account to start streaming" : "Sign in to access your library & downloads"}
          </Text>
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        {/* Social Authentication */}
        <View style={styles.socialGroup}>
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleAuth}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.facebookBtn}
            onPress={handleFacebookAuth}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Ionicons name="logo-facebook" size={19} color="#FFFFFF" />
            <Text style={styles.facebookBtnText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Traditional Form */}
        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#7E7E8A" />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#7E7E8A"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#7E7E8A" />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#7E7E8A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#7E7E8A" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#7E7E8A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleEmailAuth}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isSignUp ? "Sign Up with Email" : "Log In"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
            }}
          >
            <Text style={styles.toggleText}>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <Text style={styles.toggleTextBold}>
                {isSignUp ? "Log In" : "Sign Up"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0C13",
  },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF334B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 13,
    color: "#7E7E8A",
    marginTop: 6,
    textAlign: "center",
  },
  errorText: {
    color: "#FF334B",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 14,
  },
  socialGroup: {
    gap: 10,
    marginBottom: 20,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    height: 48,
    borderRadius: 10,
    gap: 10,
  },
  googleBtnText: {
    color: "#1F1F1F",
    fontSize: 14,
    fontWeight: "600",
  },
  facebookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1877F2",
    height: 48,
    borderRadius: 10,
    gap: 10,
  },
  facebookBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#20202E",
  },
  dividerText: {
    color: "#7E7E8A",
    fontSize: 12,
    marginHorizontal: 12,
    fontWeight: "600",
  },
  form: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16161F",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "#252535",
    gap: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  submitBtn: {
    height: 48,
    backgroundColor: "#FF334B",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  toggleBtn: {
    alignItems: "center",
    marginTop: 10,
  },
  toggleText: {
    color: "#7E7E8A",
    fontSize: 13,
  },
  toggleTextBold: {
    color: "#FF334B",
    fontWeight: "700",
  },
});
