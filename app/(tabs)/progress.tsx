import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import CustomLineChart from "@/components/CustomLineChart";
import { Dimensions } from "react-native";
import { auth, db } from "@/firebaseConfig";
import Icon from "react-native-vector-icons/MaterialIcons";
const screenWidth = Dimensions.get("window").width;

export default function ProgressScreen() {
  const [user, loading, error] = useAuthState(auth);
  const [weight, setWeight] = useState<number>(0);
  const [weights, setWeights] = useState<number[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchWeightData();
    }
  }, [user]);

  const fetchWeightData = async () => {
    try {
      const userDocRef = doc(db, "users", user?.uid || "");
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const fetchedWeights = userData.weights || [];
        const fetchedDates = userData.dates || [];
        const initialWeight =
          fetchedWeights.length > 0
            ? fetchedWeights[fetchedWeights.length - 1]
            : userData.weight;

        setWeights(fetchedWeights);
        setDates(fetchedDates);
        setWeight(initialWeight);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching weight data:", error);
      setIsLoading(false);
    }
  };

  const handleWeightChange = (newWeight: string) => {
    const weightNumber = parseFloat(newWeight);
    if (!isNaN(weightNumber)) {
      setWeight(weightNumber);
    }
  };

  const handleWeightSubmit = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const currentDate = new Date().toLocaleDateString("en-GB");

      const dateIndex = dates.indexOf(currentDate);

      if (dateIndex === -1) {
        const newWeights = [...weights, weight];
        const newDates = [...dates, currentDate];

        await updateDoc(userDocRef, {
          weights: newWeights,
          dates: newDates,
        });

        setWeights(newWeights);
        setDates(newDates);
        setErrorMessage("");
      } else {
        const newWeights = [...weights];
        newWeights[dateIndex] = weight;

        await updateDoc(userDocRef, {
          weights: newWeights,
        });

        setWeights(newWeights);
        setErrorMessage("");
      }
    }
  };

  if (loading || isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3FA1CA" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load user data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>
      {weights.length > 0 && dates.length > 0 ? (
        <CustomLineChart
          data={weights}
          labels={dates}
          width={screenWidth / 6}
          height={220}
        />
      ) : (
        <Text style={styles.errorText}>No weight data available.</Text>
      )}
      <View>
        <View style={styles.weightContainer}>
          <TouchableOpacity
            onPress={() =>
              setWeight((prevWeight) => Math.max(prevWeight - 0.5, 0))
            }
          >
            <Icon name="do-disturb-on" size={28} color="#fff" />
          </TouchableOpacity>
          <TextInput
            style={styles.weightInput}
            keyboardType="numeric"
            value={`${weight}`}
            onChangeText={(text) => handleWeightChange(text)}
          />
          <TouchableOpacity
            onPress={() => setWeight((prevWeight) => prevWeight + 0.5)}
          >
            <Icon name="add-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleWeightSubmit}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
        {errorMessage ? (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222E3A",
    padding: 20,
    paddingTop: 60,
    gap: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  weightContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 35,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
  },
  weightInput: {
    color: "#fff",
    fontSize: 20,
    marginHorizontal: 30,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
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
  errorText: {
    color: "#ff4d4d",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  errorMessage: {
    color: "#ff4d4d",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});
