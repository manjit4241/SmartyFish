import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';

const BUBBLE_COUNT = 15;

const Bubble = ({ index }: { index: number }) => {
    const translateY = useSharedValue(0);
    const translateX = useSharedValue(0);

    const size = Math.random() * 20 + 10;
    const leftPos = Math.random() * 100;
    const duration = Math.random() * 4000 + 4000;
    const delay = Math.random() * 5000;

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(-1000, {
                    duration: duration,
                    easing: Easing.linear,
                }),
                -1,
                false
            )
        );

        translateX.value = withDelay(
            delay,
            withRepeat(
                withTiming(Math.random() * 50 - 25, {
                    duration: duration / 2,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { translateX: translateX.value },
            ],
            opacity: (translateY.value / -1000) * 0.5 + 0.1, // Fade out as it goes up
        };
    });

    return (
        <Animated.View
            style={[
                styles.bubble,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    left: `${leftPos}%`,
                    bottom: -50,
                },
                animatedStyle,
            ]}
        />
    );
};

export const FloatingBubbles = () => {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: BUBBLE_COUNT }).map((_, i) => (
                <Bubble key={i} index={i} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    bubble: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
});
