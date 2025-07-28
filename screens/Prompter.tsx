import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert // For better error display
} from 'react-native';
import { TMessage } from '../type';
import { askAgent } from '../main';

const ChatScreen = () => {
  const [message, setMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<TMessage[]>([]);


const sendMessage = async () => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    Alert.alert('Empty Message', 'Please type a message before sending.');
    return;
  }

  // Add user's message to chat
  const newUserMessage: TMessage = {
    _id: String(Date.now()),
    text: trimmedMessage,
    user: 'user',
    createdAt: Date.now(),
  };
  setChatHistory(prev => [...prev, newUserMessage]);
  setMessage(''); // Clear input

  try {
    const responseList = await askAgent(trimmedMessage); // This returns TAgentResponse[]
    console.log("got this reponse from agent:", responseList);

    // Extract the last model message that includes plain text
    const lastModelMessage = [...responseList].reverse().find(
      (item) =>
        item.content?.role === 'model' &&
        item.content.parts?.some((p:any) => 'text' in p)
    );

    const agentReplyText =
      lastModelMessage?.content.parts.find((p:any) => 'text' in p)?.text ??
      '[No reply from agent]';

    const newADKMessage: TMessage = {
      _id: String(Date.now() + 1),
      text: agentReplyText,
      user: 'adk',
      createdAt: Date.now(),
    };

    setChatHistory(prev => [...prev, newADKMessage]);
  } catch (error) {
  console.error('Error communicating with ADK:', error);
  let errorMessage = 'An unexpected error occurred.';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object') {
    errorMessage = JSON.stringify(error);
  }

  const systemMessage: TMessage = {
    _id: String(Date.now() + 1),
    text: `Error: ${errorMessage}`,
    user: 'system',
    createdAt: Date.now(),
  };

  setChatHistory(prev => [...prev, systemMessage]);
  Alert.alert('Communication Error', `Failed to get response: ${errorMessage}`);
}
};

  const renderChatItem = ({ item }: { item: TMessage }) => (
    <View style={[
      styles.messageBubble,
      item.user === 'user' ? styles.userBubble : styles.adkBubble,
      item.user === 'system' && styles.systemBubble // Style for system messages
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Adjust as needed
    >
      <FlatList
        data={chatHistory}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderChatItem}
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        // ref={(ref) => { this.flatList = ref; }} // For auto-scrolling (optional)
        // onContentSizeChange={() => this.flatList.scrollToOffset({ offset: 0, animated: true })}
      />

  

      

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}

          multiline={true} // Allow multiple lines
           // Limit height of input
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
    justifyContent: 'flex-end', // Ensure content starts from bottom
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
    elevation: 1, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6', // Light green
    borderBottomRightRadius: 5, // Pointy corner
  },
  adkBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF', // White
    borderBottomLeftRadius: 5, // Pointy corner
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align items to the bottom if TextInput grows
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    minHeight: 40, // Minimum height
    maxHeight: 120, // Maximum height before scrolling
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