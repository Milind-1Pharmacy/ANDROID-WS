import P1Styles from "@P1StyleSheet";
import {  Text, View } from "native-base";
import { StyleSheet } from "react-native";
import React from 'react';

const styles = StyleSheet.create({
    cardBase: {
        flex: 1,
        backgroundColor: '#2E6ACF',
        borderRadius: 20,
        marginLeft: 10,
        marginVertical: 10,
        ...P1Styles.shadow
    },
    gradientBackground: {
        borderRadius: 20,
    },
    cardContentBlock: {
        marginHorizontal: 15,
        marginVertical: 17.5
    },
    value: {
        fontSize: 16,
        lineHeight: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4

    },
    title: {
        fontSize: 16,
        lineHeight: 18,
        color: '#FFFFFF'
    }
})

const ValueTitleBox = (props: any) => {
    return (
        <View style={styles.cardBase}>
            <View 
            // useAngle={true} angle={180} angleCenter={{ x: 0.5, y: 0.5 }} colors={['#3F7BE0', '#2E6ACF', '#1D59BE']} style={styles.gradientBackground}
            >
                <View style={styles.cardContentBlock}>
                    <Text style={styles.value}>
                        {`${props.value}`}
                    </Text>
                    <Text style={styles.title}>
                        {props.title}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default ValueTitleBox;