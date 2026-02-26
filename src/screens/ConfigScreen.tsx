import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { FloatingBubbles } from '../components/FloatingBubbles';
import { FeedApi } from '../utils/api';
import { Settings, CheckCircle } from 'lucide-react-native';

interface FishConfig {
    count: string;
    foodPerFish: string;
}

export const ConfigScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);

    const [smallFish, setSmallFish] = useState<FishConfig>({ count: '5', foodPerFish: '1' });
    const [mediumFish, setMediumFish] = useState<FishConfig>({ count: '3', foodPerFish: '3' });
    const [largeFish, setLargeFish] = useState<FishConfig>({ count: '2', foodPerFish: '5' });
    const [intervalHrs, setIntervalHrs] = useState('8');

    const totalFood = useMemo(() => {
        const s = (parseInt(smallFish.count) || 0) * (parseFloat(smallFish.foodPerFish) || 0);
        const m = (parseInt(mediumFish.count) || 0) * (parseFloat(mediumFish.foodPerFish) || 0);
        const l = (parseInt(largeFish.count) || 0) * (parseFloat(largeFish.foodPerFish) || 0);
        return s + m + l;
    }, [smallFish, mediumFish, largeFish]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                smallFish: parseInt(smallFish.count) || 0,
                mediumFish: parseInt(mediumFish.count) || 0,
                largeFish: parseInt(largeFish.count) || 0,
                totalFood: totalFood,
                interval: parseInt(intervalHrs) || 8
            };

            const res = await FeedApi.saveConfig(payload);
            if (res.success) {
                Alert.alert('Success', 'Configuration saved to ESP32 successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', 'Failed to save config. Check ESP32 connection.');
            }
        } catch (e) {
            Alert.alert('Network Error', 'Could not reach the ESP32 device.');
        } finally {
            setLoading(false);
        }
    };

    const renderConfigRow = (title: string, state: FishConfig, setState: React.Dispatch<React.SetStateAction<FishConfig>>) => (
        <View style={styles.configRow}>
            <Text style={styles.configLabel}>{title}</Text>
            <View style={styles.inputGroup}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputSubLabel}>Count</Text>
                    <TextInput
                        style={styles.input}
                        value={state.count}
                        onChangeText={(t) => setState({ ...state, count: t })}
                        keyboardType="numeric"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputSubLabel}>Food/Fish (g)</Text>
                    <TextInput
                        style={styles.input}
                        value={state.foodPerFish}
                        onChangeText={(t) => setState({ ...state, foodPerFish: t })}
                        keyboardType="numeric"
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FloatingBubbles />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.header}>
                        <Settings color={theme.colors.secondary} size={32} />
                        <Text style={styles.title}>Configuration</Text>
                    </View>

                    <GlassCard style={styles.card}>
                        {renderConfigRow('Small Fishes', smallFish, setSmallFish)}
                        <View style={styles.divider} />
                        {renderConfigRow('Medium Fishes', mediumFish, setMediumFish)}
                        <View style={styles.divider} />
                        {renderConfigRow('Large Fishes', largeFish, setLargeFish)}

                        <View style={styles.divider} />

                        <View style={styles.configRow}>
                            <Text style={styles.configLabel}>Feeding Interval (Hours)</Text>
                            <TextInput
                                style={[styles.input, { width: 80, alignSelf: 'flex-start' }]}
                                value={intervalHrs}
                                onChangeText={setIntervalHrs}
                                keyboardType="numeric"
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                        </View>
                    </GlassCard>

                    <GlassCard style={styles.summaryCard}>
                        <View style={styles.summaryContent}>
                            <CheckCircle color={theme.colors.primary} size={32} />
                            <View>
                                <Text style={styles.summaryLabel}>Total Calculated Food</Text>
                                <Text style={styles.summaryValue}>{totalFood.toFixed(1)} grams</Text>
                            </View>
                        </View>
                    </GlassCard>

                    <View style={styles.actionContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                        ) : (
                            <AnimatedButton
                                title="SAVE & SEND TO FEEDER"
                                onPress={handleSave}
                                style={styles.saveBtn}
                            />
                        )}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    card: {
        marginBottom: theme.spacing.lg,
    },
    configRow: {
        marginVertical: theme.spacing.sm,
    },
    configLabel: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme.spacing.sm,
    },
    inputGroup: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    inputContainer: {
        flex: 1,
    },
    inputSubLabel: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginBottom: 4,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        color: theme.colors.text,
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.glassBorder,
        marginVertical: theme.spacing.md,
    },
    summaryCard: {
        backgroundColor: 'rgba(100, 255, 218, 0.1)',
        borderColor: theme.colors.primary,
        marginBottom: theme.spacing.xl,
    },
    summaryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.lg,
    },
    summaryLabel: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    summaryValue: {
        color: theme.colors.primary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    actionContainer: {
        height: 60,
        justifyContent: 'center',
    },
    saveBtn: {
        paddingVertical: theme.spacing.lg,
    }
});
