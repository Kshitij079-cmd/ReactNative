/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';

const TypingIndicator = () => (
  <View style={styles.agentMessageContainer}>
    <View style={[styles.messageBubble, styles.agentMessage]}>
      <ActivityIndicator size="small" color="#5F6368" />
    </View>
  </View>
);

export default TypingIndicator
