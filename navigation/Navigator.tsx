import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Prompter from '../screens/Prompter';
const Tab = createBottomTabNavigator();


const Navigator = () => {
  return (
       <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={Prompter} />
    </Tab.Navigator>
  )
}

export default Navigator
