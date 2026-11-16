const jwt=require('jsonwebtoken');
function secret(){if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw Error('JWT_SECRET कम-से-कम 32 अक्षरों का रखें।');return process.env.JWT_SECRET;}
function signToken(u){return jwt.sign({id:u.id,email:u.email,role:u.role},secret(),{expiresIn:'7d'});}
function requireAuth(req,res,next){const t=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!t)return res.status(401).json({error:'पहले लॉगिन करें।'});try{req.user=jwt.verify(t,secret());next();}catch{return res.status(401).json({error:'लॉगिन की अवधि समाप्त है।'});}}
function requireAdmin(req,res,next){if(req.user?.role!=='admin')return res.status(403).json({error:'केवल एडमिन के लिए।'});next();}
module.exports={signToken,requireAuth,requireAdmin};
