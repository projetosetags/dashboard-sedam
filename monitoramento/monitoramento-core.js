const client=supabase.createClient(
window.SUPABASE_URL,
window.SUPABASE_ANON_KEY
)
let MONITORAMENTO_ATUAL=null
let USER_MONITORAMENTO=null

function abrirTela(nome){
if(!USER_MONITORAMENTO){
return
}
document
.querySelectorAll('.tela-monitoramento')
.forEach(t=>t.classList.add('hidden'))

document
.getElementById('tela-'+nome)
.classList.remove('hidden')

document
.querySelectorAll('.nav-btn')
.forEach(b=>b.classList.remove('nav-active'))

if(event&&event.target){
event.target.classList.add('nav-active')
}

if(nome==='auditoria'){
carregarAuditoriaCompleta()
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
if(nome==='historico'){
carregarHistorico()
}
if(nome==='riscos'){
carregarPainelRiscos()
}
}

async function carregarUsuarioMonitoramento(){
let nome='MANOEL FERNANDES NETO'
try{
let userLocal=localStorage.getItem('user')
if(userLocal){
let u=JSON.parse(userLocal)
nome=
u.nome_completo||
u.nome||
u.username||
nome
}
}catch(e){
console.log(e)
}
let{data,error}=await client
.from('monitoramento_permissoes')
.select('*')
.ilike('nome',nome)
.eq('ativo',true)
.single()

if(error||!data){

document.getElementById('usuarioLogado').innerHTML=
'SEM PERMISSÃO'

console.log(error)

return

}

USER_MONITORAMENTO=data

document.getElementById('usuarioLogado').innerHTML=
data.nome+
' • NÍVEL '+
data.nivel

aplicarPermissoes()

}

function aplicarPermissoes(){

if(!USER_MONITORAMENTO)return

let nivel=Number(
USER_MONITORAMENTO.nivel||5
)

if(nivel>2){

document
.querySelectorAll('.btn-admin')
.forEach(b=>b.remove())

}

if(nivel>3){

document
.querySelectorAll('.somente-supervisor')
.forEach(b=>b.remove())

}

if(nivel>=5){

document
.querySelectorAll('input,textarea,select,button')
.forEach(el=>{

if(
!el.classList.contains('btn-livre')
){
el.disabled=true
}

})

}

}
document.addEventListener('DOMContentLoaded',async()=>{
await carregarUsuarioMonitoramento()
await carregarDashboard()
})

window.addEventListener('error',e=>{

console.log(
'ERRO GLOBAL:',
e.error
)

})

window.addEventListener('unhandledrejection',e=>{

console.log(
'PROMISE ERROR:',
e.reason
)

})
