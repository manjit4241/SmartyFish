import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    disabled = false,
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
        if (!disabled) {
            onPress();
        }
    };

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.button,
                style,
                disabled && styles.disabled,
                animatedStyle,
            ]}
            disabled={disabled}
        >
            <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>{title}</Text>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.round,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    disabled: {
        backgroundColor: theme.colors.textSecondary,
        shadowOpacity: 0,
        elevation: 0,
    },
    text: {
        color: '#0a192f',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    disabledText: {
        color: '#112240',
    },
});
