// This file holds the internal layout of the app. The stack is all the pages that are 
//  within the app. Each page is written as an individual .js file. 

// external imports
import {Stack} from 'expo-router'
import {SQLiteProvider} from "expo-sqlite";
import { MenuProvider } from 'react-native-popup-menu';

// internal imports
import Navbar from '@/components/Navbar';
import * as UserData from "@/data/User";


// Structure component, content placed here will exist on all pages
export default function RootLayout() {
  // TODO add database loading screen with react suspense
  return (
    <SQLiteProvider databaseName="user.db" onInit={UserData.migrateDbIfNeeded}>
      <MenuProvider>
        <Stack screenOptions={({navigation}) => ({
          header: () => <Navbar navigation={navigation}/>
        })}>
          {/* Content for each page will be placed here */}
          <Stack.Screen name="index"/>
          <Stack.Screen name="child-info"/>
          <Stack.Screen name="network"/>
          <Stack.Screen name="goals"/>
          <Stack.Screen name="achievements"/>
          <Stack.Screen name="stressors"/>
          <Stack.Screen name="supports"/>
          <Stack.Screen name="resources"/>
        </Stack>
      </MenuProvider>
    </SQLiteProvider>
  )
}

