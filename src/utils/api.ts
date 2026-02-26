import axios from 'axios';

// The ESP32 IP address. In a real app, this could be discovered via mDNS 
// or entered by the user in a settings screen.
const ESP32_IP = '192.168.1.100'; // Replace with the static IP of your ESP32
const BASE_URL = `http://${ESP32_IP}`;

export interface FeedConfigPayload {
    smallFish: number;
    mediumFish: number;
    largeFish: number;
    totalFood: number;
    interval: number;
}

export const FeedApi = {
    /**
     * Sends the full configuration payload to the ESP32 to update its feeding logic.
     */
    saveConfig: async (payload: FeedConfigPayload): Promise<{ success: boolean; data?: any }> => {
        try {
            const response = await axios.post(`${BASE_URL}/setData`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000, // 5 seconds timeout for local network
            });
            return { success: response.status === 200, data: response.data };
        } catch (error) {
            console.warn('API saveConfig error:', error);
            return { success: false };
        }
    },

    /**
     * Triggers an immediate manual feed on the ESP32.
     */
    sendFeedCommand: async (grams: number): Promise<{ success: boolean }> => {
        try {
            const response = await axios.post(`${BASE_URL}/feedNow`, { amount: grams }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });
            return { success: response.status === 200 };
        } catch (error) {
            console.warn('API sendFeedCommand error:', error);
            return { success: false };
        }
    }
};
