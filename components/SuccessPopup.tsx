import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";

interface SuccessPopupProps {
  visible: boolean;
  onClose: () => void;
  message: string;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({
  visible,
  onClose,
  message,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.popupContainer}>
          <Text>{message}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "blue",
  },
});

export default SuccessPopup;
