import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import * as Speech from "expo-speech";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import FlashMessage, { showMessage } from "react-native-flash-message";

const GeminiChat = () => {
  type Message = { text: string; user: boolean; id: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopIcon, setShowStopIcon] = useState(false);

  const API_KEY = "AIzaSyA1OAG1LwmqHRIOwPaZNQr6lEuNWaM8XR8";

  useEffect(() => {
    const startChat = async () => {
      try {
        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Introduce yourself as Culina, an AI kitchen assistant. Greet the user warmly and explain that you can help with recipes, meal planning, and cooking questions. Keep it friendly and welcoming.";
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
        // If there's an error, set a default greeting message
        setMessages([
          {
            text: "Hello! I'm Culina, your AI kitchen assistant. How can I help you today? I can suggest recipes, help with meal planning, or answer cooking questions.",
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
      const prompt = userMessage.text;
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      const botMessage = { text, user: false, id: (Date.now() + 1).toString() };
      setMessages((prev) => [botMessage, ...prev]);
      
      // TTS
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
      const lastBotMessage = messages.find(m => !m.user);
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
    <View style={[styles.messageContainer, item.user ? styles.userMessageContainer : styles.botMessageContainer]}>
      <Text style={item.user ? styles.userMessageText : styles.botMessageText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
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
            <Text style={[styles.sendButtonText, !userInput.trim() && styles.sendButtonTextDisabled]}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 1, // Ensure header stays on top
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff3b30',
    borderRadius: 15,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 10,
    paddingHorizontal: 10, // Add horizontal padding for messages
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  userMessageText: {
    color: 'white',
    fontSize: 16,
  },
  botMessageText: {
    color: '#000',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20, // Add extra padding at bottom
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8, // Add margin to separate from buttons
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#999',
  },
  micButton: {
    marginLeft: 8,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
});

export default GeminiChat;
