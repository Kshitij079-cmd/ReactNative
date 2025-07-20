import React from 'react'
import { SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native'

const Prompter = () => {
  return (
      <SafeAreaView>
           <ScrollView>
       <View >
        <Text>Enter Prompt to Ask Gemini</Text>
         <TextInput></TextInput>
       </View>
       </ScrollView>
       </SafeAreaView>
  )
}

export default Prompter
