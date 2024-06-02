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
import { Svg, Circle } from "react-native-svg";
import MealDetailScreen from "@/components/MealDetailScreen";
import { auth } from "@/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

type NutrientKey = "CAL" | "PROT" | "CARB" | "FAT";

const nutrientColors: Record<NutrientKey, string> = {
  CAL: "#ff4d4d",
  PROT: "#4dff4d",
  CARB: "#ffcc00",
  FAT: "#cc33ff",
};

const data: Record<NutrientKey, number> = {
  CAL: 356,
  PROT: 48,
  CARB: 59,
  FAT: 31,
};

const totalValue = Object.values(data).reduce((sum, value) => sum + value, 0);

const renderPieChart = (nutrient: NutrientKey, value: number) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const percentage = value / totalValue;
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <Svg width="85" height="85" viewBox="0 0 85 85">
      <Circle
        cx="42.5"
        cy="42.5"
        r={radius}
        stroke={nutrientColors[nutrient]}
        strokeWidth="5"
        fill="none"
        strokeDasharray={circumference.toString()}
        strokeDashoffset={strokeDashoffset.toString()}
      />
      <Circle
        cx="42.5"
        cy="42.5"
        r={radius}
        stroke="#1F2831"
        strokeWidth="5"
        fill="none"
      />
    </Svg>
  );
};

export default function TabTwoScreen() {
  const [user, loading, error] = useAuthState(auth);
  const [selectedDate, setSelectedDate] = useState<string>(
    moment().format("YYYY-MM-DD")
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const initialScrollDone = useRef<boolean>(false);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);

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
          <View key={nutrient} style={styles.nutrientCircle}>
            {renderPieChart(nutrient, data[nutrient])}
            <Text style={styles.nutrientText}>{nutrient}</Text>
            <Text style={styles.nutrientValue}>{data[nutrient]}</Text>
          </View>
        ))}
      </View>
      <View style={styles.meals}>
        {["Breakfast", "Lunch", "Dinner", "Snack"].map((meal, index) => (
          <TouchableOpacity
            key={index}
            style={styles.meal}
            onPress={() => setSelectedMeal(meal)}
          >
            <Text style={styles.mealText}>{meal}</Text>
            <Text style={styles.plus}>+</Text>
          </TouchableOpacity>
        ))}
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
  dateNav: {
    flexDirection: "row",
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
  },
  nutrientCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  nutrientText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    position: "absolute",
    top: "40%",
  },
  nutrientValue: {
    color: "#fff",
    fontSize: 13,
    position: "absolute",
    bottom: "30%",
  },
  meals: {
    justifyContent: "center",
  },
  meal: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#1F2831",
    borderRadius: 10,
    marginBottom: 10,
  },
  mealText: {
    color: "#fff",
    fontSize: 18,
  },
  plus: {
    color: "#fff",
    fontSize: 18,
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});
