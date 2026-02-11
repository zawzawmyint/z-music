import { Colors } from "@/constants/color";
import { Song } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

interface SongOptionModalProps {
  isVisible: boolean;
  onClose: () => void;
  song: Song | null;
  onRename: () => void;
  onDelete: () => void;
}

const SongOptionModal = ({
  isVisible,
  onClose,
  song,
  onRename,
  onDelete,
}: SongOptionModalProps) => {
  if (!song) return null;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {song.artist}
          </Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => {
            onClose();
            // Small delay to allow modal to close smoothly before opening the next one
            setTimeout(onRename, 300);
          }}
        >
          <Ionicons name="pencil" size={24} color={Colors.text} />
          <Text style={styles.optionText}>Rename</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => {
            onClose();
            setTimeout(onDelete, 300);
          }}
        >
          <Ionicons name="trash-outline" size={24} color="#ff4444" />
          <Text style={[styles.optionText, { color: "#ff4444" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
    position: "relative",
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.outline,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  songTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  songArtist: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.outline,
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    gap: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
  },
});

export default SongOptionModal;
