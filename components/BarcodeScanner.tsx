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

interface BarcodeScannerProps {
  onScan: (product: any) => void;
  onCancel: () => void;
}

export default function BarcodeScanner({
  onScan,
  onCancel,
}: BarcodeScannerProps) {
  const [scanned, setScanned] = useState(false);
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

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);

    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v3/product/${data}.json`
      );
      console.log(
        `https://world.openfoodfacts.org/api/v3/product/${data}.json`
      );
      const product = response.data.product;
      if (product) {
        const foodItem = {
          name: product.product_name || "Name not found",
          amount: 100,
          calories: product.nutriments["energy-kcal_100g"] || 0,
          carbs: product.nutriments["carbohydrates_100g"] || 0,
          fat: product.nutriments["fat_100g"] || 0,
          protein: product.nutriments["proteins_100g"] || 0,
        };
        console.log(foodItem);
        onScan(foodItem);
      } else {
        Alert.alert("Error", "Product details not found");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch product details");
    } finally {
      setLoading(false);
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={cameraType}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13"],
        }}
      />
      {loading && (
        <ActivityIndicator size="large" color="#fff" style={styles.loading} />
      )}
      <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222E3A",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  loading: {
    position: "absolute",
  },
  cancelButton: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "#3FA1CA",
    padding: 15,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
