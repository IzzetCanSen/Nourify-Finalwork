import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

export default function TabTwoScreen() {
  const [user] = useAuthState(auth);
  const [calories, setCalories] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [fat, setFat] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCalories(data.adjustedCalories.toString());
          setProtein(
            (((data.protein * 4) / data.adjustedCalories) * 100).toFixed(0)
          );
          setCarbs(
            (((data.carbs * 4) / data.adjustedCalories) * 100).toFixed(0)
          );
          setFat((((data.fat * 9) / data.adjustedCalories) * 100).toFixed(0));
        } else {
          console.log("No such document!");
        }
      }
    };

    fetchData();
  }, [user]);

  const calculateGrams = (
    percentage: string,
    totalCalories: string,
    isFat: boolean = false
  ): string => {
    const calPerGram = isFat ? 9 : 4;
    const grams =
      (parseFloat(totalCalories) * (parseFloat(percentage) / 100)) / calPerGram;
    return grams.toFixed(1);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out!");
      })
      .catch((error) => {
        console.log("Error signing out: ", error);
      });
  };

  const handlePercentageChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(value);
    const totalPercentage =
      parseFloat(protein) + parseFloat(carbs) + parseFloat(fat);
    if (totalPercentage > 100) {
      setError("The total of the added percentages must equal 100%");
    } else {
      setError("");
    }
  };

  const handleSubmit = async () => {
    const totalPercentage =
      parseFloat(protein) + parseFloat(carbs) + parseFloat(fat);
    if (totalPercentage !== 100) {
      setError("The total of the added percentages must equal 100%");
      return;
    }
    setError("");

    if (user) {
      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          protein: ((parseFloat(protein) / 100) * parseFloat(calories)) / 4,
          carbs: ((parseFloat(carbs) / 100) * parseFloat(calories)) / 4,
          fat: ((parseFloat(fat) / 100) * parseFloat(calories)) / 9,
        },
        { merge: true }
      );

      console.log("Form submitted");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Edit targets</Text>
        <View>
          <View style={[styles.input, styles.calories]}>
            <Text style={styles.inputText}>{calories}</Text>
            <Text style={styles.caloriesText}>CAL</Text>
          </View>
          <View style={[styles.input, styles.row]}>
            <View style={styles.inputPercentageContainer}>
              <TextInput
                style={styles.inputPercentage}
                value={protein}
                onChangeText={(value) =>
                  handlePercentageChange(value, setProtein)
                }
                keyboardType="numeric"
              />
              <Text style={styles.inputText}>%</Text>
              <Text style={styles.proteinText}>PROT</Text>
            </View>
            <Text style={styles.inputText}>
              {calculateGrams(protein, calories)}g
            </Text>
          </View>
          <View style={[styles.input, styles.row]}>
            <View style={styles.inputPercentageContainer}>
              <TextInput
                style={styles.inputPercentage}
                value={carbs}
                onChangeText={(value) =>
                  handlePercentageChange(value, setCarbs)
                }
                keyboardType="numeric"
              />
              <Text style={styles.inputText}>%</Text>
              <Text style={styles.carbsText}>CARB</Text>
            </View>
            <Text style={styles.inputText}>
              {calculateGrams(carbs, calories)}g
            </Text>
          </View>
          <View style={[styles.input, styles.row]}>
            <View style={styles.inputPercentageContainer}>
              <TextInput
                style={styles.inputPercentage}
                value={fat}
                onChangeText={(value) => handlePercentageChange(value, setFat)}
                keyboardType="numeric"
              />
              <Text style={styles.inputText}>%</Text>
              <Text style={styles.fatText}>FAT</Text>
            </View>
            <Text style={styles.inputText}>
              {calculateGrams(fat, calories, true)}g
            </Text>
          </View>
        </View>
        <View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log out</Text>
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
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  form: {
    width: "100%",
    height: 550,
    gap: 20,
  },
  label: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  input: {
    width: "100%",
    paddingTop: 12,
    paddingLeft: 16,
    paddingBottom: 12,
    paddingRight: 16,
    marginBottom: 10,
    borderRadius: 10,
    color: "#fff",
    fontSize: 16,
    backgroundColor: "#1F2831",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputPercentageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  inputPercentage: {
    color: "#fff",
    fontSize: 16,
    width: 24,
    textDecorationLine: "underline",
  },
  inputText: {
    color: "#fff",
    fontSize: 16,
  },
  calories: {
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  caloriesText: {
    color: "#EE5858",
    fontSize: 16,
    marginLeft: 10,
  },
  proteinText: {
    color: "#72F584",
    fontSize: 16,
    marginLeft: 10,
  },
  carbsText: {
    color: "#F9C75C",
    fontSize: 16,
    marginLeft: 10,
  },
  fatText: {
    color: "#EE81FA",
    fontSize: 16,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#3fa1ca",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "#d9534f",
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: "#EE5858",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
