const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||8080;
const DATA_FILE=path.join(__dirname,'shared_data.json');
function loadData(){try{const t=fs.readFileSync(DATA_FILE,'utf-8');return t?JSON.parse(t):{records:[],stations:[]};}catch(e){return{records:[],stations:[]};}}
function saveData(d){fs.writeFileSync(DATA_FILE,JSON.stringify(d,null,2),'utf-8');}
http.createServer((req,res)=>{
res.setHeader('Access-Control-Allow-Origin','*');
res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
res.setHeader('Access-Control-Allow-Headers','Content-Type');
if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
const u=new URL(req.url,`http://localhost:${PORT}`);
if(u.pathname==='/api/submit'&&req.method==='POST'){let b='';req.on('data',c=>b+=c);req.on('end',()=>{try{const r=JSON.parse(b);const d=loadData();d.records.push(r);saveData(d);res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,total:d.records.length}));}catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:e.message}));}});return;}
if(u.pathname==='/api/records'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'});res.end(JSON.stringify(loadData()));return;}
if(u.pathname==='/api/records/clear'&&req.method==='GET'){saveData({records:[],stations:[]});res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));return;}
let fp=u.pathname==='/'?'/inspection-mobile.html':u.pathname;const fp2=path.join(__dirname,fp);
try{if(fs.existsSync(fp2)){const ext=path.extname(fp2);const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json'};res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});fs.createReadStream(fp2).pipe(res);return;}}catch(e){}
res.writeHead(404);res.end('Not Found');
}).listen(PORT,'0.0.0.0',()=>console.log('Server on '+PORT));
