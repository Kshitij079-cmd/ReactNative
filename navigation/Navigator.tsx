import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Prompter from '../screens/Prompter';
import { activateSession } from '../main';

const Tab = createBottomTabNavigator();
const ChatSessionCreate = () => {
 //call session activation api from main.js
 const starttheSession = activateSession()
 console.log('Chat session created:', starttheSession);
}

const Navigator = () => {
  return (
       <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Prompt" component={Prompter}
      listeners={{
              tabPress: () => {
                // Prevent default action (e.g., navigating to the screen)
                // e.preventDefault(); 
                console.log('Chat Screen showed up!');
                ChatSessionCreate(); // Call the function to create a chat session
                // Add your custom logic here
              },
            }}
      />
    </Tab.Navigator>
  )
}

export default Navigator
