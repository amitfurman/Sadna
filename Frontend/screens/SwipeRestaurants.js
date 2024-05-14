import { View, Text, TextInput, TouchableOpacity, Animated, Dimensions, PanResponder} from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { StatusBar } from 'expo-status-bar'
import { restaurants as restaurantsArray} from '../data';
import Card from '../components/Card';
import Footer from '../components/Footer';


export default function SwipeRestaurants() {
    const [restaurants, setRestaurants] = useState(restaurantsArray);
    const { width, height } = Dimensions.get("screen");
    //for swipe
    const swipe = useRef(new Animated.ValueXY()).current;
    const titleSign = useRef(new Animated.Value(1)).current;

    //panResponder config
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, {dx, dy, y0}) => {
            swipe.setValue({ x:dx, y:dy });
            titleSign.setValue(y0 > (height*0.9) / 2 ? 1 : -1);

        },
        onPanResponderRelease: (_, {dx, dy}) => {
            const direction = Math.sign(dx);
            const isActionActive = Math.abs(dx) > width * 0.4;

            if (isActionActive) {
                //swipe the card out
                Animated.timing(swipe, {
                    toValue: {
                        x: direction * width * 2,
                        y: dy,
                    },
                    duration: 2000,
                    useNativeDriver: true,
                }).start(removeTopCard);
            }
            else {
                //return the card to the center
                Animated.spring(swipe, {
                    toValue: {
                        x: 0,
                        y: 0,
                    },
                    useNativeDriver: true,
                    friction: 5,
                }).start();
            }
        }
    });

    const removeTopCard = useCallback(() => {
        setRestaurants((prev) => prev.slice(1));
        swipe.setValue({ x:0, y:0 });
    }, [swipe]);

    const handleChoice = useCallback((direction) => {
        Animated.timing(swipe.x, {
            toValue: direction * width * 2,
            duration: 2000,
            useNativeDriver: true,
        }).start(removeTopCard);
    }, [removeTopCard, swipe.x]);

    useEffect(() => {
        if (!restaurants.length) {
            setRestaurants(restaurantsArray);
        }
    }, [restaurants.length]);
    return (
        <View style={{flex:1, alignItems: "center"}}>
            <StatusBar style="auto" />
            {
                restaurants.map((restaurant, index) => {
                    const isFirst = index == 0;
                    const dragHandlers = isFirst ? panResponder.panHandlers : {};
                    return (
                        <Card
                            key={restaurant.name}
                            name={restaurant.name}
                            rating={restaurant.rating}
                            location={restaurant.location}
                            image={restaurant.image}
                            isFirst={isFirst}
                            swipe={swipe}
                            titleSign={titleSign}
                            {...dragHandlers}
                        />
                    );
                }).reverse()
            }
            <Footer handleChoice={handleChoice}  />
        </View>
    );
}
