import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";
import { db } from "@/firebaseConfig";
import BarcodeScanner from "./BarcodeScanner";
import MealScanner from "./MealScanner";

interface FoodItem {
  name: string;
  amount: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
}

type MealDetailScreenProps = {
  meal: string;
  onBack: () => void;
  userId: string;
  date: string;
};

export default function MealDetailScreen({
  meal,
  onBack,
  userId,
  date,
}: MealDetailScreenProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [scannedResults, setScannedResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanningMeal, setScanningMeal] = useState(false);

  useEffect(() => {
    const fetchExistingItems = async () => {
      try {
        const mealLogDocRef = doc(db, "users", userId, "mealLogs", date);
        const mealDocRef = doc(mealLogDocRef, "meals", meal);
        const mealDocSnapshot = await getDoc(mealDocRef);

        if (mealDocSnapshot.exists()) {
          const existingItems = mealDocSnapshot.data().items || [];
          setSelectedItems(existingItems);
        }
      } catch (error) {
        console.error("Error fetching existing meal log:", error);
      }
    };

    fetchExistingItems();
  }, [userId, date, meal]);

  const searchFood = async () => {
    if (search.trim() === "") {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        "https://api.calorieninjas.com/v1/nutrition",
        {
          params: { query: search },
          headers: {
            "X-Api-Key": process.env.EXPO_PUBLIC_CALORIENINJAS_API_KEY,
          },
        }
      );
      console.log(response.data.items);
      setResults(response.data.items);
    } catch (error) {
      console.error("Error fetching data from API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = async (item: any, source: "barcode" | "api") => {
    const amount = 100;
    let selectedItem: FoodItem;

    if (source === "barcode") {
      selectedItem = {
        name: item.name,
        amount,
        calories: (item.calories * amount) / 100,
        carbs: (item.carbs * amount) / 100,
        fat: (item.fat * amount) / 100,
        protein: (item.protein * amount) / 100,
      };
    } else {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://api.calorieninjas.com/v1/nutrition",
          {
            params: { query: item.name },
            headers: {
              "X-Api-Key": process.env.EXPO_PUBLIC_CALORIENINJAS_API_KEY,
            },
          }
        );
        const fetchedItem = response.data.items[0];
        selectedItem = {
          name: fetchedItem.name,
          amount,
          calories: (fetchedItem.calories * amount) / 100,
          carbs: (fetchedItem.carbohydrates_total_g * amount) / 100,
          fat: (fetchedItem.fat_total_g * amount) / 100,
          protein: (fetchedItem.protein_g * amount) / 100,
        };
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setLoading(false);
      }
    }

    setSelectedItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (i) => i.name === selectedItem.name
      );
      if (existingItemIndex > -1) {
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = selectedItem;
        return updatedItems;
      }
      return [...prev, selectedItem];
    });
  };

  const handleEditAmount = (increment: boolean) => {
    if (editingItem) {
      setSelectedItems((prev) =>
        prev.map((item) => {
          if (item.name === editingItem.name) {
            const newAmount = item.amount + (increment ? 10 : -10);
            return {
              ...item,
              amount: newAmount,
              calories: (editingItem.calories * newAmount) / editingItem.amount,
              carbs: (editingItem.carbs * newAmount) / editingItem.amount,
              fat: (editingItem.fat * newAmount) / editingItem.amount,
              protein: (editingItem.protein * newAmount) / editingItem.amount,
            };
          }
          return item;
        })
      );
    }
  };

  const handleStartEditing = (item: FoodItem) => {
    setEditingItem(item);
    setEditing(true);
  };

  const handleDeleteItem = async (item: FoodItem) => {
    setSelectedItems((prev) => prev.filter((i) => i.name !== item.name));

    try {
      const mealLogDocRef = doc(db, "users", userId, "mealLogs", date);
      const mealDocRef = doc(mealLogDocRef, "meals", meal);

      const mealDocSnapshot = await getDoc(mealDocRef);
      if (mealDocSnapshot.exists()) {
        const existingItems = mealDocSnapshot.data().items || [];
        const updatedItems = existingItems.filter(
          (i: FoodItem) => i.name !== item.name
        );

        await setDoc(mealDocRef, {
          items: updatedItems,
          updatedAt: serverTimestamp(),
        });

        console.log("Item deleted successfully from Firestore!");
      }
    } catch (error) {
      console.error("Error deleting item from Firestore:", error);
    }
  };

  const handleSaveEditing = () => {
    setEditing(false);
    setEditingItem(null);
  };

  const saveMealLog = async () => {
    try {
      const mealLogDocRef = doc(db, "users", userId, "mealLogs", date);
      const mealDocRef = doc(mealLogDocRef, "meals", meal);

      await setDoc(mealDocRef, {
        items: selectedItems,
        updatedAt: serverTimestamp(),
      });

      console.log("Meal log saved successfully!");
    } catch (error) {
      console.error("Error saving meal log:", error);
    }
  };

  const handleScan = (product: FoodItem) => {
    setScannedResults((prev) => [...prev, product]);
    setScanning(false);
  };

  const handleMealScan = (foodItems: string[]) => {
    const scannedItems = foodItems.map((name) => ({
      name,
      amount: 100,
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
    }));
    setResults((prev) => [...prev, ...scannedItems]);
    setScanningMeal(false);
  };

  return (
    <View style={styles.container}>
      {scanningMeal ? (
        <MealScanner
          onScan={handleMealScan}
          onCancel={() => setScanningMeal(false)}
        />
      ) : scanning ? (
        <BarcodeScanner
          onScan={handleScan}
          onCancel={() => setScanning(false)}
        />
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>{meal}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setScanningMeal(true)}
            >
              <Text style={styles.buttonText}>Scan meal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setScanning(true)}
            >
              <Text style={styles.buttonText}>Scan barcode</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.search}
            placeholder="Search"
            placeholderTextColor="#fff"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={searchFood}
          />
          {loading && <ActivityIndicator size="large" color="#3FA1CA" />}
          <FlatList
            data={[...results, ...scannedResults]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  scannedResults.includes(item)
                    ? handleSelectItem(item, "barcode")
                    : handleSelectItem(item, "api")
                }
                style={styles.resultItem}
              >
                <Text style={styles.resultText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !loading ? (
                <Text style={styles.noResults}>No results found</Text>
              ) : null
            }
          />
          <FlatList
            data={selectedItems}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.selectedItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <TouchableOpacity
                    onPress={() => setShowMenu(item.name)}
                    style={styles.moreButton}
                  >
                    <Icon name="more-vert" size={24} color="#fff" />
                  </TouchableOpacity>
                  {showMenu === item.name && (
                    <View style={styles.menu}>
                      <TouchableOpacity
                        onPress={() => handleStartEditing(item)}
                        style={styles.menuItem}
                      >
                        <Icon name="edit" size={24} color="#fff" />
                        <Text style={styles.menuItemText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteItem(item)}
                        style={styles.menuItem}
                      >
                        <Icon name="delete" size={24} color="#fff" />
                        <Text style={styles.menuItemText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {editing && editingItem?.name === item.name ? (
                  <View style={styles.editContainer}>
                    <TouchableOpacity
                      onPress={() => handleEditAmount(false)}
                      style={styles.editButton}
                    >
                      <Icon name="do-disturb-on" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.itemAmount}>{item.amount}g</Text>
                    <TouchableOpacity
                      onPress={() => handleEditAmount(true)}
                      style={styles.editButton}
                    >
                      <Icon name="add-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveEditing}
                      style={styles.checkButton}
                    >
                      <Text style={styles.checkButtonText}>✓</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.macros}>
                    <Text
                      style={[styles.macro, { backgroundColor: "#ff4d4d" }]}
                    >
                      {Math.round(item.calories)} Cal
                    </Text>
                    <Text
                      style={[styles.macro, { backgroundColor: "#ffcc00" }]}
                    >
                      {Math.round(item.protein)} Prot
                    </Text>
                    <Text
                      style={[styles.macro, { backgroundColor: "#4dff4d" }]}
                    >
                      {Math.round(item.carbs)} Carb
                    </Text>
                    <Text
                      style={[styles.macro, { backgroundColor: "#cc33ff" }]}
                    >
                      {Math.round(item.fat)} Fat
                    </Text>
                  </View>
                )}
              </View>
            )}
            ListEmptyComponent={
              !loading ? (
                <Text style={styles.noResults}>No selected items</Text>
              ) : null
            }
          />
          <TouchableOpacity onPress={saveMealLog} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222E3A",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3FA1CA",
    padding: 15,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  search: {
    backgroundColor: "#1F2831",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: "#1F2831",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  resultText: {
    color: "#fff",
    fontSize: 16,
  },
  noResults: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
  selectedItem: {
    backgroundColor: "#1F2831",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: "#3FA1CA",
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  itemAmount: {
    color: "#fff",
    fontSize: 18,
  },
  moreButton: {
    padding: 5,
  },
  menu: {
    position: "absolute",
    right: 0,
    top: 24,
    backgroundColor: "#1F2831",
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  editButton: {
    padding: 5,
  },
  checkButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#3FA1CA",
    marginLeft: 5,
  },
  checkButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  macros: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  macro: {
    padding: 5,
    borderRadius: 5,
    color: "#fff",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#3FA1CA",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
