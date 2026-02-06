import { Colors } from "@/constants/color";
import { Song } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const SongItem = ({
  song,
  currentSong,
  playSong,
}: {
  song: Song;
  currentSong: Song | null;
  playSong: (song: Song) => void;
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Repeat the animation forever (-1 means infinite repetitions)
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000, // Animation duration (ms)
        easing: Easing.linear, // Linear easing for a smooth loop
      }),
      -1, // Number of repetitions: -1 is infinite
      false, // Reverse: false means it restarts from 0deg each time
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });
  return (
    <TouchableOpacity
      style={[
        styles.songItem,
        currentSong?.id === song.id && styles.selectedSongItem,
      ]}
      onPress={() => playSong(song)}
    >
      <View style={styles.songInfo}>
        <Ionicons
          name={
            currentSong?.id === song.id
              ? "logo-playstation"
              : "musical-notes-outline"
          }
          size={22}
          color={currentSong?.id === song.id ? Colors.primary : Colors.text}
          // style={animatedStyle}
        />
        <View style={styles.songTitleContainer}>
          <Text
            style={[
              styles.songTitle,
              currentSong?.id === song.id && { color: Colors.primary },
            ]}
          >
            {song.title}
          </Text>
          <Text style={styles.songArtist}>{song.artist}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  songItem: {
    padding: 15,
  },
  selectedSongItem: {
    backgroundColor: Colors.outline,
  },
  songInfo: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  songTitleContainer: {
    flex: 1,
    gap: 2,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  songArtist: {
    fontSize: 14,
    marginTop: 2,
    color: Colors.textSecondary,
  },
});

export default SongItem;
