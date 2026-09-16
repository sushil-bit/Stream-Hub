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

  const handleAuth = async () => {
    setErrorMsg("");
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Mock session token and profile persistence
      const userProfile = {
        email: email.trim().toLowerCase(),
        username: username.trim() || email.split("@")[0],
        token: "session_" + Date.now(),
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem("@user_session", JSON.stringify(userProfile));
      
      // Notify parent root navigator
      if (onLoginSuccess) {
        onLoginSuccess(userProfile);
      }
    } catch (e) {
      setErrorMsg("Authentication error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="play" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Stream-Hub</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Create an account to start streaming" : "Sign in to access your library & downloads"}
          </Text>
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#7E7E8A" />
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
            <Ionicons name="mail-outline" size={20} color="#7E7E8A" />
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
            <Ionicons name="lock-closed-outline" size={20} color="#7E7E8A" />
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
            onPress={handleAuth}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isSignUp ? "Sign Up" : "Log In"}
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
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              <Text style={styles.toggleTextBold}>
                {isSignUp ? "Log In" : "Sign Up"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0C13",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FF334B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#7E7E8A",
    marginTop: 8,
    textAlign: "center",
  },
  errorText: {
    color: "#FF334B",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  form: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16161F",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: "#252535",
    gap: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
  },
  submitBtn: {
    height: 52,
    backgroundColor: "#FF334B",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  toggleBtn: {
    alignItems: "center",
    marginTop: 12,
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
