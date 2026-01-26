import { Colors } from "@/constants/color";
import React from "react";
import { StyleSheet, View } from "react-native";

const BaseContainer = ({ children }: { children: React.ReactNode }) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default BaseContainer;
