import BaseContainer from "@/components/global/BaseContainer";
import CurrentPlayingSong from "@/components/song/CurrentPlayingSong";
import SongList from "@/components/song/SongList";
import { Colors } from "@/constants/color";
import { Song } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import {
  AudioSource,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type RepeatMode = "off" | "all" | "one";

const Home = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const currentSongRef = useRef<Song | null>(null);
  const shuffledSongsRef = useRef<Song[]>([]);
  const originalSongsRef = useRef<Song[]>([]);

  // request permissions to access media library
  useEffect(() => {
    (async () => {
      await requestPermission();
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionModeAndroid: "doNotMix",
      });
    })();
  }, []);

  // Load songs from device
  const LoadSongsFromDevice = async () => {
    if (permissionResponse?.status !== "granted") {
      return;
    }
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 3000,
      sortBy: MediaLibrary.SortBy.default,
    });

    const songsList = await Promise.all(
      media.assets.map(async (asset) => {
        const info = await MediaLibrary.getAssetInfoAsync(asset.id);
        return {
          id: asset.id,
          title: asset.filename.replace(/\.[^/.]+$/, ""),
          uri: info.localUri || asset.uri,
          duration: asset.duration,
          artist: "Unknown Artist",
        };
      }),
    );
    setSongs(songsList);
    originalSongsRef.current = songsList;
  };

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array: Song[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Toggle shuffle
  const toggleShuffle = () => {
    const newShuffleState = !isShuffleOn;
    setIsShuffleOn(newShuffleState);

    if (newShuffleState) {
      // Enable shuffle
      const shuffled = shuffleArray(songs);
      shuffledSongsRef.current = shuffled;
    } else {
      // Disable shuffle
      shuffledSongsRef.current = [];
    }
  };

  // Toggle repeat mode: off -> all -> one -> off
  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  // Get current playlist (shuffled or original)
  const getCurrentPlaylist = () => {
    return isShuffleOn ? shuffledSongsRef.current : originalSongsRef.current;
  };

  // Format time in minutes:seconds
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Play song function
  const playSong = async (song: Song) => {
    try {
      // await player.activate();
      player.replace({ uri: song.uri } as AudioSource);
      player.play();

      setCurrentSong(song);
      currentSongRef.current = song;
    } catch (error) {
      console.error("Error playing song:", error);
      Alert.alert("Error", "Failed to play the song. Please try again.");
    }
  };

  // Handle song finished based on repeat mode
  const handleSongFinished = () => {
    console.log("repeatMode", repeatMode);
    if (repeatMode === "one") {
      // Repeat current song
      if (currentSong) {
        playSong(currentSong);
      }
    } else if (repeatMode === "all") {
      // Play next song, loop to start if at end
      playNextSong();
    } else {
      // Play next song, stop if at end
      const playlist = getCurrentPlaylist();
      const currentIndex = playlist.findIndex(
        (song) => song.id === currentSong?.id,
      );

      if (currentIndex < playlist.length - 1) {
        playNextSong();
      } else {
        // Stop playing at the end
        // No need to setIsPlaying(false), status hook will handle it
      }
    }
  };

  useEffect(() => {
    if (status.isLoaded && status.didJustFinish) {
      handleSongFinished();
    }
  }, [status.isLoaded, status.didJustFinish, repeatMode, currentSong]);

  // player controls
  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const playPreviousSong = () => {
    const playlist = getCurrentPlaylist();
    if (playlist.length === 0) return;

    const currentIndex = playlist.findIndex(
      (song) => song.id === currentSong?.id,
    );
    const prevIndex =
      currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    playSong(playlist[prevIndex]);
  };

  const playNextSong = () => {
    const playlist = getCurrentPlaylist();
    if (playlist.length === 0) return;

    const currentIndex = playlist.findIndex(
      (song) => song.id === currentSong?.id,
    );
    const nextIndex = currentIndex === songs.length - 1 ? 0 : currentIndex + 1;
    playSong(playlist[nextIndex]);
  };

  const seekToPosition = async (value: number) => {
    player.seekTo(value / 1000); // Convert milliseconds to seconds
  };

  const handleIsSearching = () => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (permissionResponse?.status !== "granted") return;
    LoadSongsFromDevice();
  }, [permissionResponse]);

  return (
    <>
      <BaseContainer>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Mu-zic Player</Text>
              <Text style={styles.headerSubtitle}>{songs.length} songs</Text>
            </View>
            <View>
              <TouchableOpacity onPress={handleIsSearching}>
                <Ionicons
                  name={isSearching ? "close-circle" : "search-outline"}
                  size={24}
                  style={{ marginRight: 10 }}
                  color={Colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input */}
          {isSearching && (
            <TextInput
              autoFocus
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              cursorColor={Colors.primary}
            />
          )}
          {/* Song List */}
          <SongList
            songs={songs}
            currentSong={currentSong}
            playSong={playSong}
            isSearching={isSearching}
            searchQuery={searchQuery}
          />
        </View>
        {/* Player Controls */}
        {currentSong && (
          <CurrentPlayingSong
            currentSong={currentSong}
            isPlaying={status.playing}
            togglePlayPause={togglePlayPause}
            playPreviousSong={playPreviousSong}
            playNextSong={playNextSong}
            position={status.currentTime * 1000}
            duration={status.duration * 1000}
            formatTime={formatTime}
            seekToPosition={seekToPosition}
            isShuffleOn={isShuffleOn}
            toggleShuffle={toggleShuffle}
            repeatMode={repeatMode}
            toggleRepeat={toggleRepeat}
          />
        )}
      </BaseContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.textSecondary,
  },
  searchInput: {
    padding: 15,
    width: "95%",
    margin: "auto",
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderColor: Colors.text,
    marginBottom: 20,
    color: Colors.text,
  },
});

export default Home;
