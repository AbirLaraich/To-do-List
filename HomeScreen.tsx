import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
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
      saveTasks([...tasks, route.params.newTask]);
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
          style={[styles.taskItem, item.completed && styles.taskItemCompleted]}
          onPress={() => updateTaskStatus(item.id)}
        >
          <View style={styles.checkbox}>
            {item.completed && <View style={styles.checkboxInner} />}
          </View>
          <Text 
            style={[
              styles.taskText,
              item.completed && styles.taskTextCompleted
            ]}
          >
            {item.text}
          </Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.subTitle}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate("AddTask")}
        >
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
        
        {tasks.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={removeAllTasks}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.listContainer}>
        {renderSectionHeader('Pending', pendingTasks.length)}
        <FlatList
          style={styles.list}
          data={pendingTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          showsVerticalScrollIndicator={false}
        />

        {completedTasks.length > 0 && (
          <>
            {renderSectionHeader('Completed', completedTasks.length)}
            <FlatList
              style={styles.list}
              data={completedTasks}
              keyExtractor={(item) => item.id}
              renderItem={renderTaskItem}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: '#1A1A1A',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  list: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: '#1A1A1A',
  },
  countBadge: {
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  taskItemCompleted: {
    opacity: 0.9,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  taskText: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  taskTextCompleted: {
    color: '#8E8E93',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 10,
  },
  deleteText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default HomeScreen;