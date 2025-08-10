/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
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


const ChatScreen = () => {
  const [message, setMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<TMessage[]>([]);

  const sessionId = Math.random().toString().substring(10)
  const localhost = "10.0.2.2:8000"
  const audioStatus = false

  // Replace with your actual WebSocket server URL
  const wsUrl = `ws://${localhost}/ws/${sessionId}?is_audio=${audioStatus}`;
  const  ws = useRef(new WebSocket(wsUrl));
  const randomId_generator = () => {
    const int_num = Math.floor(Math.random() * 900000) + 100000;
    const str_num = int_num.toString();
    return str_num;
  }
  useEffect(() => {
    ws.current.onopen = () => {
      setMessage("Hi Server")
      const trimmedMessage = message.trim();
      console.log(trimmedMessage);
      sendSocketMessage({
        mime_type: 'text/plain',
        data: "Hi Server",
      });
      console.log('WebSocket connection established');
      setChatHistory(prev => [
        ...prev,
        {
          _id: randomId_generator(),
          text: 'Connection opened',
          user: 'system',
          createdAt: Date.now(),
        },
      ]);
      setMessage("")
    };

 ws.current.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data);

    if (msg.mime_type === "text/plain" && msg.data) {
      setChatHistory(prev => {
        // If last message is from bot, append text
        if (prev.length > 0 && prev[prev.length - 1].user === 'adk') {
          const updatedLast = {
            ...prev[prev.length - 1],
            text: prev[prev.length - 1].text + msg.data
          };
          return [...prev.slice(0, -1), updatedLast];
        }
        // Else create a new bot message
        return [
          ...prev,
          { _id: Date.now(), text: msg.data, user: 'adk', createdAt: Date.now() }
        ];
      });
    }
  } catch (err) {
    console.error("Error parsing WS message:", err);
  }
};


    ws.current.onclose = () => {
      setChatHistory(prev => [
        ...prev,
        {
          _id: sessionId+123,
          text: 'Connection closed',
          user: 'system',
          createdAt: Date.now(),
        },
      ]);
    };

    ws.current.onerror = (e) => {
      console.error('WebSocket error:', e);
    };
  }
    , []);

     const sendSocketMessage = (msg:any) => {

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(msg));
 
        console.log('[CLIENT TO AGENT] ', msg);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    } else {
      console.warn('WebSocket not open. Message not sent:', message);
    }
  }; 

  const sendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      Alert.alert('Empty Message', 'Please type a message before sending.');
      return;
    }

    const newUserMessage: TMessage = {
      _id: randomId_generator(),
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
        _id: randomId_generator(),
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
          color={"blue"}
        />
      </View>
    </KeyboardAvoidingView>
  );
};



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


export default ChatScreen;
