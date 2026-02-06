import BaseContainer from "@/components/global/BaseContainer";
import { Colors } from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const About = () => {
  return (
    <BaseContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Z-Music 🎧</Text>
        <Text style={styles.subtitle}>Your Ultimate Music Companion</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.credits}>Made with ❤️ by Zack </Text>
        <Text style={[styles.credits, { color: Colors.text, bottom: 10 }]}>
          <Ionicons name="logo-github" size={32} color={Colors.text} />
          https://github.com/zawzawmyint
        </Text>
      </View>
    </BaseContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 18,
    color: "#BDBDBD",
    marginBottom: 20,
    textAlign: "center",
  },
  version: {
    fontSize: 14,
    color: "#828282",
    marginBottom: 40,
  },
  credits: {
    fontSize: 16,
    color: "#BDBDBD",
    position: "absolute",
    bottom: 40,
  },
});

export default About;
