
// JustAnotherPanel (JAP) API v2 adapter
// API credentials only from server environment.

const API_URL = (
  process.env.JAP_API_URL || 'https://justanotherpanel.com/api/v2'
).trim();

async function callJap(params) {
  const key = process.env.JAP_API_KEY;

  if (!key) {
    throw new Error('JAP API key server पर सेट नहीं है।');
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
        'Accept': 'application/json'
      },
      body,
      signal: AbortSignal.timeout(20000)
    });
  } catch (err) {
    throw new Error('JAP connection error: ' + err.message);
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
      'JAP HTTP ' + response.status + ': ' +  
      String(message).replaceAll(key, '[HIDDEN]')  
    );
  }

  if (!data) {
    throw new Error('JAP ने valid JSON response नहीं दिया।');
  }

  if (data.error) {
    throw new Error(
      String(data.error).replaceAll(key, '[HIDDEN]')
    );
  }

  return data;
}

async function submitOrder(order, service) {
  if (service.provider !== 'jap') {
    return {
      accepted: true,
      provider: 'manual',
      externalId: null
    };
  }

  if (!service.external_service_id) {
    throw new Error('JAP Service ID सेट नहीं है।');
  }

  const data = await callJap({
    action: 'add',
    service: String(service.external_service_id),
    link: order.link,
    quantity: String(order.quantity)
  });

  if (!data.order) {
    throw new Error('JAP ने External Order ID नहीं लौटाई।');
  }

  return {
    accepted: true,
    provider: 'jap',
    externalId: String(data.order)
  };
}

async function getOrderStatus(externalId) {
  return callJap({
    action: 'status',
    order: String(externalId)
  });
}

async function getServices() {
  return callJap({
    action: 'services'
  });
}

async function getBalance() {
  return callJap({
    action: 'balance'
  });
}

module.exports = {
  submitOrder,
  getOrderStatus,
  getServices,
  getBalance
};
