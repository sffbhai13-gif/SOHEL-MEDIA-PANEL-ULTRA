// LuvSMM API v2 adapter
// Reads credentials only from server environment.

const API_URL = process.env.LUVSMM_API_URL || 'https://luvsmm.com/api/v2';

async function callLuvSmm(params) {
    const key = process.env.LUVSMM_API_KEY;

    if (!key) {
        throw new Error('LuvSMM API key not found in environment.');
    }

    const payload = new URLSearchParams({
        key: key,
        ...params
    });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            body: payload.toString(),
            signal: AbortSignal.timeout(20000)
        });

        const rawText = await response.text();
        let data;

        try {
            data = JSON.parse(rawText);
        } catch {
            throw new Error('Invalid JSON response from LuvSMM.');
        }

        if (data && data.error) {
            throw new Error('LuvSMM Error: ' + data.error);
        }

        return data;
    } catch (err) {
        throw new Error('LuvSMM connection error: ' + err.message);
    }
}

module.exports = {
    getServices: async () => await callLuvSmm({ action: 'services' }),
    getBalance: async () => await callLuvSmm({ action: 'balance' }),
    createOrder: async (serviceId, link, quantity) => await callLuvSmm({
        action: 'add',
        service: serviceId,
        link: link,
        quantity: quantity
    }),
    checkOrderStatus: async (orderId) => await callLuvSmm({
        action: 'status',
        order: orderId
    })
};

