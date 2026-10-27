// This is the start/home page of the app. When it opens this is what will show. It acts as a
//  menu to be able to navigate to all other pages in the app. 

// external imports
import {ScrollView, StyleSheet, View} from 'react-native'
import {useSQLiteContext} from "expo-sqlite";
import {useDrizzleStudio} from "expo-drizzle-studio-plugin";

// internal imports
import {COLORS} from '@/constants/Colors'
import SignInButton from "@/components/SignInButton";
import WideNavButton from '@/components/WideNavButton'
import SmallNavButton from "@/components/SmallNavButton";
import ButtonGrid from "@/components/ButtonGrid"
import RecentAchievements from "@/components/RecentAchievements";


export default function Home() {
  // Allow debugging of local database in debug mode
  //const db = useSQLiteContext()
  //useDrizzleStudio(db)

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.mainContentContainer}>
        <View style={styles.userContainer}>
          {/* <SignInButton/> */}
          <SmallNavButton text="Child Info" navTo="child-info"/>
        </View>
        <WideNavButton text="My Network" navTo="network"/>
        <ButtonGrid text="Reflections" buttonInfo={reflectionButtons}/>
        <RecentAchievements/>
        <WideNavButton text="Resources" navTo="resources"/>
      </View>
    </ScrollView>
  )
}

const reflectionButtons = [
  {
    text: "Goals",
    nav: "goals"
  },
  {
    text: "Achievements",
    nav: "achievements"
  },
  {
    text: "Stressors",
    nav: "stressors"
  },
  {
    text: "Supports",
    nav: "supports"
  }
]

const styles = StyleSheet.create({
  mainContentContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: COLORS.lightModeBG,
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 10
  },
  userContainer: {
    flexDirection: "row",
    marginTop: 0,
    alignItems: "center",
    justifyContent: "space-between"
  },
  scrollContainer: {
    flexGrow: 1,
    width: 'auto',
  },
  SignInButton: {
    width: 10,
  }
})

