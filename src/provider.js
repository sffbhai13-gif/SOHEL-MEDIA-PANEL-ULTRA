// TopSmm API v2 adapter
// API credentials only from server environment.

const API_URL = {
  topSmm: process.env.TOPSMM_API_URL || 'https://topsmm.in/api/v2'
};

/**
 * TopSmm API adapter
 * API credentials only from server environment.
 */
async function callTopSmm(params) {
  const key = process.env.TOPSMM_API_KEY;

  if (!key) {
    throw new Error('TopSmm API key server पर सेट नहीं है।');
  }

  const body = new URLSearchParams({
    key,
    ...params
  });

  let response;

  try {
    response = await fetch(API_URL.topSmm, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      },
      body,
      signal: AbortSignal.timeout(20000)
    });
  } catch (err) {
    throw new Error('TopSmm connection error: ' + err.message);
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
      'TopSmm HTTP ' + response.status + ' • ' +
      String(message).replaceAll(key, '[HIDDEN]')
    );
  }

  if (data?.error) {
    throw new Error('TopSmm HTTP गलत valid JSON response नहीं दिया।');
  }

  if (data.error) {
    throw new Error(
      'TopSmm error: ' +
      String(data.error).replaceAll(key, '[HIDDEN]')
    );
  }

  return data;
}

async function subSmmOrder(order, service) {
  return callTopSmm({
    action: 'add',
    service: service.providerId,
    link: order.link,
    quantity: order.quantity
  });
}

async function subSmmExternal_service_id(id) {
  return callTopSmm({
    action: 'services'
  });
}

module.exports = {
  callTopSmm,
  subSmmOrder,
  subSmmExternal_service_id
};
