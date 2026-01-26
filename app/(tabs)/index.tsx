import BaseContainer from "@/components/global/BaseContainer";
import CurrentPlayingSong from "@/components/song/CurrentPlayingSong";
import SongList from "@/components/song/SongList";
import { Colors } from "@/constants/color";
import { Song } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { AudioSource, useAudioPlayer } from "expo-audio";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const player = useAudioPlayer();
  const currentSongRef = useRef<Song | null>(null);
  const shuffledSongsRef = useRef<Song[]>([]);
  const originalSongsRef = useRef<Song[]>([]);

  // request permissions to access media library
  useEffect(() => {
    (async () => {
      await requestPermission();
    })();
  }, []);

  // Load songs from device
  const LoadSongsFromDevice = async () => {
    if (permissionResponse?.status !== "granted") {
      return;
    }
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 1000,
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
      })
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
    return isShuffleOn ? shuffledSongsRef.current : songs;
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
      player.replace({ uri: song.uri } as AudioSource);
      player.play();

      setCurrentSong(song);
      currentSongRef.current = song;
      setIsPlaying(true);
      setPosition(0);
      setDuration(song.duration * 1000); // Convert to milliseconds
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
        (song) => song.id === currentSong?.id
      );

      if (currentIndex < playlist.length - 1) {
        playNextSong();
      } else {
        // Stop playing at the end
        setIsPlaying(false);
      }
    }
  };

  // Monitor playback status
  useEffect(() => {
    const interval = setInterval(() => {
      if (player.playing) {
        setPosition(player.currentTime * 1000);
        setIsPlaying(true);

        // Update duration if available
        if (player.duration && player.duration > 0) {
          setDuration(player.duration * 1000);
        }
      } else {
        setIsPlaying(false);
      }

      // Check if song finished
      if (
        player.duration &&
        player.currentTime >= player.duration - 0.1 &&
        player.currentTime > 0
      ) {
        handleSongFinished();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    player.playing,
    player.currentTime,
    player.duration,
    repeatMode,
    currentSong,
  ]);

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
      (song) => song.id === currentSong?.id
    );
    const prevIndex =
      currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    playSong(playlist[prevIndex]);
  };

  const playNextSong = () => {
    const playlist = getCurrentPlaylist();
    if (playlist.length === 0) return;

    const currentIndex = playlist.findIndex(
      (song) => song.id === currentSong?.id
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
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input */}
          {isSearching && (
            <TextInput
              style={styles.searchInput}
              placeholder="Search songs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
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
      </BaseContainer>
      {/* Player Controls */}
      {currentSong && (
        <CurrentPlayingSong
          currentSong={currentSong}
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          playPreviousSong={playPreviousSong}
          playNextSong={playNextSong}
          position={position}
          duration={duration}
          formatTime={formatTime}
          seekToPosition={seekToPosition}
          isShuffleOn={isShuffleOn}
          toggleShuffle={toggleShuffle}
          repeatMode={repeatMode}
          toggleRepeat={toggleRepeat}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 30,
    paddingBottom: 20,
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
    padding: 10,
    width: "95%",
    margin: "auto",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 20,
  },
});

export default Home;
