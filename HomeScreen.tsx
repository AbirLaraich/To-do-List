import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Swipeable } from "react-native-gesture-handler";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TASKS_STORAGE_KEY = "tasks";

const HomeScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();

    if (route.params?.newTask) {
      setTasks((prevTasks) => [...prevTasks, route.params.newTask]);
    }
  }, [route.params]);

  const loadTasks = async () => {
    try {
      const storedTasks = await SecureStore.getItemAsync(TASKS_STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error("Error loading tasks", error);
    }
  };

  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      await SecureStore.setItemAsync(
        TASKS_STORAGE_KEY,
        JSON.stringify(tasksToSave)
      );
    } catch (error) {
      console.error("Error saving tasks", error);
    }
  };

  const removeAllTasks = () => {
    Alert.alert("Confirm", "Are you sure you want to remove all tasks?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => {
          setTasks([]);
          saveTasks([]);
        },
      },
    ]);
  };

  const updateTaskStatus = (id: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        onPress={() => deleteTask(id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <TouchableOpacity
          style={styles.taskItem}
          onPress={() => updateTaskStatus(item.id)}
        >
          <Text style={styles.taskText}>{item.text}</Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To do list</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Add a new todo"
          onPress={() => navigation.navigate("AddTask")}
        />
        <Button title="Remove todos" onPress={removeAllTasks} color="red" />
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.subTitle}>Pending</Text>
        <FlatList
          style={styles.list}
          data={tasks.filter((task) => !task.completed)}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
        />

        <Text style={styles.subTitle}>Completed</Text>
        <FlatList
          style={styles.list}
          data={tasks.filter((task) => task.completed)}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  list: {
    width: '100%',
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  taskItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    width: '100%',
  },
  taskText: {
    fontSize: 18,
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default HomeScreen;