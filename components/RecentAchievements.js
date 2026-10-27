// Recent achievement component. Displays recently completed acheivements on the 
//  start/home page. 

// external imports
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSQLiteContext} from "expo-sqlite";

// internal imports
import Tile from '@/components/Tile';


const RecentAchievements = () => {
    const db = useSQLiteContext();

    const [achievements, setAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAchievements = async () => {
        let achievements = [];
        try {
            const entries = db.getAllSync("SELECT * FROM achievements ORDER BY date DESC;")
            achievements = entries.map((goals, index) => ({
                id: goals.id,
                text: goals.text,
                timestamp: goals.date,
            }));
        } catch (error) {
            console.error('Error fetching achievements document:', error);
        }
        return achievements;
    };

    const getAchievements = async () => {
        setIsLoading(true);
        const achievementsData = await fetchAchievements();
        const sortedAchievements = achievementsData.sort((a, b) => a.timestamp - b.timestamp);
        const recentAchievements = sortedAchievements.slice(-3).reverse();
        setAchievements(recentAchievements);
        setIsLoading(false);
    };

    useEffect(() => {
        // Fetch achievements initially
        getAchievements();

        // TODO this no longer works with the SQLite database
//        // Set up real-time listener for achievements document
//        const unsubscribe = onSnapshot(achievementsRef, () => {
//            // When the document changes, fetch achievements again
//            getAchievements();
//        });

        // Clean up the listener on component unmount
//        return () => {
//            unsubscribe();
//        };
    }, []);

    return (
        <View style={raStyles.raContainer}>
            <Text style={raStyles.title}>Recent Achievements</Text>
            <View style={raStyles.tileContainer}>
                {achievements.map((achievement) => (
                    <Tile key={achievement.id} text={achievement.text} timestamp={achievement.timestamp}/>
                ))}
            </View>
        </View>
    );
};

const raStyles = StyleSheet.create({
    raContainer: {
        marginTop: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    tileContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default RecentAchievements;