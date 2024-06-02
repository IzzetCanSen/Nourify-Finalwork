import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import moment from "moment";
import MealDetailScreen from "@/components/MealDetailScreen";
import { auth, db } from "@/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, doc, getDoc } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";

type NutrientKey = "CAL" | "PROT" | "CARB" | "FAT";

const nutrientColors: Record<NutrientKey, string> = {
  CAL: "#ff4d4d",
  PROT: "#4dff4d",
  CARB: "#ffcc00",
  FAT: "#cc33ff",
};

const mealsList = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function TabTwoScreen() {
  const [user, loading, error] = useAuthState(auth);
  const [selectedDate, setSelectedDate] = useState<string>(
    moment().format("YYYY-MM-DD")
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const initialScrollDone = useRef<boolean>(false);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [mealsData, setMealsData] = useState<any>({});
  const [totals, setTotals] = useState<Record<NutrientKey, number>>({
    CAL: 0,
    PROT: 0,
    CARB: 0,
    FAT: 0,
  });

  const startDate = moment().subtract(1, "month");
  const endDate = moment().add(1, "month");
  const dates: { day: string; date: string }[] = [];

  for (let date = startDate; date <= endDate; date.add(1, "day")) {
    dates.push({
      day: date.format("ddd"),
      date: date.clone().format("YYYY-MM-DD"),
    });
  }

  useEffect(() => {
    if (!initialScrollDone.current) {
      const todayIndex = dates.findIndex(
        (date) => date.date === moment().format("YYYY-MM-DD")
      );
      if (scrollViewRef.current) {
        const dateItemWidth = 85;
        scrollViewRef.current.scrollTo({
          x: todayIndex * dateItemWidth,
          animated: true,
        });
        initialScrollDone.current = true;
      }
    }
  }, [dates]);

  useEffect(() => {
    const fetchMealsData = async () => {
      if (user) {
        try {
          const mealLogDocRef = doc(
            db,
            "users",
            user.uid,
            "mealLogs",
            selectedDate
          );

          let fetchedMealsData: any = {};
          let totalCalories = 0;
          let totalProtein = 0;
          let totalCarbs = 0;
          let totalFat = 0;

          for (let meal of mealsList) {
            const mealDocRef = doc(mealLogDocRef, "meals", meal);
            const mealLogDoc = await getDoc(mealDocRef);

            if (mealLogDoc.exists()) {
              const data = mealLogDoc.data();
              fetchedMealsData[meal] = data.items || [];

              data.items.forEach((item: any) => {
                totalCalories += item.calories;
                totalProtein += item.protein;
                totalCarbs += item.carbs;
                totalFat += item.fat;
              });
            } else {
              fetchedMealsData[meal] = [];
            }
          }

          setMealsData(fetchedMealsData);
          setTotals({
            CAL: totalCalories,
            PROT: totalProtein,
            CARB: totalCarbs,
            FAT: totalFat,
          });
        } catch (error) {
          console.error("Error fetching meals data:", error);
        }
      }
    };

    fetchMealsData();
  }, [selectedDate, user]);

  if (loading) {
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

  if (selectedMeal) {
    return (
      <MealDetailScreen
        meal={selectedMeal}
        onBack={() => setSelectedMeal(null)}
        date={selectedDate}
        userId={user.uid}
      />
    );
  }

  const renderNutrientCircle = (nutrient: NutrientKey, value: number) => (
    <View
      style={[styles.nutrientCircle, { borderColor: nutrientColors[nutrient] }]}
    >
      <Text style={[styles.nutrientText, { color: nutrientColors[nutrient] }]}>
        {nutrient}
      </Text>
      <Text style={styles.nutrientValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MealMap</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateNav}
        ref={scrollViewRef}
      >
        {dates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={
              date.date === selectedDate ? styles.selectedDate : styles.date
            }
            onPress={() => setSelectedDate(date.date)}
          >
            <Text style={styles.dayText}>{date.day}</Text>
            <Text style={styles.dateText}>{date.date}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.nutrientCircles}>
        {(["CAL", "PROT", "CARB", "FAT"] as NutrientKey[]).map((nutrient) => (
          <View key={nutrient} style={styles.nutrientCircleContainer}>
            {renderNutrientCircle(nutrient, totals[nutrient])}
          </View>
        ))}
      </View>
      <ScrollView style={styles.mealsContainer}>
        {mealsList.map((meal) => (
          <View key={meal} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>{meal}</Text>
              <TouchableOpacity onPress={() => setSelectedMeal(meal)}>
                <Icon name="more-vert" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.mealItem}>
              {mealsData[meal]
                ?.map((item: any) => `${item.amount}g ${item.name}`)
                .join(", ")}
            </Text>
            {mealsData[meal]?.length > 0 && (
              <View style={styles.mealMacros}>
                <Text style={[styles.macro, { backgroundColor: "#ff4d4d" }]}>
                  {Math.round(
                    mealsData[meal]?.reduce(
                      (sum: number, item: any) => sum + item.calories,
                      0
                    ) || 0
                  )}{" "}
                  Cal
                </Text>
                <Text style={[styles.macro, { backgroundColor: "#ffcc00" }]}>
                  {Math.round(
                    mealsData[meal]?.reduce(
                      (sum: number, item: any) => sum + item.protein,
                      0
                    ) || 0
                  )}{" "}
                  Prot
                </Text>
                <Text style={[styles.macro, { backgroundColor: "#4dff4d" }]}>
                  {Math.round(
                    mealsData[meal]?.reduce(
                      (sum: number, item: any) => sum + item.carbs,
                      0
                    ) || 0
                  )}{" "}
                  Carb
                </Text>
                <Text style={[styles.macro, { backgroundColor: "#cc33ff" }]}>
                  {Math.round(
                    mealsData[meal]?.reduce(
                      (sum: number, item: any) => sum + item.fat,
                      0
                    ) || 0
                  )}{" "}
                  Fat
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
  dateNav: {
    flexDirection: "row",
    minHeight: 80,
    maxHeight: 80,
    backgroundColor: "#1F2831",
    borderRadius: 15,
  },
  date: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    width: 80,
    alignItems: "center",
  },
  selectedDate: {
    padding: 10,
    backgroundColor: "#3FA1CA",
    borderRadius: 15,
    marginRight: 10,
    width: 80,
    alignItems: "center",
  },
  dayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  dateText: {
    color: "#fff",
    fontSize: 14,
  },
  nutrientCircles: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 20,
  },
  nutrientCircleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  nutrientCircle: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  nutrientText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  nutrientValue: {
    color: "#fff",
    fontSize: 13,
  },
  mealsContainer: {
    marginTop: 20,
  },
  mealCard: {
    backgroundColor: "#1F2831",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  mealItem: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
  },
  mealMacros: {
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
  errorText: {
    color: "#ff4d4d",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});
