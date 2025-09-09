import React, { useState, useEffect } from "react";
import * as GoogleGenerativeAI from "@google/generative-ai";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import * as Speech from "expo-speech";
import { FontAwesome } from "@expo/vector-icons";
import FlashMessage from "react-native-flash-message";
import { useNavigation } from "@react-navigation/native";

// Fixed import path for Background
import Background from "../components/background";

const GeminiChat = () => {
  type Message = { text: string; user: boolean; id: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopIcon, setShowStopIcon] = useState(false);

  const API_KEY = "AIzaSyA1OAG1LwmqHRIOwPaZNQr6lEuNWaM8XR8";
  const navigation = useNavigation();

  useEffect(() => {
    const startChat = async () => {
      try {
        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt =
          "You are Culina, a cheerful and supportive AI kitchen assistant. Introduce yourself with enthusiasm and warmth. Greet the user like a friendly cooking buddy and explain that you're here to help with recipes, meal planning, cooking questions, and make their kitchen adventures fun and stress-free. Use cheerful language, emojis when appropriate, and show genuine excitement about helping them cook!";
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        setMessages([
          {
            text,
            user: false,
            id: Date.now().toString(),
          },
        ]);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setMessages([
          {
            text: "There seems to be an issue connecting to the AI service. Please check your internet connection and try again! - Culina",
            user: false,
            id: Date.now().toString(),
          },
        ]);
        Alert.alert("Error", "Failed to initialize chat. Please check your internet connection.");
      }
    };

    startChat();
  }, []);

  const sendMessage = async () => {
    if (!userInput.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    setLoading(true);
    const userMessage = { text: userInput, user: true, id: Date.now().toString() };
    setMessages((prev) => [userMessage, ...prev]);

    try {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are Culina, a cheerful and supportive AI kitchen assistant! Always respond with enthusiasm, warmth, and encouragement. Use cheerful language, emojis when appropriate, and show genuine excitement about helping with cooking. Be supportive and make users feel confident in their kitchen adventures. User question: ${userMessage.text}`;
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const botMessage = { text, user: false, id: (Date.now() + 1).toString() };
      setMessages((prev) => [botMessage, ...prev]);

      if (text && !isSpeaking) {
        Speech.speak(text);
        setIsSpeaking(true);
        setShowStopIcon(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
      setUserInput("");
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else if (messages.length > 0) {
      const lastBotMessage = messages.find((m) => !m.user);
      if (lastBotMessage) {
        Speech.speak(lastBotMessage.text);
        setIsSpeaking(true);
      }
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setIsSpeaking(false);
    setShowStopIcon(false);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.user ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      <Text style={item.user ? styles.userMessageText : styles.botMessageText}>{item.text}</Text>
    </View>
  );

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../assets/back.png")}
                style={{ width: 45, height: 45 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Culina AI Assistant</Text>

            <TouchableOpacity onPress={clearMessages} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            inverted
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Hold on! I'm thinking...</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Ask me anything about cooking!"
              onChangeText={setUserInput}
              value={userInput}
              onSubmitEditing={sendMessage}
              style={styles.input}
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              style={[styles.sendButton, !userInput.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!userInput.trim() || loading}
            >
              <Text
                style={[styles.sendButtonText, !userInput.trim() && styles.sendButtonTextDisabled]}
              >
                Send
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.micButton} onPress={toggleSpeech}>
              <FontAwesome
                name={isSpeaking ? "microphone-slash" : "microphone"}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <FlashMessage position="top" />
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 30, 
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    zIndex: 1,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ff3b30",
    borderRadius: 15,
  },
  clearButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  botMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e5ea",
    borderBottomLeftRadius: 4,
  },
  userMessageText: {
    color: "white",
    fontSize: 16,
  },
  botMessageText: {
    color: "#000",
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8, 
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
  },
  sendButtonTextDisabled: {
    color: "#999",
  },
  micButton: {
    marginLeft: 8,
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 20,
  },
});

export default GeminiChat;
