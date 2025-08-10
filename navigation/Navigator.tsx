/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Prompter from '../screens/Prompter';
import TestChatScreen from '../screens/TestChat';
import { activateSession, connectWebSocket, } from '../main';
import SampleChat from '../screens/samplechat';


const Tab = createBottomTabNavigator();
const ChatSessionCreate = () => {
 //call session activation api from main.js
//  const starttheSession = activateSession()
//  console.log('Chat session created:', starttheSession);
//call connectWebsocket's onOpen function

  console.log('Chat session created and WebSocket connected');
  
}

const Navigator = () => {
  return (
       <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      {/* <Tab.Screen name="Prompt" component={Prompter}
      listeners={{
              tabPress: () => {
                // Prevent default action (e.g., navigating to the screen)
                // e.preventDefault(); 
                console.log('Chat Screen showed up!');
                ChatSessionCreate(); 
                // Call the function to create a chat session
                // Add your custom logic here
              },
            }}
      /> */}
      <Tab.Screen name="Chat" component={TestChatScreen}
      listeners={{
              tabPress: () => {
                // Prevent default action (e.g., navigating to the screen)
                // e.preventDefault(); 
                console.log('Chat Screen showed up!');
                ChatSessionCreate(); 
                // Call the function to create a chat session
                // Add your custom logic here
              },
            }}
      />
      <Tab.Screen name="Socket Chat" component={SampleChat}/>
    </Tab.Navigator>
  )
}

export default Navigator
