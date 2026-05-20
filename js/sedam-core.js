/*=========================================================
001 SEDAM CORE DOMCONTENTLOADED
=========================================================*/
document.addEventListener("DOMContentLoaded",async()=>{

document.body.style.visibility='hidden'

let geral=document.getElementById('painel-geral-acesso')
let login=document.getElementById('login-screen')
let dash=document.getElementById('dashboard')

let dataInicio=document.getElementById('dataInicio')
let dataFim=document.getElementById('dataFim')

if(dataInicio)dataInicio.value='2025-01-01'
if(dataFim)dataFim.value='2028-01-01'

localStorage.removeItem('uid')

let userLocal=localStorage.getItem('user')

if(userLocal){

try{

let perfil=JSON.parse(userLocal)

if(perfil&&perfil.username){

window.userP=perfil
userP=perfil

document.body.classList.remove("login-bg")

if(geral){
geral.classList.add('hidden')
geral.style.display='none'
}

if(login){
login.classList.add('hidden')
login.style.display='none'
}

if(dash){
dash.classList.remove('hidden')
dash.style.display='block'
dash.style.visibility='visible'
dash.style.opacity='1'
}

let info=document.getElementById('user-info')

if(info){
info.innerHTML=
(perfil.nome_completo||'-')+
' • '+
(perfil.cargo||'-')+
' • '+
(perfil.origem||'-')
}

aplicarPermissoesAbas()

await carregarDados()
aplicarAcessoMonitoramento()
let abaSalva=localStorage.getItem('activeTab')||'dashboard'

switchTab(abaSalva)

setTimeout(()=>{

if(dash){
dash.classList.remove('hidden')
dash.style.display='block'
dash.style.visibility='visible'
dash.style.opacity='1'
}

document.querySelectorAll('canvas').forEach(c=>{
c.style.display='block'
c.style.visibility='visible'
c.style.opacity='1'
})

window.dispatchEvent(new Event('resize'))

if(typeof renderDashboard==='function'){
renderDashboard()
}

if(typeof renderResumo==='function'){
renderResumo()
}

if(typeof renderTable==='function'){
renderTable()
}

if(typeof renderConcluidos==='function'){
renderConcluidos()
}

if(typeof initPainelGrafico==='function'){
initPainelGrafico()
}

},300)

setTimeout(()=>{
document.body.style.visibility='visible'
},100)

return

}

}catch(e){

console.log(e)

localStorage.removeItem('user')

}

}

document.body.classList.remove("login-bg")

if(geral){
geral.classList.remove('hidden')
geral.style.display='flex'
geral.style.visibility='visible'
geral.style.opacity='1'
}

if(login){
login.classList.add('hidden')
login.style.display='none'
}

if(dash){
dash.classList.add('hidden')
dash.style.display='none'
}

document.body.style.visibility='visible'

})
/*=========================================================
002 SEDAM CORE FUNCTION LOGIN
=========================================================*/
window.login=async function(){
let usuario=document.getElementById('u').value.trim().toLowerCase()
let senha=document.getElementById('p').value.trim()
if(!usuario||!senha){
alert('Informe usuário e senha')
return
}
let perfil=null
let {data:p1,error:e1}=await client.from('perfistce').select('*').eq('username',usuario).eq('senha',senha).limit(1)
if(e1)console.log(e1)
if(p1&&p1.length){
perfil=p1[0]
perfil.origem='TCERO'
}else{
let {data:p2,error:e2}=await client.from('perfis').select('*').eq('username',usuario).limit(1)
if(e2)console.log(e2)
if(p2&&p2.length){
perfil=p2[0]
perfil.origem='SEDAM'
if(perfil.senha&&String(perfil.senha)!==String(senha)){
alert('Senha inválida')
return
}
}
}
if(!perfil){
alert('Usuário não encontrado')
return
}
window.userP=perfil
userP=perfil
localStorage.setItem('user',JSON.stringify(perfil))
document.body.classList.remove('login-bg')
let loginScreen=document.getElementById('login-screen')
let dashboard=document.getElementById('dashboard')
if(loginScreen){
loginScreen.classList.add('hidden')
loginScreen.style.display='none'
}
if(dashboard){
dashboard.classList.remove('hidden')
dashboard.style.display='block'
dashboard.style.visibility='visible'
dashboard.style.opacity='1'
}
let info=document.getElementById('user-info')
if(info){
info.innerHTML=(perfil.nome_completo||'-')+' • '+(perfil.cargo||'-')+' • '+(perfil.origem||'-')
}
let tabPerfis=document.getElementById('tab-perfis')
let tabTCERO=document.getElementById('tab-tcero')
let tabUsuarios=document.getElementById('tab-usuarios')
if(tabPerfis){
tabPerfis.classList.add('hidden')
tabPerfis.style.display='none'
}
if(tabTCERO){
tabTCERO.classList.add('hidden')
tabTCERO.style.display='none'
}
if(tabUsuarios){
tabUsuarios.classList.add('hidden')
tabUsuarios.style.display='none'
}
let adminsBackup=['manoel','vagner','franciscovagner','francisco.vagner','vagner9']
let btnBackup=document.getElementById('btnBackupSedam')
if(btnBackup){
let usuarioAtual=String(perfil.username||'').toLowerCase().trim()
if(adminsBackup.includes(usuarioAtual)){
btnBackup.classList.remove('hidden')
btnBackup.style.display='inline-flex'
btnBackup.style.visibility='visible'
btnBackup.style.opacity='1'
}else{
btnBackup.classList.add('hidden')
btnBackup.style.display='none'
}
}
if(perfil.origem==='SEDAM'&&Number(perfil.nivel_acesso)<=2){
if(tabPerfis){
tabPerfis.classList.remove('hidden')
tabPerfis.style.display='inline-flex'
tabPerfis.innerHTML='<div>👥</div><div>Perfis Sedam</div>'
}
if(tabUsuarios){
tabUsuarios.classList.remove('hidden')
tabUsuarios.style.display='inline-flex'
}
}
if(perfil.origem==='TCERO'&&Number(perfil.nivel_acesso)===1){
if(tabPerfis){
tabPerfis.classList.remove('hidden')
tabPerfis.style.display='inline-flex'
tabPerfis.innerHTML='<div>👥</div><div>Perfis Sedam</div>'
}
if(tabTCERO){
tabTCERO.classList.remove('hidden')
tabTCERO.style.display='inline-flex'
}
if(tabUsuarios){
tabUsuarios.classList.remove('hidden')
tabUsuarios.style.display='inline-flex'
}
}
if(!(perfil.origem==='SEDAM'&&Number(perfil.nivel_acesso)>=3)&&!(perfil.origem==='TCERO'&&Number(perfil.nivel_acesso)!==1)){
try{
await Promise.all([
carregarPerfis(),
carregarTCERO()
])
}catch(e){
console.log(e)
}
}
requestAnimationFrame(()=>{
switchTab('dashboard')
})
setTimeout(async ()=>{
try{
await carregarDados()

aplicarAcessoMonitoramento()

if(typeof renderDashboard==='function')renderDashboard()
if(typeof renderResumo==='function')renderResumo()
if(typeof renderTable==='function')renderTable()
if(typeof renderConcluidos==='function')renderConcluidos()
if(typeof initPainelGrafico==='function')initPainelGrafico()

}catch(e){
console.log(e)
}
},120)
}
/*=========================================================
002A SEDAM CORE FUNCTION APLICARPERMISSOESABAS
=========================================================*/
function aplicarPermissoesAbas(){

if(!window.userP)return

let perfil=window.userP

let origem=String(perfil.origem||'').toUpperCase()
let nivel=Number(perfil.nivel_acesso||0)

let tabPerfis=document.getElementById('tab-perfis')
let tabTCERO=document.getElementById('tab-tcero')
let tabUsuarios=document.getElementById('tab-usuarios')

let viewPerfis=document.getElementById('view-perfis')
let viewTCERO=document.getElementById('view-tcero')
let viewUsuarios=document.getElementById('view-usuarios')

/*=========================================================
OCULTA TUDO PRIMEIRO
=========================================================*/
;[
tabPerfis,
tabTCERO,
tabUsuarios,
viewPerfis,
viewTCERO,
viewUsuarios
].forEach(el=>{

if(el){
el.classList.add('hidden')
el.style.display='none'
}

})

/*=========================================================
LIBERA SOMENTE NIVEL 1
=========================================================*/
if(nivel===1){

if(tabPerfis){
tabPerfis.classList.remove('hidden')
tabPerfis.style.display='inline-flex'
}

if(tabTCERO){
tabTCERO.classList.remove('hidden')
tabTCERO.style.display='inline-flex'
}

if(tabUsuarios){
tabUsuarios.classList.remove('hidden')
tabUsuarios.style.display='inline-flex'
}

}

}
/*=========================================================
003 SEDAM CORE FUNCTION SWITCHTAB
=========================================================*/
function switchTab(t){

let adminsTCERO=[
'manoel',
'vagner',
'gleidi'
]

let usuarioAtual=(window.userP?.username||'').toLowerCase()

let origemUsuario=String(window.userP?.origem||'').toUpperCase()

let nivelUsuario=Number(window.userP?.nivel_acesso||0)

let isUsuarioSEDAM=
window.userP&&
origemUsuario==='SEDAM'

let isTCERONivel4=
window.userP&&
origemUsuario==='TCERO'&&
nivelUsuario===4&&
!adminsTCERO.includes(usuarioAtual)

let ocultarPerfis=
(
origemUsuario==='SEDAM'&&
nivelUsuario>=3
)||
(
origemUsuario==='TCERO'&&
nivelUsuario!==1
)

let tabPerfis=document.getElementById('tab-perfis')
let tabTCERO=document.getElementById('tab-tcero')
let tabUsuarios=document.getElementById('tab-usuarios')

if(isTCERONivel4){

if(tabPerfis){
tabPerfis.classList.add('hidden')
tabPerfis.style.display='none'
}

if(tabTCERO){
tabTCERO.classList.add('hidden')
tabTCERO.style.display='none'
}

if(tabUsuarios){
tabUsuarios.classList.add('hidden')
tabUsuarios.style.display='none'
}

}

if(ocultarPerfis){

if(tabPerfis){
tabPerfis.classList.add('hidden')
tabPerfis.style.display='none'
}

if(tabUsuarios){
tabUsuarios.classList.add('hidden')
tabUsuarios.style.display='none'
}

if(tabTCERO){
tabTCERO.classList.add('hidden')
tabTCERO.style.display='none'
}

let viewPerfis=document.getElementById('view-perfis')

if(viewPerfis){
viewPerfis.style.display='none'
viewPerfis.classList.add('hidden')
}

let viewUsuarios=document.getElementById('view-usuarios')

if(viewUsuarios){
viewUsuarios.style.display='none'
viewUsuarios.classList.add('hidden')
}

let viewTCERO=document.getElementById('view-tcero')

if(viewTCERO){
viewTCERO.style.display='none'
viewTCERO.classList.add('hidden')
}

}

if(isUsuarioSEDAM){

if(tabTCERO){
tabTCERO.classList.add('hidden')
tabTCERO.style.display='none'
}

let viewTCERO=document.getElementById('view-tcero')

if(viewTCERO){
viewTCERO.style.display='none'
viewTCERO.classList.add('hidden')
}

let acessoTCERO=document.getElementById('acesso-tcero')

if(acessoTCERO){
acessoTCERO.style.display='none'
}

}

localStorage.setItem('activeTab',t)

let boxModoResumo=document.getElementById('boxModoResumo')

if(boxModoResumo){

if(t==='resumo'){
boxModoResumo.style.display='flex'
}else{
boxModoResumo.style.display='none'
}

}

document.querySelectorAll('.tab-content,.tab-view').forEach(v=>{
v.classList.remove('active')
v.classList.add('hidden')
v.style.display='none'
v.style.visibility='hidden'
v.style.opacity='0'
})

document.querySelectorAll('.tab-btn').forEach(b=>{
b.classList.remove('tab-active')
})

if(
nivelUsuario!==1&&
(
t==='perfis'||
t==='usuarios'||
t==='tcero'
)
){
return
}

let view=document.getElementById('view-'+t)

if(view){
view.classList.remove('hidden')
view.classList.add('active')
view.style.display='block'
view.style.visibility='visible'
view.style.opacity='1'
}

let tab=document.getElementById('tab-'+t)

if(tab){
tab.classList.add('tab-active')
}

if(t==='dashboard'){

setTimeout(()=>{

if(typeof renderDashboard==='function'){
renderDashboard()
}

if(window.dashLinha&&typeof window.dashLinha.resize==='function'){
window.dashLinha.resize()
}

if(window.dashPizza&&typeof window.dashPizza.resize==='function'){
window.dashPizza.resize()
}

if(window.dashBarras&&typeof window.dashBarras.resize==='function'){
window.dashBarras.resize()
}

document.querySelectorAll('#view-dashboard canvas').forEach(c=>{
c.style.display='block'
c.style.visibility='visible'
c.style.opacity='1'
c.style.width='100%'
c.style.maxWidth='100%'
c.style.height='220px'
c.style.maxHeight='220px'
})

},350)

}

if(t==='analise'){

setTimeout(()=>{

initPainelGrafico()

if(window.graficoResumo&&typeof window.graficoResumo.resize==='function'){
window.graficoResumo.resize()
}

if(window.graficoMonitoramento&&typeof window.graficoMonitoramento.resize==='function'){
window.graficoMonitoramento.resize()
}

if(window.graficoGeral&&typeof window.graficoGeral.resize==='function'){
window.graficoGeral.resize()
}

document.querySelectorAll('#view-analise canvas,#view-graficos canvas').forEach(c=>{
c.style.display='block'
c.style.visibility='visible'
c.style.opacity='1'
c.style.width='100%'
c.style.maxWidth='100%'
c.style.height='320px'
c.style.maxHeight='320px'
})

},350)

}

if(t==='perfis'){

if(nivelUsuario!==1){
return
}

setTimeout(()=>{
carregarPerfis()
},200)

}

if(t==='usuarios'){

if(nivelUsuario!==1){
return
}

setTimeout(()=>{
carregarUsuarios()
},200)

}

if(t==='tcero'){

if(
origemUsuario==='SEDAM'||
(
origemUsuario==='TCERO'&&
nivelUsuario!==1
)
){
return
}

setTimeout(()=>{
carregarTCERO()
},200)

}

setTimeout(()=>{

if(typeof renderTable==='function'){
renderTable()
}

},100)

}
/*=========================================================
004 SEDAM CORE FUNCTION CARREGARDADOS
=========================================================*/
async function carregarDados(){

if(!window.userP){
console.log('userP não carregado')
return
}

let query=client
.from('deliberacoes')
.select('*')
.order('ordem1',{ascending:true})
.order('ordem2',{ascending:true})
.order('subitem',{ascending:true})

let {data,error}=await query

if(error){
console.log(error)
window.allData=[]
window.dados=[]
window.dadosFiltrados=[]
window.lista=[]
window.listaDados=[]
window.resumoData=[]
if(typeof renderDashboard==='function'){
renderDashboard()
}
return
}

let dadosTratados=(data||[]).map(i=>{

let total=Number(
i.total_cumprimento||
i.percentual||
i.percentual_execucao||
0
)

if(total<=0){

let meses=[
Number(i.jan||0),
Number(i.fev||0),
Number(i.mar||0),
Number(i.abr||0),
Number(i.mai||0),
Number(i.jun||0),
Number(i.jul||0),
Number(i.ago||0),
Number(i.set||0),
Number(i.out||0),
Number(i.nov||0),
Number(i.dez||0)
]

total=Math.max(...meses,0)

}

return{
...i,
item:String(i.item||i.numitem||String(i.subitem||'').split('.')[0]||'0'),
subitem:String(i.subitem||'0.0'),
ordem1:Number(i.ordem1||i.numsubitem||0),
ordem2:Number(i.ordem2||0),
jan:Number(i.jan||0),
fev:Number(i.fev||0),
mar:Number(i.mar||0),
abr:Number(i.abr||0),
mai:Number(i.mai||0),
jun:Number(i.jun||0),
jul:Number(i.jul||0),
ago:Number(i.ago||0),
set:Number(i.set||0),
out:Number(i.out||0),
nov:Number(i.nov||0),
dez:Number(i.dez||0),
total_cumprimento:total
}

})

let origemUsuario=String(userP?.origem||'').toUpperCase()
let nivelUsuario=Number(userP?.nivel_acesso||0)

let usernameAtual=String(userP?.username||'').toLowerCase()

let isNivel1SEDAM=
origemUsuario==='SEDAM'&&
nivelUsuario===1

let isUsuarioTCERO=
origemUsuario==='TCERO'

let isAdminGeral=
isNivel1SEDAM||
isUsuarioTCERO

let dadosFiltrados=[...dadosTratados]

if(
origemUsuario==='SEDAM'&&
nivelUsuario>1&&
!isAdminGeral
){

dadosFiltrados=dadosFiltrados.filter(i=>
String(i.responsavel_id||'')===String(userP.id||'')
)

}

dadosFiltrados=dadosFiltrados.sort(compareSubitem)
window.allData=[...dadosFiltrados]
window.dados=[...dadosFiltrados]
window.dadosFiltrados=[...dadosFiltrados]
window.lista=[...dadosFiltrados]
window.listaDados=[...dadosFiltrados]
window.resumoData=[...dadosFiltrados]

console.log('TOTAL FINAL ALLDATA:',window.allData.length)

let totalItens=[
...new Set(
window.allData.map(i=>
String(i.item||'0')
)
)
].length

let totalSubitens=window.allData.length

let media=Math.round(
window.allData.reduce((acc,c)=>{
return acc+Number(c.total_cumprimento||0)
},0)/(window.allData.length||1)
)

let topoItens=document.getElementById('topTotalItens')
let topoSubitens=document.getElementById('topTotalSubitens')
let totalGeral=document.getElementById('total-geral')

if(topoItens){
topoItens.innerText=totalItens
}

if(topoSubitens){
topoSubitens.innerText=totalSubitens
}

if(totalGeral){
totalGeral.innerText=media+'%'
}

if(typeof renderDashboard==='function'){
renderDashboard()
}

setTimeout(()=>{

if(typeof renderResumo==='function'){
renderResumo()
}

if(typeof renderTable==='function'){
renderTable()
}

if(typeof initPainelGrafico==='function'){
initPainelGrafico()
}

if(typeof renderConcluidos==='function'){
renderConcluidos()
}

if(typeof renderDashboard==='function'){
renderDashboard()
}

},200)

}

/*=========================================================
005A SEDAM CORE FUNCTION COMPARESUBITEM
=========================================================*/
function compareSubitem(a,b){
let oa=Number(a.ordem1||a.ordem||a.numsubitem||0)
let ob=Number(b.ordem1||b.ordem||b.numsubitem||0)
if(oa>0&&ob>0&&oa!==ob)return oa-ob
let o2a=Number(a.ordem2||0)
let o2b=Number(b.ordem2||0)
if(oa>0&&ob>0&&o2a!==o2b)return o2a-o2b
let sa=String(a.subitem||a.item||'0.0').replace(/[^\d\.]/g,'')
let sb=String(b.subitem||b.item||'0.0').replace(/[^\d\.]/g,'')
let pa=sa.split('.').map(n=>parseInt(n)||0)
let pb=sb.split('.').map(n=>parseInt(n)||0)
let max=Math.max(pa.length,pb.length)
for(let i=0;i<max;i++){
let va=pa[i]||0
let vb=pb[i]||0
if(va!==vb)return va-vb
}
return 0
}
/*=========================================================
005B SEDAM CORE FUNCTION RENDERRESUMO ITENS
=========================================================*/
function renderResumoItens(){
let box=document.getElementById('cards-container')
if(!box)return
let mapa={}
;(window.allData||[]).forEach(i=>{
let item=String(i.item||'0')
if(!mapa[item]){
mapa[item]={
item:item,
descricao:descItens[item]||'SEM DESCRIÇÃO',
total:0,
qtd:0
}
}
mapa[item].total+=Number(getTotal(i)||0)
mapa[item].qtd++
})
let lista=Object.values(mapa).map(i=>({
...i,
media:Math.round(i.total/(i.qtd||1))
}))
lista=lista.sort(compareSubitem)
box.innerHTML=lista.map(i=>{
let cor='bg-status-red'
if(i.media>=100){
cor='bg-status-green'
}else if(i.media>=31){
cor='bg-status-yellow'
}
return`
<div class="card-micro ${cor} rounded-xl p-2 shadow cursor-pointer">
<div class="text-[10px] font-black text-center">ITEM ${i.item}</div>
<div class="text-[9px] text-center leading-tight mt-1">${i.descricao}</div>
<div class="percent-big text-center mt-2">${i.media}%</div>
</div>
`
}).join('')
}

/*=========================================================
005 SEDAM CORE FUNCTION CARREGARUSUARIOS
=========================================================*/
async function carregarUsuarios(){
if(!userP)return
let {data,error}=await client.from('perfis').select('id,nome_completo,username,nivel_acesso').order('nome_completo')
if(error){
console.error(error)
return
}
let lista=data||[]
let adminMaster=Number(userP.nivel_acesso)===1||['manoel','vagner','gleidi'].includes((userP.username||'').toLowerCase())
if(!adminMaster){
lista=lista.filter(u=>String(u.id)===String(userP.id))
}
let html=`<div class="w-full"><div class="grid grid-cols-2 text-xs font-black text-black border-b border-slate-700 pb-2 mb-2"><div>Nome completo</div><div class="text-right">Login</div></div>${lista.map(u=>`<div class="grid grid-cols-2 items-center border-b border-slate-300 py-2"><div class="text-black font-semibold">${u.nome_completo||'-'}</div><div class="text-right font-black text-blue-900">${u.username||'-'}</div></div>`).join('')}</div>`
document.getElementById('listaUsuarios').innerHTML=html
}
/*=========================================================
006 SEDAM CORE FUNCTION CARREGARPERFIS
=========================================================*/
async function carregarPerfis(){
if(!userP)return
let isAdminSedam=Number(userP.nivel_acesso)===1
let isTCERO=(userP.origem||'')==='TCERO'
if(isTCERO&&!['manoel','vagner','gleidi'].includes((userP.username||'').toLowerCase())){
return
}
let query=client.from('perfis').select('*').order('nome_completo')
if(!isAdminSedam){
document.getElementById('listaPerfis').innerHTML=''
return
}
let {data,error}=await query
if(error){
console.error(error)
return
}
window.perfis=data||[]
let html=`
<div class="flex justify-end items-center gap-3 mb-4">

${isAdminSedam?`
<button id="btnNovoPerfilSedam" onclick="novoPerfilSedam()" class="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-[9px] font-black shadow-xl min-w-[130px]">
INSERIR
</button>
`:''}

${isAdminSedam?`
<button id="btnEditarPerfilSedam" onclick="ativarEdicaoPerfisSedam()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-[9px] font-black shadow-xl min-w-[130px]">
EDITAR
</button>
`:''}

${isAdminSedam?`
<button id="btnSalvarPerfilSedam" onclick="salvarEdicaoPerfisSedam()" class="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-xl text-[9px] font-black shadow-xl min-w-[130px]" hidden>
SALVAR
</button>
`:''}

</div>

<div id="boxCadastroPerfilSedam" class="hidden bg-white/80 backdrop-blur-sm rounded-3xl p-5 mb-5 shadow-[0_8px_30px_rgba(0,0,0,.08)]">

<div class="grid grid-cols-1 md:grid-cols-6 gap-3">

<input id="novo_nome_sedam" placeholder="Nome Completo" class="bg-white rounded-xl px-4 py-3 font-black outline-none border border-slate-200">

<input id="novo_user_sedam" placeholder="Usuário" class="bg-white rounded-xl px-4 py-3 font-black outline-none border border-slate-200">

<input id="novo_senha_sedam" placeholder="Senha" class="bg-white rounded-xl px-4 py-3 font-black outline-none border border-slate-200">

<input id="novo_cargo_sedam" placeholder="Cargo" class="bg-white rounded-xl px-4 py-3 font-black outline-none border border-slate-200">

<select id="novo_nivel_sedam" class="bg-white rounded-xl px-4 py-3 font-black outline-none border border-slate-200">
<option value="1">Nível 1</option>
<option value="2">Nível 2</option>
<option value="3">Nível 3</option>
<option value="4" selected>Nível 4</option>
</select>

<button onclick="salvarNovoPerfilSedam()" class="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-5 py-3 font-black shadow-xl">
INSERIR
</button>

</div>

</div>

<div class="overflow-x-auto w-full rounded-2xl bg-white/60 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,.06)]">

<table class="w-full min-w-[920px] border-separate border-spacing-y-1">

<thead>

<tr class="text-[9px] uppercase font-black text-slate-700">

<th class="text-left px-4 py-3">Nome</th>
<th class="text-left px-4 py-3">Usuário</th>
<th class="text-left px-4 py-3">Senha</th>
<th class="text-left px-4 py-3">Cargo</th>
<th class="text-left px-4 py-3">Setor</th>
<th class="text-center px-4 py-3">Nível</th>
<th class="text-center px-4 py-3">Ações</th>

</tr>

</thead>

<tbody>

${window.perfis.map(p=>`

<tr class="linha-perfil-sedam bg-white/92 hover:bg-amber-50 transition shadow-[0_4px_18px_rgba(0,0,0,0.05)]" data-id="${p.id}">

<td class="px-2 py-1 rounded-l-2xl">
<input id="nome_sedam_${p.id}" value="${p.nome_completo||''}" disabled class="campo-editavel-sedam opacity-70 w-full bg-transparent text-[10px] font-black outline-none border-none">
</td>

<td class="px-2 py-1">
<input id="user_sedam_${p.id}" value="${p.username||''}" disabled class="campo-editavel-sedam opacity-70 w-full bg-transparent text-[9px] font-black outline-none border-none">
</td>

<td class="px-2 py-1">
<input id="senha_sedam_${p.id}" value="${p.senha||''}" disabled class="campo-editavel-sedam opacity-70 w-full bg-transparent text-[9px] font-black outline-none border-none text-red-700">
</td>

<td class="px-2 py-1">
<input id="cargo_sedam_${p.id}" value="${p.cargo||''}" disabled class="campo-editavel-sedam opacity-70 w-full bg-transparent text-[9px] font-black outline-none border-none">
</td>

<td class="px-2 py-1">
<input id="setor_sedam_${p.id}" value="${p.setor||''}" disabled class="campo-editavel-sedam opacity-70 w-full bg-transparent text-[9px] font-black outline-none border-none">
</td>

<td class="px-2 py-1 text-center">
<select id="nivel_sedam_${p.id}" disabled class="campo-editavel-sedam opacity-70 bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-[9px] font-black border-none outline-none">
<option value="1" ${Number(p.nivel_acesso)===1?'selected':''}>Nível 1</option>
<option value="2" ${Number(p.nivel_acesso)===2?'selected':''}>Nível 2</option>
<option value="3" ${Number(p.nivel_acesso)===3?'selected':''}>Nível 3</option>
<option value="4" ${Number(p.nivel_acesso)===4?'selected':''}>Nível 4</option>
</select>
</td>

<td class="px-2 py-1 text-center rounded-r-2xl">
${isAdminSedam?`
<button onclick="excluirPerfil('${p.id}')" class="btn-excluir-sedam hidden bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-[10px] font-black shadow">
EXCLUIR
</button>
`:''}
</td>

</tr>

`).join('')}

</tbody>

</table>

</div>
`
document.getElementById('listaPerfis').innerHTML=html
}
/*=========================================================
006A SEDAM FUNCTION NOVOPERFILSEDAM
=========================================================*/
function novoPerfilSedam(){
let box=document.getElementById('boxCadastroPerfilSedam')
if(box){
box.classList.remove('hidden')
}
}

/*=========================================================
006B SEDAM FUNCTION ATIVAREDICAOPERFISSEDAM
=========================================================*/
function ativarEdicaoPerfisSedam(){
window.modoEdicaoPerfisSedam=true
document.querySelectorAll('.campo-editavel-sedam').forEach(c=>{
c.disabled=false
c.classList.remove('opacity-70')
})
document.querySelectorAll('.btn-excluir-sedam').forEach(b=>{
b.classList.remove('hidden')
})
let btnSalvar=document.getElementById('btnSalvarPerfilSedam')
if(btnSalvar){
btnSalvar.hidden=false
}
}

/*=========================================================
006C SEDAM FUNCTION SALVAREDICAOPERFISSEDAM
=========================================================*/
async function salvarEdicaoPerfisSedam(){
let linhas=[...document.querySelectorAll('.linha-perfil-sedam')]
for(let l of linhas){
let id=l.dataset.id
let nome=document.getElementById('nome_sedam_'+id)?.value||''
let username=document.getElementById('user_sedam_'+id)?.value||''
let senha=document.getElementById('senha_sedam_'+id)?.value||''
let cargo=document.getElementById('cargo_sedam_'+id)?.value||''
let setor=document.getElementById('setor_sedam_'+id)?.value||''
let nivel=document.getElementById('nivel_sedam_'+id)?.value||4

let payload={
nome_completo:nome,
username:username,
cargo:cargo,
setor:setor,
nivel_acesso:Number(nivel)
}

if(String(senha||'').trim()!==''){
payload.senha=senha
}

let {error}=await client.from('perfis').update(payload).eq('id',id)

if(error){
console.error(error)
alert('Erro ao salvar')
return
}
}

document.querySelectorAll('.btn-excluir-sedam').forEach(b=>{
b.classList.add('hidden')
})

window.modoEdicaoPerfisSedam=false

let btnEditar=document.getElementById('btnEditarPerfisSedam')
let btnSalvar=document.getElementById('btnSalvarPerfisSedam')

if(btnEditar)btnEditar.hidden=false
if(btnSalvar)btnSalvar.hidden=true

alert('Perfis SEDAM salvos com sucesso')

await carregarPerfis()
}
/*=========================================================
006D SEDAM FUNCTION SALVARNOVOPERFILSEDAM
=========================================================*/
async function salvarNovoPerfilSedam(){
let nome=document.getElementById('novo_nome_sedam').value.trim()
let usuario=document.getElementById('novo_user_sedam').value.trim().toLowerCase()
let senha=document.getElementById('novo_senha_sedam').value.trim()
let cargo=document.getElementById('novo_cargo_sedam').value.trim()
let nivel=document.getElementById('novo_nivel_sedam').value
if(!nome||!usuario||!senha){
alert('Preencha nome, usuário e senha')
return
}
let {error}=await client.from('perfis').insert([{
nome_completo:nome,
username:usuario,
senha:senha,
cargo:cargo,
nivel_acesso:Number(nivel)
}])
if(error){
console.error(error)
alert('Erro ao inserir perfil')
return
}
alert('Perfil inserido com sucesso')
await carregarPerfis()
}

/*=========================================================
007 DASHBOARD
=========================================================*/
let dashLinha=null
let dashPizza=null
let dashBarras=null

function getTotal(i){

let ordem=[
'dez',
'nov',
'out',
'set',
'ago',
'jul',
'jun',
'mai',
'abr',
'mar',
'fev',
'jan'
]

for(let k of ordem){

let v=Number(i[k]||0)

if(v>0){
return v
}

}

return 0

}
/*=========================================================
00 SEDAM CORE FUNCTION RENDERDASHBOARD
=========================================================*/
function renderDashboard(){
console.log('RENDER DASHBOARD')
let lista=window.allData||[]
console.log('LISTA DASHBOARD:',lista)

if(!lista.length){

let a=document.getElementById('dashboardMediaGeral')
let b=document.getElementById('dashboardTotalItens')
let c=document.getElementById('dashboardTotalSubitens')
let d=document.getElementById('dashboardCumpridos')
let e=document.getElementById('dashboardCriticos')
let f=document.getElementById('dashboardAndamento')
let g=document.getElementById('dashPendentes')

if(a)a.innerText='0%'
if(b)b.innerText='0'
if(c)c.innerText='0'
if(d)d.innerText='0'
if(e)e.innerText='0'
if(f)f.innerText='0'
if(g)g.innerText='0'

return
}

let totalSubitens=lista.length

let totalItens=[...new Set(
lista.map(i=>String(i.item||'0'))
)].length

let media=Math.round(
lista.reduce((acc,c)=>{
return acc+Number(getTotal(c)||0)
},0)/(lista.length||1)
)

let concluidos=0
let criticos=0
let andamento=0
let pendentes=0

lista.forEach(i=>{

let t=Math.max(
Number(i.jan||0),
Number(i.fev||0),
Number(i.mar||0),
Number(i.abr||0),
Number(i.mai||0),
Number(i.jun||0),
Number(i.jul||0),
Number(i.ago||0),
Number(i.set||0),
Number(i.out||0),
Number(i.nov||0),
Number(i.dez||0)
)

if(t>=100){

concluidos++

}else if(t>0&&t<=30){

criticos++

}else if(t>30&&t<100){

andamento++

}else{

pendentes++

}

})

document.getElementById('dashboardMediaGeral').innerText=media+'%'
document.getElementById('dashboardTotalItens').innerText=totalItens
document.getElementById('dashboardTotalSubitens').innerText=totalSubitens
document.getElementById('dashboardCumpridos').innerText=concluidos
document.getElementById('dashboardCriticos').innerText=criticos
document.getElementById('dashboardAndamento').innerText=andamento
document.getElementById('dashPendentes').innerText=pendentes
  
let topo=document.getElementById('total-geral')

if(topo){
topo.innerText=media+'%'
}

let meses=['JAN','FEV','MAR','ABR','MAI']

let mediasMeses=[
Math.round(lista.reduce((a,c)=>a+Number(c.jan||0),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number((c.fev&&c.fev>0)?c.fev:(c.jan||0)),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number((c.mar&&c.mar>0)?c.mar:((c.fev&&c.fev>0)?c.fev:(c.jan||0))),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number((c.abr&&c.abr>0)?c.abr:((c.mar&&c.mar>0)?c.mar:((c.fev&&c.fev>0)?c.fev:(c.jan||0)))),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number(getTotal(c)||0),0)/(lista.length||1))
]

if(dashLinha){
dashLinha.destroy()
}

dashLinha=new Chart(
document.getElementById('graficoDashboardLinha'),
{
type:'line',
data:{
labels:meses,
datasets:[{
label:'Percentual Médio (%)',
data:mediasMeses,
borderColor:'#22c55e',
backgroundColor:'rgba(34,197,94,.12)',
pointBackgroundColor:'#22c55e',
pointRadius:5,
pointHoverRadius:7,
borderWidth:3,
tension:.35,
fill:true
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:false
},
tooltip:{
callbacks:{
label:(ctx)=>ctx.raw+'%'
}
},
datalabels:{
color:'#111827',
align:'top',
anchor:'end',
font:{
weight:'900',
size:11
},
formatter:(v)=>v+'%'
}
},
scales:{
y:{
beginAtZero:true,
max:100,
ticks:{
callback:(v)=>v+'%'
}
}
}
},
plugins:[ChartDataLabels]
}
)

if(dashPizza){
dashPizza.destroy()
}
/*=========================================================
007 DASHBOARD GRAFICO PIZZA
=========================================================*/
dashPizza=new Chart(
document.getElementById('graficoDashboardPizza'),
{
type:'doughnut',
data:{
labels:[
'Cumpridos 100%',
'Em Andamento 30% a 99%',
'Abaixo de 30%',
'Pendentes 0%'
],
datasets:[{
data:[
concluidos,
andamento,
criticos,
pendentes
],
backgroundColor:[
'#22c55e',
'#eab308',
'#ef4444',
'#94a3b8'
],
borderWidth:2,
borderColor:'#ffffff'
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
cutout:'58%',
plugins:{
legend:{
position:'bottom',
labels:{
color:'#000000',
font:{
size:window.innerWidth<768?10:13,
weight:'900'
},
padding:16,
boxWidth:14
}
},
tooltip:{
callbacks:{
label:(ctx)=>ctx.raw
}
},
datalabels:{
color:'#000000',
font:{
weight:'900',
size:window.innerWidth<768?6:8
},
formatter:(v,ctx)=>{
let total=ctx.chart.data.datasets[0].data.reduce((a,b)=>a+b,0)
let perc=Math.round((v*100)/total)
return perc+'%'
}
}
}
},
plugins:[ChartDataLabels]
}
)
/*=========================================================
008 DASHBOARD MAPA ITENS
=========================================================*/
let mapaItens={}
lista.forEach(i=>{
let item=String(
i.item||
getItemKey(i)||
'0'
)
if(!mapaItens[item]){
mapaItens[item]=[]
}
mapaItens[item].push(
Number(getTotal(i)||0)
)
})
/*=========================================================
009 DASHBOARD LABELS E VALORES
=========================================================*/
let labels=Object.keys(mapaItens).sort((a,b)=>{
let pa=String(a).split('.').map(n=>parseInt(n)||0)
let pb=String(b).split('.').map(n=>parseInt(n)||0)
let max=Math.max(pa.length,pb.length)
for(let i=0;i<max;i++){
let va=pa[i]||0
let vb=pb[i]||0
if(va!==vb)return va-vb
}
return 0
})
let valores=labels.map(l=>{
let arr=mapaItens[l]
return Math.round(
arr.reduce((a,b)=>a+b,0)/(arr.length||1)
)
})
/*=========================================================
010 DASHBOARD CORES BARRAS
=========================================================*/
let cores=valores.map(v=>{
if(v>=70)return '#22c55e'
if(v>=31)return '#eab308'
return '#ef4444'
})
/*=========================================================
011 DASHBOARD DESTROI GRAFICO ANTERIOR
=========================================================*/
if(dashBarras){
dashBarras.destroy()
}
dashBarras=new Chart(
document.getElementById('graficoDashboardItens'),
{
type:'bar',
data:{
labels:labels.map(i=>'Item '+i),
datasets:[{
label:'Percentual Médio',
data:valores,
backgroundColor:cores,
borderRadius:8,
borderSkipped:false,
maxBarThickness:28
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:false
},
tooltip:{
callbacks:{
label:(ctx)=>ctx.raw+'%'
}
},
datalabels:{
color:'#111827',
anchor:'end',
align:'top',
font:{
size:window.innerWidth<768?5:7,
weight:'900'
},
formatter:(v)=>v+'%'
}
},
scales:{
y:{
beginAtZero:true,
max:100,
ticks:{
callback:(v)=>v+'%'
}
}
}
},
plugins:[ChartDataLabels]
}
)
console.log({
media,
totalItens,
totalSubitens,
concluidos,
andamento,
criticos
})
}
/*=========================================================
999 SEDAM CORE FUNCTION ABRIRDETALHESRESUMO
=========================================================*/
function abrirDetalhesResumo(chave){

let modal=document.getElementById('modalResumo')
let conteudo=document.getElementById('conteudoResumo')

if(!modal||!conteudo){
console.log('Modal resumo não encontrado')
return
}

let lista=(window.allData||[]).filter(i=>{

let sub=String(i.subitem||'').trim()
let item=String(i.item||'').trim()
let ident=String(i.identificador||'').trim()

return(
sub===String(chave).trim()||
item===String(chave).trim()||
ident===String(chave).trim()
)

})

if(!lista.length){

alert('Nenhum dado encontrado')

return

}

conteudo.innerHTML=''

lista.sort(compareSubitem)

lista.forEach(i=>{

let total=getTotal(i)

let cor=total<=30
?'#dc2626'
:total>=100
?'#16a34a'
:'#eab308'

conteudo.innerHTML+=`
<div class="bg-white rounded-2xl p-4 mb-3 border border-slate-300 shadow">
<div class="flex justify-between items-start gap-3 mb-2">
<div>
<div class="text-xs font-black text-blue-900">
SUBITEM ${i.subitem||'-'}
</div>
<div class="text-sm font-black text-black">
${i.descricao||'-'}
</div>
</div>
<div style="background:${cor};" class="px-3 py-2 rounded-xl text-white font-black text-sm">
${total}%
</div>
</div>

<div class="grid grid-cols-5 gap-2 mt-3">

<div class="bg-slate-100 rounded-xl p-2 text-center">
<div class="text-[9px] font-black">JAN</div>
<div class="font-black">${Number(i.jan||0)}%</div>
</div>

<div class="bg-slate-100 rounded-xl p-2 text-center">
<div class="text-[9px] font-black">FEV</div>
<div class="font-black">${Number(i.fev||0)}%</div>
</div>

<div class="bg-slate-100 rounded-xl p-2 text-center">
<div class="text-[9px] font-black">MAR</div>
<div class="font-black">${Number(i.mar||0)}%</div>
</div>

<div class="bg-slate-100 rounded-xl p-2 text-center">
<div class="text-[9px] font-black">ABR</div>
<div class="font-black">${Number(i.abr||0)}%</div>
</div>

<div class="bg-slate-100 rounded-xl p-2 text-center">
<div class="text-[9px] font-black">MAI</div>
<div class="font-black">${Number(i.mai||0)}%</div>
</div>

</div>

<div class="mt-3 text-[11px] font-bold text-slate-700">
RESPONSÁVEL: ${i.responsavel||'-'}
</div>

<div class="text-[11px] font-bold text-slate-700 mt-1">
PRODUTO: ${i.produto||'-'}
</div>

</div>
`

})

modal.classList.remove('hidden')
modal.style.display='flex'

}

/*=========================================================
998 SEDAM CORE FUNCTION FECHARMODALRESUMO
=========================================================*/
function fecharModalResumo(){

let modal=document.getElementById('modalResumo')

if(modal){
modal.classList.add('hidden')
modal.style.display='none'
}

}

/*=========================================================
000 SEDAM CORE FUNCTION PAINEL GERAL
=========================================================*/
function abrirPainelSedam(){
let geral=document.getElementById('painel-geral-acesso')
let login=document.getElementById('login-screen')
let dash=document.getElementById('dashboard')
if(geral){
geral.classList.add('hidden')
geral.style.display='none'
}
if(window.userP&&window.userP.username){
if(login){
login.classList.add('hidden')
login.style.display='none'
}
if(dash){
dash.classList.remove('hidden')
dash.style.display='block'
dash.style.visibility='visible'
dash.style.opacity='1'
}
carregarDados().then(()=>{
switchTab('dashboard')
if(typeof renderDashboard==='function'){
renderDashboard()
}
})
}else{
document.body.classList.add("login-bg")
if(login){
login.classList.remove('hidden')
login.style.display='flex'
login.style.visibility='visible'
login.style.opacity='1'
}
if(dash){
dash.classList.add('hidden')
dash.style.display='none'
}
}
}
function abrirPainelSepat(){
window.location.href='sepatindex.html'
}
function abrirPainelQueimadas(){
alert('Painel de Combate às Queimadas em desenvolvimento.')
}
function voltarPainelGeralSedam(){
let geral=document.getElementById('painel-geral-acesso')
let login=document.getElementById('login-screen')
let dash=document.getElementById('dashboard')
document.body.classList.remove("login-bg")
if(geral){
geral.classList.remove('hidden')
geral.style.display='flex'
geral.style.visibility='visible'
geral.style.opacity='1'
}
if(login){
login.classList.add('hidden')
login.style.display='none'
}
if(dash){
dash.classList.add('hidden')
dash.style.display='none'
}
}

async function backupSedam(){
try{
let tabelas=['deliberacoes','perfis','perfistce','evolucao_mensal']
let backup={}
for(let t of tabelas){
let {data,error}=await client.from(t).select('*')
if(error){
console.log(error)
continue
}
backup[t]=data||[]
}
let blob=new Blob(
[JSON.stringify(backup,null,2)],
{type:'application/json'}
)
let a=document.createElement('a')
a.href=URL.createObjectURL(blob)
a.download='backup_sedam_'+new Date().toISOString().slice(0,10)+'.json'
document.body.appendChild(a)
a.click()
a.remove()
URL.revokeObjectURL(a.href)
alert('Backup Sedam realizado com sucesso')
}catch(e){
console.log(e)
alert('Erro ao gerar backup')
}
}
