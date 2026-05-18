let MONITORAMENTO_ATUAL=null
let USER_MONITORAMENTO=null
let ORIGEM_ATUAL='TODAS'


function abrirTela(nome){
if(
typeof USER_MONITORAMENTO==='undefined'
){
return
}

document
.querySelectorAll('.tela-monitoramento')
.forEach(t=>t.classList.add('hidden'))

let tela=document.getElementById(
'tela-'+nome
)

if(tela){
tela.classList.remove('hidden')
}

document
.querySelectorAll('.nav-btn')
.forEach(b=>b.classList.remove('nav-active'))

document
.querySelectorAll('.nav-btn')
.forEach(b=>{

if(
b.getAttribute('onclick')===
`abrirTela('${nome}')`
){
b.classList.add('nav-active')
}

})

if(nome==='dashboard'){
carregarDashboard()
}

if(nome==='monitoramentos'){
carregarListaMonitoramentos()
}

if(nome==='matriz'){
carregarItensMatriz()
}

if(nome==='evidencias'){
carregarEvidencias()
}

if(nome==='analises'){
carregarAnalises()
}

if(nome==='resultados'){
carregarResultados()
}

if(nome==='auditoria'){
carregarAuditoriaCompleta()
}

if(nome==='historico'){
carregarHistorico()
}

if(nome==='riscos'){
carregarPainelRiscos()
}

if(nome==='workflow'){
carregarWorkflow()
}

if(nome==='executivo'){
carregarPainelExecutivo()
}

if(nome==='central'){
carregarCentralEvidencias()
}

if(nome==='beneficios'){
carregarPainelBeneficios()
}

}

async function carregarUsuarioMonitoramento(){
let userLocal=localStorage.getItem('user')
if(!userLocal){
document.getElementById('usuarioLogado').innerHTML='NÃO IDENTIFICADO'
return
}
try{
let perfil=JSON.parse(userLocal)
USER_MONITORAMENTO={
id:perfil.id||null,
nome:perfil.nome_completo||perfil.nome||'USUÁRIO',
username:perfil.username||'',
nivel:Number(perfil.nivel_acesso||4),
origem:perfil.origem||'SEDAM'
}
document.getElementById('usuarioLogado').innerHTML=`${USER_MONITORAMENTO.nome} • N${USER_MONITORAMENTO.nivel}`
await aplicarPermissoesMonitoramento()
}catch(e){
console.log(e)
document.getElementById('usuarioLogado').innerHTML='NÃO IDENTIFICADO'
}
}

async function aplicarPermissoesMonitoramento(){
if(!USER_MONITORAMENTO)return
let nivel=Number(USER_MONITORAMENTO.nivel||4)
let botoesAdmin=[...document.querySelectorAll('.admin-only')]
if(nivel>2){
botoesAdmin.forEach(b=>{
b.style.display='none'
})
}
if((USER_MONITORAMENTO.username||'').toLowerCase()==='manoel'){
botoesAdmin.forEach(b=>{
b.style.display='flex'
})
}
}

document.addEventListener('DOMContentLoaded',async()=>{
await carregarUsuarioMonitoramento()
let monitoramentoSalvo=localStorage.getItem('monitoramentoAtual')
if(monitoramentoSalvo){
MONITORAMENTO_ATUAL=Number(monitoramentoSalvo)
}
await carregarDashboard()
if(typeof atualizarMonitoramentoAutomatico==='function'){
await atualizarMonitoramentoAutomatico()
window.MONITORAMENTO_SYNC_ATIVO=false
setInterval(async()=>{
if(window.MONITORAMENTO_SYNC_ATIVO){
return
}
window.MONITORAMENTO_SYNC_ATIVO=true
try{
await atualizarMonitoramentoAutomatico()
}catch(e){
console.log(e)
}
window.MONITORAMENTO_SYNC_ATIVO=false
},300000)
}
})

window.addEventListener('error',e=>{
console.log('ERRO GLOBAL:',e.error)
})
window.addEventListener('unhandledrejection',e=>{
console.log('PROMISE ERROR:',e.reason)
})


async function carregarMonitoramentoAtual(){

if(!MONITORAMENTO_ATUAL)return null

let resposta=await window.client
.from('monitoramentos')
.select('*')
.eq('id',MONITORAMENTO_ATUAL)
.single()

console.log('RESPOSTA COMPLETA MONITORAMENTO')
console.log(resposta)

let data=resposta.data
let error=resposta.error

if(error){

console.log('ERRO REAL SUPABASE:')
console.log(error)

alert(JSON.stringify(error,null,2))

return null

}

return data

}

function ordenarItensMonitoramento(lista){

return(lista||[]).sort((a,b)=>{

let ia=String(a.item||'0.0')
.split('.')
.map(v=>parseInt(v)||0)

let ib=String(b.item||'0.0')
.split('.')
.map(v=>parseInt(v)||0)

for(let i=0;i<Math.max(ia.length,ib.length);i++){

let va=ia[i]||0
let vb=ib[i]||0

if(va!==vb){
return va-vb
}

}

let sa=String(a.subitem||'0.0')
.split('.')
.map(v=>parseInt(v)||0)

let sb=String(b.subitem||'0.0')
.split('.')
.map(v=>parseInt(v)||0)

for(let i=0;i<Math.max(sa.length,sb.length);i++){

let va=sa[i]||0
let vb=sb[i]||0

if(va!==vb){
return va-vb
}

}

return 0

})

}
function ordenarDataGlobal(data){
return ordenarItensMonitoramento(data)
}
function aplicarFiltroOrigem(data){

if(
!ORIGEM_ATUAL||
ORIGEM_ATUAL==='TODAS'
){
return data
}

return(data||[]).filter(i=>
(i.origem||'').toUpperCase()===
ORIGEM_ATUAL.toUpperCase()
)
}
/*=========================================================
001 MONITORAMENTO CORE LOGIN
=========================================================*/
async function loginMonitoramento(){
let usuario=document.getElementById('usuario').value.trim().toLowerCase()
let senha=document.getElementById('senha').value.trim()
if(!usuario||!senha){
alert('Informe usuário e senha')
return
}
let{data,error}=await client
.from('perfistce')
.select('*')
.eq('username',usuario)
.eq('senha',senha)
.limit(1)
if(error){
console.log(error)
alert('Erro no login')
return
}
if(!data||data.length===0){
alert('Usuário inválido')
return
}
let perfil=data[0]
let permitidos=['manoel','jane']
if(!permitidos.includes(String(perfil.username||'').toLowerCase())){
alert('Sem permissão para o Monitoramento Técnico')
return
}
window.USER_MONITORAMENTO=perfil
localStorage.setItem('user_monitoramento',JSON.stringify(perfil))
let boxUsuario=document.getElementById('usuarioLogado')
if(boxUsuario){
boxUsuario.innerHTML=perfil.nome_completo||perfil.username||'USUÁRIO'
}
let login=document.getElementById('loginMonitoramento')
if(login){
login.style.display='none'
}
let app=document.getElementById('appMonitoramento')
if(app){
app.style.display='block'
}
await carregarDashboard()
}
/*=========================================================
002 MONITORAMENTO CORE AUTOLOGIN
=========================================================*/
document.addEventListener('DOMContentLoaded',async()=>{

let salvo=localStorage.getItem('user_monitoramento')

if(!salvo){

let app=document.getElementById('appMonitoramento')

if(app){
app.style.display='none'
}

return

}

try{

window.USER_MONITORAMENTO=JSON.parse(salvo)

}catch(e){

console.log(e)

localStorage.removeItem('user_monitoramento')

return

}

if(!USER_MONITORAMENTO){

localStorage.removeItem('user_monitoramento')

return

}

let boxUsuario=document.getElementById('usuarioLogado')

if(boxUsuario){

boxUsuario.innerHTML=
USER_MONITORAMENTO.nome_completo||
USER_MONITORAMENTO.username||
'USUÁRIO'

}

let login=document.getElementById('loginMonitoramento')

if(login){
login.style.display='none'
}

let app=document.getElementById('appMonitoramento')

if(app){
app.style.display='block'
}

await carregarDashboard()

})
/*=========================================================
003 MONITORAMENTO CORE LOGOUT
=========================================================*/
function logoutMonitoramento(){
localStorage.removeItem('user_monitoramento')
location.reload()
}
