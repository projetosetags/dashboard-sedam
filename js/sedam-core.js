/*=========================================================
001 SEDAM CORE DOMCONTENTLOADED
=========================================================*/
document.addEventListener("DOMContentLoaded",()=>{
document.getElementById('dataInicio').value='2025-01-01'
document.getElementById('dataFim').value='2028-01-01'
document.body.classList.add("login-bg")
localStorage.removeItem('uid')
let userLocal=localStorage.getItem('user')
if(userLocal){
try{
let perfil=JSON.parse(userLocal)
if(perfil&&perfil.username){
window.userP=perfil
userP=perfil
document.body.classList.remove('login-bg')
document.getElementById('login-screen').classList.add('hidden')
document.getElementById('dashboard').classList.remove('hidden')
document.getElementById('user-info').innerHTML=(perfil.nome_completo||'-')+' • '+(perfil.cargo||'-')+' • '+(perfil.origem||'-')
switchTab(localStorage.getItem('activeTab')||'resumo')
carregarDados()
return
}
}catch(e){
console.log(e)
localStorage.removeItem('user')
}
}
const lastTab=localStorage.getItem('activeTab')
if(lastTab){
switchTab(lastTab)
}
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

let {data:p1}=await client
.from('perfistce')
.select('*')
.eq('username',usuario)
.eq('senha',senha)
.limit(1)

if(p1&&p1.length){
perfil=p1[0]
perfil.origem='TCERO'
}else{

let {data:p2}=await client
.from('perfis')
.select('*')
.eq('username',usuario)
.limit(1)

if(p2&&p2.length){
perfil=p2[0]
perfil.origem='SEDAM'

if(
perfil.senha&&
String(perfil.senha)!==String(senha)
){
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

localStorage.setItem(
'user',
JSON.stringify(perfil)
)

document.body.classList.remove('login-bg')

document.getElementById('login-screen')
.classList.add('hidden')

document.getElementById('dashboard')
.classList.remove('hidden')

document.getElementById('user-info').innerHTML=
(perfil.nome_completo||'-')+
' • '+
(perfil.cargo||'-')+
' • '+
(perfil.origem||'-')

let tabPerfis=document.getElementById('tab-perfis')
let tabTCERO=document.getElementById('tab-tcero')

if(tabPerfis){
tabPerfis.classList.add('hidden')
}

if(tabTCERO){
tabTCERO.classList.add('hidden')
}

let usernameAtual=(perfil.username||'').toLowerCase()

let adminsTCERO=[
'manoel',
'vagner',
'gleidi'
]

if(perfil.origem==='SEDAM'){

if(tabPerfis){
tabPerfis.classList.remove('hidden')
tabPerfis.innerHTML='<div>👥</div><div>Perfis Sedam</div>'
}

if(tabTCERO){
tabTCERO.style.display='none'
}

}

if(
perfil.origem==='TCERO'&&
adminsTCERO.includes(usernameAtual)
){

if(tabPerfis){
tabPerfis.classList.remove('hidden')
tabPerfis.innerHTML='<div>👥</div><div>Perfis Sedam</div>'
}

if(tabTCERO){
tabTCERO.classList.remove('hidden')
tabTCERO.style.display='inline-flex'
}

}

if(
perfil.origem==='TCERO'&&
!adminsTCERO.includes(usernameAtual)
){

if(tabPerfis){
tabPerfis.style.display='none'
}

if(tabTCERO){
tabTCERO.style.display='none'
}

}

await carregarPerfis()
await carregarTCERO()
await carregarDados()

setTimeout(()=>{

if(typeof renderDashboard==='function'){
renderDashboard()
}

switchTab('dashboard')

},300)

}
/*=========================================================
003 SEDAM CORE FUNCTION SWITCHTAB
=========================================================*/
function switchTab(t){

if(t==='dashboard'){
console.log('ABRINDO DASHBOARD')
console.log(typeof renderDashboard)

setTimeout(()=>{
if(typeof renderDashboard==='function'){
renderDashboard()
}else{
console.error('renderDashboard NÃO EXISTE')
}
},200)
}

localStorage.setItem('activeTab',t)

document.querySelectorAll('.tab-view').forEach(v=>{
v.classList.add('hidden')
v.style.display='none'
})

document.querySelectorAll('.tab-btn').forEach(b=>{
b.classList.remove('tab-active')
})

let view=document.getElementById('view-'+t)

if(view){
view.classList.remove('hidden')
view.style.display='block'
view.style.visibility='visible'
view.style.opacity='1'
}

let tab=document.getElementById('tab-'+t)

if(tab){
tab.classList.add('tab-active')
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

document.querySelectorAll('canvas').forEach(c=>{
c.style.display='block'
c.style.visibility='visible'
c.style.opacity='1'
})

},350)
}

if(t==='perfis'){
setTimeout(()=>{
carregarPerfis()
},200)
}

if(t==='usuarios'){
setTimeout(()=>{
carregarUsuarios()
},200)
}

if(t==='tcero'){
setTimeout(()=>{
carregarTCERO()
},200)
}

setTimeout(()=>{
renderTable()
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
let query=client.from('deliberacoes').select('*')
let adminsTCERO=['manoel','vagner','gleidi']
let isAdminTCERO=adminsTCERO.includes((userP.username||'').toLowerCase())
console.log('USUÁRIO LOGADO:',userP.username,'NÍVEL:',userP.nivel_acesso,'ADMIN TCERO:',isAdminTCERO)
let {data,error}=await query
if(error){
console.log(error)
window.allData=[]
renderDashboard()
return
}
window.allData=(data||[]).map(i=>{
let total=Number(i.total_cumprimento||i.percentual||i.percentual_execucao||0)
if(total<=0){
let meses=[
Number(i.jan||0),
Number(i.fev||0),
Number(i.mar||0),
Number(i.abr||0),
Number(i.mai||0)
]
total=Math.max(...meses,0)
}
return{
...i,
item:i.item||String(i.subitem||'').split('.')[0]||'0',
subitem:i.subitem||'0.0',
jan:Number(i.jan||0),
fev:Number(i.fev||0),
mar:Number(i.mar||0),
abr:Number(i.abr||0),
mai:Number(i.mai||0),
total_cumprimento:total
}
})
console.log('TOTAL DELIBERAÇÕES:',window.allData.length)
console.log('TOTAL CARREGADO:',window.allData.length)
console.log('DADOS DASHBOARD:',window.allData)
renderDashboard()
if(typeof renderResumo==='function'){
renderResumo()
}
if(typeof renderMonitoramento==='function'){
renderMonitoramento()
}
if(typeof renderAnalise==='function'){
renderAnalise()
}
if(typeof renderConcluidos==='function'){
renderConcluidos()
}
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
query=query.eq('id',userP.id)
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

let total=Number(
i.total_cumprimento||
i.percentual||
i.percentual_execucao||
0
)

if(total>0){
return Math.round(total)
}

let meses=[
Number(i.jan||0),
Number(i.fev||0),
Number(i.mar||0),
Number(i.abr||0),
Number(i.mai||0)
]

return Math.max(...meses,0)

}

function renderDashboard(){
console.log(
'DADOS DASHBOARD:',
window.allData
)
let lista=(window.allData||[])

console.log('RENDER DASHBOARD',lista)

if(!lista.length){

console.log('Dashboard sem dados')

let el1=document.getElementById('dashMedia')
let el2=document.getElementById('dashItens')
let el3=document.getElementById('dashSubitens')
let el4=document.getElementById('dashConcluidos')
let el5=document.getElementById('dashAndamento')
let el6=document.getElementById('dashPendentes')

if(el1)el1.innerText='0%'
if(el2)el2.innerText='0'
if(el3)el3.innerText='0'
if(el4)el4.innerText='0'
if(el5)el5.innerText='0'
if(el6)el6.innerText='0'

return

}

let totalSubitens=lista.length

let totalItens=[
...new Set(
lista.map(i=>
String(
i.item||
getItemKey(i)||
'0'
)
)
)
].length

let media=Math.round(
lista.reduce((acc,c)=>{
return acc+Number(getTotal(c)||0)
},0)/(lista.length||1)
)

let concluidos=lista.filter(i=>getTotal(i)>=100).length

let andamento=lista.filter(i=>{
let t=getTotal(i)
return t>0&&t<100
}).length

let pendentes=lista.filter(i=>getTotal(i)<=0).length

document.getElementById('dashMedia').innerText=media+'%'
document.getElementById('dashItens').innerText=totalItens
document.getElementById('dashSubitens').innerText=totalSubitens
document.getElementById('dashConcluidos').innerText=concluidos
document.getElementById('dashAndamento').innerText=andamento
document.getElementById('dashPendentes').innerText=pendentes

let meses=['JAN','FEV','MAR','ABR','MAI']

let mediasMeses=[
Math.round(lista.reduce((a,c)=>a+Number(c.jan||0),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number(c.fev||0),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number(c.mar||0),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number(c.abr||0),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number(c.mai||0),0)/(lista.length||1))
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
borderWidth:3,
tension:.35,
fill:true
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:true}
},
scales:{
y:{
beginAtZero:true,
max:100
}
}
}
}
)

if(dashPizza){
dashPizza.destroy()
}

dashPizza=new Chart(
document.getElementById('graficoDashboardPizza'),
{
type:'doughnut',
data:{
labels:[
'100% Cumpridos',
'Em Andamento',
'Não Cumpridos'
],
datasets:[{
data:[
concluidos,
andamento,
pendentes
]
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
position:'bottom'
}
}
}
}
)

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

let labels=Object.keys(mapaItens)

let valores=labels.map(l=>{

let arr=mapaItens[l]

return Math.round(
arr.reduce((a,b)=>a+b,0)/(arr.length||1)
)

})

if(dashBarras){
dashBarras.destroy()
}

dashBarras=new Chart(
document.getElementById('graficoDashboardBarras'),
{
type:'bar',
data:{
labels:labels.map(i=>'Item '+i),
datasets:[{
label:'Percentual Médio',
data:valores,
borderWidth:1
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false}
},
scales:{
y:{
beginAtZero:true,
max:100
}
}
}
}
)

console.log({
media,
totalItens,
totalSubitens,
concluidos,
andamento,
pendentes
})

}
