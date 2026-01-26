import { Colors } from "@/constants/color";
import { Song } from "@/lib/types";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import SongItem from "./SongItem";

//Add search query prop to SongList component
const SongList = ({
  songs,
  currentSong,
  playSong,
  isSearching,
  searchQuery,
}: {
  songs: Song[];
  currentSong: Song | null;
  playSong: (song: Song) => void;
  isSearching: boolean;
  searchQuery: string;
}) => {
  // Filter songs based on search query
  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FlatList
      data={isSearching ? filteredSongs : songs}
      renderItem={({ item }) => (
        <SongItem song={item} currentSong={currentSong} playSong={playSong} />
      )}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No songs found currently!. Please wait, songs are loading.
          </Text>
        </View>
      }
      style={styles.songList}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    height: "100%",
    minHeight: 500,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  songList: {
    flex: 1,
  },
});

export default SongList;
