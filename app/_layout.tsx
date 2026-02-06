import { Colors } from "@/constants/color";
import { useKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  useKeepAwake();
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      {/* hidden when scroll up */}
      <StatusBar style="light" />
    </SafeAreaView>
  );
}
