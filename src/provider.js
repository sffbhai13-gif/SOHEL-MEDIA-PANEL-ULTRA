const TOPSMM_URL = process.env.TOPSMM_API_URL || 'https://topsmm.in/api/v2';
const LUVSMM_URL = process.env.LUVSMM_API_URL || 'https://luvsmm.com/api/v2';

async function callApi(apiUrl, apiKey, params) {
    if (!apiKey) throw new Error('API key not configured for provider.');
    const payload = new URLSearchParams({ key: apiKey, ...params });
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString()
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
}

module.exports = {
    submitOrder: async (provider, serviceId, link, quantity) => {
        const isLuv = provider && provider.toLowerCase().includes('luv');
        const url = isLuv ? LUVSMM_URL : TOPSMM_URL;
        const key = isLuv ? process.env.LUVSMM_API_KEY : process.env.TOPSMM_API_KEY;
        
        const payload = isLuv 
            ? { action: 'add', service: serviceId, link, quantity }
            : { action: 'add', service: serviceId, link, quantity }; // Adjust if TopSMM needs different keys
            
        return await callApi(url, key, payload);
    },
    getStatus: async (provider, orderId) => {
        const isLuv = provider && provider.toLowerCase().includes('luv');
        const url = isLuv ? LUVSMM_URL : TOPSMM_URL;
        const key = isLuv ? process.env.LUVSMM_API_KEY : process.env.TOPSMM_API_KEY;
        return await callApi(url, key, { action: 'status', order: orderId });
    }
};
