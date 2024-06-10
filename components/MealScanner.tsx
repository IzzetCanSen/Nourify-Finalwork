import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraType, useCameraPermissions, CameraView } from "expo-camera";
import axios from "axios";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";

interface FoodItem {
  name: string;
  amount: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
}

interface MealScannerProps {
  onScan: (foodItems: string[]) => void;
  onCancel: () => void;
}

export default function MealScanner({ onScan, onCancel }: MealScannerProps) {
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraType] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", color: "#fff" }}>
          We need your permission to show the camera
        </Text>
        <Button
          onPress={async () => {
            await requestPermission();
          }}
          title="Grant Permission"
        />
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef) {
      setLoading(true);
      try {
        const photo = await cameraRef.takePictureAsync({ base64: true });
        if (!photo || !photo.base64) {
          throw new Error("Failed to capture photo");
        }

        const imageData = photo.base64;

        const response = await axios.post(
          "https://api.clarifai.com/v2/models/food-item-recognition/versions/1d5fd481e0cf4826aa72ec3ff049e044/outputs",
          {
            inputs: [
              {
                data: {
                  image: {
                    base64: imageData,
                  },
                },
              },
            ],
          },
          {
            headers: {
              Authorization: `Key ${process.env.EXPO_PUBLIC_CLARIFAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const topThreeFoodItems = parseClarifaiResponse(response.data);
        onScan(topThreeFoodItems);
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Failed to fetch food details from Clarifai");
      } finally {
        setLoading(false);
      }
    }
  };

  const parseClarifaiResponse = (data: any): string[] => {
    const concepts = data.outputs[0].data.concepts;
    console.log(concepts);
    const topThree = concepts.slice(0, 5).map((concept: any) => concept.name);
    return topThree;
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={cameraType}
        ref={(ref) => {
          if (ref) {
            setCameraRef(ref);
          }
        }}
      />
      {loading && (
        <ActivityIndicator size="large" color="#fff" style={styles.loading} />
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCapture} style={styles.captureButton}>
          <Icon2 name="camera" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          {/* <Text style={styles.cancelButtonText}>Cancel</Text> */}
          <Icon2 name="cancel" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222E3A",
  },
  camera: {
    flex: 1,
  },
  loading: {
    position: "absolute",
  },
  buttonContainer: {
    width: "62%",
    position: "absolute",
    right: 8,
    bottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "rgba(200, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 50,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  captureButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 20,
    borderRadius: 50,
  },
  captureButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
