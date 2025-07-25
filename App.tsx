/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Navigator from './navigation/Navigator';


const App = () => {
  return (
    <NavigationContainer>
     <Navigator/>
    </NavigationContainer>
  );
};


export default App;
