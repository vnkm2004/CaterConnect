import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function SelectionScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <Text style={styles.title}>Welcome to CaterConnect</Text>
        <Text style={styles.subtitle}>Please select your login type</Text>

        <TouchableOpacity
          style={[styles.button, styles.customerButton]}
          onPress={() => router.push("/customer-login")}
        >
          <Text style={styles.buttonText}>Login as Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.businessButton]}
          onPress={() => router.push("/business-login")}
        >
          <Text style={styles.buttonText}>Login as Business</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentBox: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    width: "100%",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  customerButton: {
    backgroundColor: "#007AFF",
  },
  businessButton: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
