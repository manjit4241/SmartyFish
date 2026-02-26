import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';
import { AnimatedButton } from '../components/AnimatedButton';
import { FloatingBubbles } from '../components/FloatingBubbles';
import { FeedApi } from '../utils/api';
import { Droplets, Clock, Fish, Info } from 'lucide-react-native';

export const DashboardScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);

    // Mock data for display
    const stats = {
        totalFishes: 10,
        nextFeedTime: '18:00',
        lastFeedTime: '12:00',
        totalGrams: 35,
    };

    const handleManualFeed = async () => {
        setLoading(true);
        try {
            const response = await FeedApi.sendFeedCommand(stats.totalGrams);
            if (response.success) {
                Alert.alert('Success', 'Feeding command sent to ESP32!');
            } else {
                Alert.alert('Error', 'Failed to connect to feeder. Check network.');
            }
        } catch (e) {
            Alert.alert('Network Error', 'Could not reach the ESP32 feeder.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <FloatingBubbles />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Fish color={theme.colors.primary} size={40} />
                    <Text style={styles.title}>SmartyFish</Text>
                </View>

                <GlassCard style={styles.statsCard}>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Info color={theme.colors.secondary} size={24} />
                            <Text style={styles.statLabel}>Total Fishes</Text>
                            <Text style={styles.statValue}>{stats.totalFishes}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Droplets color={theme.colors.primary} size={24} />
                            <Text style={styles.statLabel}>Food/Feed</Text>
                            <Text style={styles.statValue}>{stats.totalGrams}g</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Clock color={theme.colors.textSecondary} size={24} />
                            <Text style={styles.statLabel}>Last Feed</Text>
                            <Text style={styles.statValueTime}>{stats.lastFeedTime}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Clock color={theme.colors.tertiary} size={24} />
                            <Text style={styles.statLabel}>Next Feed</Text>
                            <Text style={[styles.statValueTime, { color: theme.colors.primary }]}>{stats.nextFeedTime}</Text>
                        </View>
                    </View>
                </GlassCard>

                <View style={styles.actionSection}>
                    {loading ? (
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    ) : (
                        <AnimatedButton
                            title="MANUAL FEED NOW"
                            onPress={handleManualFeed}
                            style={styles.feedBtn}
                        />
                    )}

                    <AnimatedButton
                        title="CONFIGURE FEEDING"
                        onPress={() => navigation.navigate('Config')}
                        style={styles.configBtn}
                        textStyle={styles.configBtnText}
                    />
                    <AnimatedButton
                        title="HISTORY LOG"
                        onPress={() => navigation.navigate('History')}
                        style={styles.historyBtn}
                        textStyle={styles.historyBtnText}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text,
        letterSpacing: 2,
    },
    statsCard: {
        marginBottom: theme.spacing.xxl,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginTop: theme.spacing.sm,
        marginBottom: 4,
    },
    statValue: {
        color: theme.colors.text,
        fontSize: 28,
        fontWeight: 'bold',
    },
    statValueTime: {
        color: theme.colors.text,
        fontSize: 22,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.glassBorder,
        marginVertical: theme.spacing.sm,
    },
    actionSection: {
        gap: theme.spacing.lg,
    },
    feedBtn: {
        paddingVertical: theme.spacing.lg,
    },
    configBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.secondary,
    },
    configBtnText: {
        color: theme.colors.secondary,
    },
    historyBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
    },
    historyBtnText: {
        color: theme.colors.textSecondary,
    },
});
