import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { theme } from '../theme/theme';
import { GlassCard } from '../components/GlassCard';
import { FloatingBubbles } from '../components/FloatingBubbles';
import { History } from 'lucide-react-native';

const mockHistory = [
    { id: '1', time: '18:00', date: '2023-11-01', type: 'Auto', amount: 35 },
    { id: '2', time: '12:00', date: '2023-11-01', type: 'Manual', amount: 15 },
    { id: '3', time: '06:00', date: '2023-11-01', type: 'Auto', amount: 35 },
];

export const HistoryScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <FloatingBubbles />

            <View style={styles.content}>
                <View style={styles.header}>
                    <History color={theme.colors.tertiary} size={32} />
                    <Text style={styles.title}>Feeding Log</Text>
                </View>

                <FlatList
                    data={mockHistory}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <GlassCard style={styles.historyCard}>
                            <View style={styles.row}>
                                <View>
                                    <Text style={styles.timeText}>{item.time}</Text>
                                    <Text style={styles.dateText}>{item.date}</Text>
                                </View>
                                <View style={styles.details}>
                                    <Text style={styles.typeText}>{item.type} Feed</Text>
                                    <Text style={styles.amountText}>{item.amount}g</Text>
                                </View>
                            </View>
                        </GlassCard>
                    )}
                    contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
                />
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    historyCard: {
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeText: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    dateText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    details: {
        alignItems: 'flex-end',
    },
    typeText: {
        color: theme.colors.tertiary,
        fontSize: 14,
        marginBottom: 4,
    },
    amountText: {
        color: theme.colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
    }
});
