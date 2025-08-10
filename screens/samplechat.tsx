/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect,  useRef,  useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

type Message = {
    id: number|string;
    text: string;
    sender: 'user1' | 'other';
};

const SampleChat = ()=> {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const wsRef = useRef<WebSocket | null>(null);
    const ws = (new WebSocket('ws://10.0.2.2:8001/ws'))

  const randomId_generator = () => {
    return Math.floor(Math.random() * 1000000);
  }



    useEffect(() => {
         wsRef.current = ws;
        ws.onopen = () => {
            console.log('Connected to the WebSocket server.');
            ws.send('Hello Server!');
  }
        ws.onmessage = (event) => {
            setMessages((prev) => [
                ...prev,
                { id: randomId_generator(),  text: event.data, sender: 'other' },
            ]);
        };
        return () => {
            ws?.close();
        };
    }, []);

    const sendMessage = () => {
        if (input.trim() && ws.readyState === WebSocket.OPEN) {
     
            setMessages((prev) => [
                ...prev,
                {id:randomId_generator(), text: input, sender: 'user1' },
            ]);
            ws.send(input);
            setInput('');
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.message,
                            item.sender === 'user1' ? styles.me : styles.other,
                        ]}
                    >
                        <Text>{item.text}</Text>
                    </View>
                )}
            />
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type a message..."
                />
                <Button title="Send" onPress={sendMessage} />
            </View>
        </View>
    );
}
export default SampleChat;
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    message: {
        padding: 10,
        marginVertical: 4,
        borderRadius: 8,
        maxWidth: '80%',
    },
    me: {
        alignSelf: 'flex-end',
        backgroundColor: '#daf8cb',
    },
    other: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f0f0',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginRight: 8,
    },
});