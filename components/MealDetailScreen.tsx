import React, { useState } from "react";
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
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";
import { db } from "@/firebaseConfig";

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
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

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
      setResults(response.data.items);
    } catch (error) {
      console.error("Error fetching data from API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: any) => {
    setSelectedItems((prev) => [...prev, { ...item, amount: 100 }]);
  };

  const handleEditAmount = (increment: boolean) => {
    if (editingItem) {
      setSelectedItems((prev) =>
        prev.map((item) =>
          item.name === editingItem.name
            ? { ...item, amount: item.amount + (increment ? 10 : -10) }
            : item
        )
      );
    }
  };

  const handleStartEditing = (item: any) => {
    setEditingItem(item);
    setEditing(true);
  };

  const handleSaveEditing = () => {
    setEditing(false);
    setEditingItem(null);
  };

  const saveMealLog = async () => {
    try {
      const mealLogDocRef = doc(
        collection(db, "users", userId, "mealLogs"),
        date
      );

      const mealsCollectionRef = collection(mealLogDocRef, "meals");
      const mealDocRef = doc(mealsCollectionRef, meal);

      await setDoc(mealDocRef, {
        items: selectedItems,
        updatedAt: serverTimestamp(),
      });

      console.log("Meal log saved successfully!");
    } catch (error) {
      console.error("Error saving meal log:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{meal}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Scan meal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
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
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectItem(item)}
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
              {editing && editingItem?.name === item.name ? (
                <>
                  <TouchableOpacity
                    onPress={() => handleEditAmount(false)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.itemAmount}>{item.amount}g</Text>
                  <TouchableOpacity
                    onPress={() => handleEditAmount(true)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveEditing}
                    style={styles.checkButton}
                  >
                    <Text style={styles.checkButtonText}>✓</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.itemAmount}>{item.amount}g</Text>
                  <TouchableOpacity
                    onPress={() => handleStartEditing(item)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            <View style={styles.macros}>
              <Text style={[styles.macro, { backgroundColor: "#ff4d4d" }]}>
                {Math.round((item.calories * item.amount) / 100)} Cal
              </Text>
              <Text style={[styles.macro, { backgroundColor: "#ffcc00" }]}>
                {Math.round((item.protein_g * item.amount) / 100)} Prot
              </Text>
              <Text style={[styles.macro, { backgroundColor: "#4dff4d" }]}>
                {Math.round((item.carbohydrates_total_g * item.amount) / 100)}{" "}
                Carb
              </Text>
              <Text style={[styles.macro, { backgroundColor: "#cc33ff" }]}>
                {Math.round((item.fat_total_g * item.amount) / 100)} Fat
              </Text>
            </View>
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
  editButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#3FA1CA",
    marginHorizontal: 5,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 18,
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
