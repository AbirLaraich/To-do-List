import React, { useState } from "react";
import { Button, TextInput, View, Text, Alert, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TASKS_STORAGE_KEY = "tasks";

const AddTaskScreen = ({ navigation }: { navigation: any }) => {
  const [taskName, setTaskName] = useState("");

  const addTask = async () => {
    if (taskName.trim().length === 0) {
      Alert.alert("Error", "Task name cannot be empty");
      return;
    }

    const newTask: Task = {
      id: Math.random().toString(),
      text: taskName,
      completed: false,
    };

    try {
      const storedTasks = await SecureStore.getItemAsync(TASKS_STORAGE_KEY);
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      const updatedTasks = [...tasks, newTask];
      
      await SecureStore.setItemAsync(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      setTaskName("");
      Alert.alert("Success", "Task added successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Home", { newTask }),
        },
      ]);
    } catch (error) {
      console.error("Error saving tasks", error);
      Alert.alert("Error", "Failed to save task");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Todo</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your task"
        value={taskName}
        onChangeText={setTaskName}
      />
      <Button title="Add Task" onPress={addTask} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});

export default AddTaskScreen;