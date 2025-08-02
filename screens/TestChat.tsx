/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { TMessage } from '../type';
import { connectWebsocket, sendMessage as sendSocketMessage } from '../main';

const ChatScreen = () => {
  const [message, setMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<TMessage[]>([]);



 useEffect(() => {
   const establish_ws_connection = connectWebsocket({
      onOpen: () => {
        console.log('WebSocket connection established');
        setChatHistory(prev => [
          ...prev,
          {
            _id: String(Date.now()),
            text: 'Connection opened',
            user: 'system',
            createdAt: Date.now(),
          },
        ]);
      },
      onMessage: (msgText:any) => {
        const newAgentMessage: TMessage = {
          _id: String(Date.now() + 1),
          text: msgText,
          user: 'adk',
          createdAt: Date.now(),
        };
        setChatHistory(prev => [...prev, newAgentMessage]);
      },
      onClose: () => {
        setChatHistory(prev => [
          ...prev,
          {
            _id: String(Date.now()),
            text: 'Connection closed',
            user: 'system',
            createdAt: Date.now(),
          },
        ]);
      },
    });
    
  }  
  , []);

  const sendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      Alert.alert('Empty Message', 'Please type a message before sending.');
      return;
    }

    const newUserMessage: TMessage = {
      _id: String(Date.now()),
      text: trimmedMessage,
      user: 'user',
      createdAt: Date.now(),
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setMessage('');

    try {
      sendSocketMessage({
        mime_type: 'text/plain',
        data: trimmedMessage,
      });
    } catch (error) {
      const systemMessage: TMessage = {
        _id: String(Date.now() + 1),
        text: 'Error sending message over WebSocket',
        user: 'system',
        createdAt: Date.now(),
      };
      setChatHistory(prev => [...prev, systemMessage]);
      Alert.alert('WebSocket Error', 'Failed to send message.');
    }
  };

  const renderChatItem = ({ item }: { item: TMessage }) => (
    <View style={[
      styles.messageBubble,
      item.user === 'user' ? styles.userBubble : styles.adkBubble,
      item.user === 'system' && styles.systemBubble
    ]}>
      <Text style={[
        styles.messageText,
        item.user === 'user' ? styles.userText : styles.adkText,
        item.user === 'system' && styles.systemText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <FlatList
        data={chatHistory}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderChatItem}
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline={true}
        />
        <Button
          title="Send"
          onPress={sendMessage}
          disabled={!message.trim()}
          color="#007AFF"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

// (styles remain unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chatListContent: {
    paddingVertical: 10,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 5,
  },
  adkBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 5,
  },
  systemBubble: {
    alignSelf: 'center',
    backgroundColor: '#E0E0E0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#000',
  },
  adkText: {
    color: '#000',
  },
  systemText: {
    color: '#555',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
});
