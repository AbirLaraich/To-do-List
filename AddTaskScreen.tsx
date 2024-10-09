import React, { useState } from "react";
import { Button, TextInput, View, Text, Alert } from "react-native";
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

    const storedTasks = await SecureStore.getItemAsync(TASKS_STORAGE_KEY);
    const tasks = storedTasks ? JSON.parse(storedTasks) : [];

    const updatedTasks = [...tasks, newTask];

    try {
      await SecureStore.setItemAsync(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      setTaskName("");
      navigation.navigate("Home", { newTask }); 
    } catch (error) {
      console.error("Error saving tasks", error);
    }

    Alert.alert("Success", "Task added successfully!");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Add New Todo</Text>
      <TextInput
        style={{
          width: "100%",
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 20,
          borderRadius: 5,
        }}
        placeholder="Enter your task"
        value={taskName}
        onChangeText={setTaskName}
      />
      <Button title="Add Task" onPress={addTask} />
    </View>
  );
};

export default AddTaskScreen;