let MONITORAMENTO_ATUAL=null
let USER_MONITORAMENTO=null
const client=supabase.createClient(
window.SUPABASE_URL,
window.SUPABASE_ANON_KEY
)


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

if(event&&event.target){
event.target.classList.add('nav-active')
}

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
await carregarDashboard()
if(typeof atualizarMonitoramentoAutomatico==='function'){
await atualizarMonitoramentoAutomatico()
setInterval(async()=>{
await atualizarMonitoramentoAutomatico()
},300000)
}
})

window.addEventListener('error',e=>{
console.log('ERRO GLOBAL:',e.error)
})

window.addEventListener('unhandledrejection',e=>{
console.log('PROMISE ERROR:',e.reason)
})
