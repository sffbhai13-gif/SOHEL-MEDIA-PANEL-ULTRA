// TopSMM API v2 adapter
// API credentials only from server environment.

const API_URL = (
  process.env.TOPSMM_API_URL || 'https://topsmm.in/api/v2'
).trim();

async function callTopSmm(params) {
  const key = process.env.TOPSMM_API_KEY;

  if (!key) {
    throw new Error('TopSMM API key server पर सेट नहीं है।');
  }

  const body = new URLSearchParams({
    key,
    ...params
  });

  let response;

  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      },
      body,
      signal: AbortSignal.timeout(20000)
    });
      body,
      signal: AbortSignal.timeout(20000)
    });
  } catch (err) {
    throw new Error('TopSMM connection error: ' + err.message);
  }

  const raw = await response.text();

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error ||
      raw.slice(0, 400) ||
      'Provider ने कोई विवरण नहीं दिया।';

    throw new Error(  
      'TopSMM HTTP ' + response.status + ': ' +  
      String(message).replaceAll(key, '[HIDDEN]')  
    );
  }

  if (!data) {
    throw new Error('TopSMM ने valid JSON response नहीं दिया।');
  }

  if (data.error) {
    throw new Error(
      String(data.error).replaceAll(key, '[HIDDEN]')
    );
  }

  return data;
}

async function submitOrder(order, service) {
  if (service.provider !== 'topsmm') {
    return {
      accepted: true,
      provider: 'manual',
      externalId: null
    };
  }

  if (!service.external_service_id) {
    throw new Error('TopSMM Service ID सेट नहीं है।');
  }

  const data = await callTopSmm({
    action: 'add',
    service: String(service.external_service_id),
    link: order.link,
    quantity: String(order.quantity)
  });

  if (!data.order) {
    throw new Error('TopSmm ने External Order ID नहीं लौटाई।');
  }

  return {
    accepted: true,
    provider: 'topsmm',
    externalId: String(data.order)
  };
}

async function getOrderStatus(externalId) {
  return callTopSmm({
    action: 'status',
    order: String(externalId)
  });
}

async function getServices() {
  return callTopSmm({
    action: 'services'
  });
}

async function getBalance() {
  return callTopSmm({
    action: 'balance'
  });
}

module.exports = {
  submitOrder,
  getOrderStatus,
  getServices,
  getBalance
};
