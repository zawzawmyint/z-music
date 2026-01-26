import { Colors } from "@/constants/color";
import { Song } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CurrentPlayingSongProps {
  currentSong: Song | null;
  isPlaying: boolean;
  togglePlayPause: () => void;
  playPreviousSong: () => void;
  playNextSong: () => void;
  position: number;
  duration: number;
  formatTime: (milliseconds: number) => string;
  seekToPosition: (value: number) => void;
  isShuffleOn: boolean;
  toggleShuffle: () => void;
  repeatMode: "off" | "all" | "one";
  toggleRepeat: () => void;
}

const CurrentPlayingSong = ({
  currentSong,
  isPlaying,
  togglePlayPause,
  playPreviousSong,
  playNextSong,
  position,
  duration,
  formatTime,
  seekToPosition,
  isShuffleOn,
  toggleShuffle,
  repeatMode,
  toggleRepeat,
}: CurrentPlayingSongProps) => {
  const [isDetailedView, setIsDetailedView] = useState(false);
  return (
    <View style={[styles.playerContainer]}>
      <View style={styles.arrowContainer}>
        <View style={styles.currentSongInfo}>
          <Text style={styles.currentSongTitle}>{currentSong?.title}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsDetailedView(!isDetailedView)}
          style={styles.arrowButton}
        >
          <Ionicons
            name={isDetailedView ? "chevron-down" : "chevron-up"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {isDetailedView && (
        <View style={styles.currentSongInfo}>
          <Text style={styles.currentSongArtist}>{currentSong?.artist}</Text>
        </View>
      )}
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {isDetailedView && (
          <Text style={styles.timeText}>{formatTime(position)}</Text>
        )}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={seekToPosition}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor="white"
          thumbTintColor={Colors.primary}
        />
        {isDetailedView && (
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={toggleShuffle}
          style={[styles.controlButton]}
        >
          <Ionicons
            name="shuffle"
            size={24}
            color={isShuffleOn ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={playPreviousSong}
          style={styles.controlButton}
        >
          <Ionicons name="play-back" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayPause}
          style={styles.controlButton}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={playNextSong} style={styles.controlButton}>
          <Ionicons name="play-forward" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleRepeat} style={[styles.controlButton]}>
          <Ionicons
            name={
              repeatMode === "off"
                ? "repeat"
                : repeatMode === "all"
                ? "repeat"
                : "repeat-sharp"
            }
            size={24}
            color={repeatMode !== "off" ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    padding: 15,
    borderRadius: 20,
    backgroundColor: Colors.text,
    margin: 10,
  },
  arrowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  arrowButton: {
    justifyContent: "flex-end",
    alignItems: "center",
    width: "10%",
  },
  currentSongInfo: {
    marginBottom: 10,
    width: "90%",
    gap: 2,
  },
  currentSongTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    textOverflow: "ellipsis",
    width: "100%",
  },
  currentSongArtist: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: "bold",
    color: "white",
  },
  currentSongDuration: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: "bold",
    color: "white",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  slider: {
    flex: 1,
    // marginHorizontal: 2,
  },
  timeText: {
    fontSize: 14,
    color: Colors.primary,
    // width: 45,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  controlButton: {
    padding: 5,
  },
});

export default CurrentPlayingSong;
