// TopSMM SMM API v2 adapter. Credentials are read only from server environment.
const API_URL = process.env.TOPSMM_API_URL || 'https://topsmm.in/api/v2';
async function callTopSmm(params){
  const key=process.env.TOPSMM_API_KEY;
  if(!key) throw new Error('TopSMM API key server पर सेट नहीं है।');
  const body=new URLSearchParams({key,...params});
  const response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:AbortSignal.timeout(20000)});
  if(!response.ok) throw new Error('TopSMM API ने HTTP '+response.status+' लौटाया।');
  const data=await response.json(); if(data.error) throw new Error(String(data.error)); return data;
}
async function submitOrder(order,service){
  if(service.provider!=='topsmm') return {accepted:true,provider:'manual',externalId:null};
  if(!service.external_service_id) throw new Error('इस सर्विस की TopSMM Service ID सेट नहीं है।');
  const data=await callTopSmm({action:'add',service:String(service.external_service_id),link:order.link,quantity:String(order.quantity)});
  if(!data.order) throw new Error('TopSMM ने External Order ID नहीं लौटाई।');
  return {accepted:true,provider:'topsmm',externalId:String(data.order)};
}
async function getOrderStatus(externalId){return callTopSmm({action:'status',order:String(externalId)});}
async function getServices(){return callTopSmm({action:'services'});}
async function getBalance(){return callTopSmm({action:'balance'});}
module.exports={submitOrder,getOrderStatus,getServices,getBalance};
