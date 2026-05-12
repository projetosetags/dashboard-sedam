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
async function login(){
let usuario=document.getElementById('u').value.trim().toLowerCase()
let senha=document.getElementById('p').value.trim()
if(!usuario||!senha){
alert('Informe usuário e senha')
return
}
let perfil=null
let {data:p1}=await client.from('perfistce').select('*').eq('username',usuario).eq('senha',senha).limit(1)
if(p1&&p1.length){
perfil=p1[0]
perfil.origem='TCERO'
}else{
let {data:p2}=await client.from('perfis').select('*').eq('username',usuario).limit(1)
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
document.getElementById('login-screen').classList.add('hidden')
document.getElementById('dashboard').classList.remove('hidden')
document.getElementById('user-info').innerHTML=(perfil.nome_completo||'-')+' • '+(perfil.cargo||'-')+' • '+(perfil.origem||'-')
let tabPerfis=document.getElementById('tab-perfis')
let tabTCERO=document.getElementById('tab-tcero')
if(tabPerfis){
tabPerfis.classList.add('hidden')
}
if(tabTCERO){
tabTCERO.classList.add('hidden')
}
let usernameAtual=(perfil.username||'').toLowerCase()
let adminsTCERO=['manoel','vagner','gleidi']

if(perfil.origem==='SEDAM'){
if(tabPerfis){
tabPerfis.classList.remove('hidden')
tabPerfis.innerHTML='<div>👥</div><div>Perfis Sedam</div>'
}
if(tabTCERO){
tabTCERO.style.display='none'
}
}

if(perfil.origem==='TCERO'&&adminsTCERO.includes(usernameAtual)){
if(tabPerfis){
tabPerfis.classList.remove('hidden')
tabPerfis.innerHTML='<div>👥</div><div>Perfis Sedam</div>'
}
if(tabTCERO){
tabTCERO.classList.remove('hidden')
tabTCERO.style.display='inline-block'
tabTCERO.innerHTML='<div>🛡️</div><div>Perfis TCE-RO</div>'
}
}

if(perfil.origem==='TCERO'&&!adminsTCERO.includes(usernameAtual)){
if(tabPerfis){
tabPerfis.style.display='none'
}
if(tabTCERO){
tabTCERO.style.display='none'
}
}

if(perfil.origem==='SEDAM'&&usernameAtual==='hueriqui'){
if(tabTCERO){
tabTCERO.style.display='none'
}
}
let backupBox=document.getElementById('backup-container')
if(backupBox){
backupBox.innerHTML=''
let adminsBackup=['manoel','vagner','gleidi']
let podeBackup=Number(perfil.nivel_acesso)===1&&adminsBackup.includes(usernameAtual)
if(podeBackup){
let btnBackup=document.createElement('button')
btnBackup.id='btnBackup'
btnBackup.innerText='BACKUP'
btnBackup.className='bg-purple-700 hover:bg-purple-800 text-white font-black px-4 py-2 rounded-xl shadow-lg'
btnBackup.onclick=function(){
if(typeof backupCompleto==='function'){
backupCompleto()
}else if(typeof gerarJSON==='function'){
gerarJSON(allData||[])
}else{
alert('Função de backup não encontrada.')
}
}
backupBox.appendChild(btnBackup)
}
}
switchTab(localStorage.getItem('activeTab')||'resumo')
if(typeof sincronizarResponsaveis==='function'){
await sincronizarResponsaveis()
}
await carregarDados()
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

let query=client
.from('deliberacoes')
.select('*')

if(
userP&&
Number(userP.nivel_acesso)!==1&&
!['manoel','vagner','gleidi'].includes((userP.username||'').toLowerCase())
){
query=query.eq('responsavel_id',userP.id)
}

let {data,error}=await query

if(error){
console.log(error)
allData=[]
return
}

if(!data){
allData=[]
return
}

let listaPerfis=[
...(window.perfis||[]),
...(window.perfisTCERO||[])
]

allData=(data||[]).map(i=>{

let perfil=listaPerfis.find(
p=>String(p.id)===String(i.responsavel_id)
)

if(perfil){
i.responsavel=perfil.nome_completo
}

i.jan=Number(i.jan||0)
i.fev=Number(i.fev||0)
i.mar=Number(i.mar||0)
i.abr=Number(i.abr||0)
i.mai=Number(i.mai||0)

return i

})

window.allData=allData

console.log('TOTAL REGISTROS:',allData.length)

if(typeof renderDashboard==='function'){
renderDashboard()
}

if(typeof renderResumo==='function'){
renderResumo()
}

if(typeof renderGraficos==='function'){
renderGraficos()
}

if(typeof renderMonitoramento==='function'){
renderMonitoramento()
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
let dashArea=null

function renderDashboard(){

if(!window.allData||!allData.length){
console.log('Sem dados dashboard')
return
}

let lista=[...allData]

let filtroItem=document.getElementById('filtroItemDashboard')
let filtroSubitem=document.getElementById('filtroSubitemDashboard')

if(filtroItem&&filtroItem.value){
lista=lista.filter(i=>String(getItemKey(i))===String(filtroItem.value))
}

if(filtroSubitem&&filtroSubitem.value){
lista=lista.filter(i=>String(i.subitem)===String(filtroSubitem.value))
}

let totalSubitens=lista.length

let totalItens=[...new Set(
lista.map(i=>getItemKey(i))
)].length

let media=Math.round(
lista.reduce((acc,c)=>acc+Number(getTotal(c)||0),0)/(lista.length||1)
)

let concluidos=lista.filter(i=>Number(getTotal(i))>=100).length

let andamento=lista.filter(i=>Number(getTotal(i))>0&&Number(getTotal(i))<100).length

let pendentes=lista.filter(i=>Number(getTotal(i))<=0).length

if(document.getElementById('dashMedia')){
document.getElementById('dashMedia').innerText=media+'%'
}

if(document.getElementById('dashItens')){
document.getElementById('dashItens').innerText=totalItens
}

if(document.getElementById('dashSubitens')){
document.getElementById('dashSubitens').innerText=totalSubitens
}

if(document.getElementById('dashConcluidos')){
document.getElementById('dashConcluidos').innerText=concluidos
}

if(document.getElementById('dashAndamento')){
document.getElementById('dashAndamento').innerText=andamento
}

if(document.getElementById('dashPendentes')){
document.getElementById('dashPendentes').innerText=pendentes
}

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

let ctxLinha=document.getElementById('graficoDashboardLinha')

if(ctxLinha){

dashLinha=new Chart(ctxLinha,{
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
legend:{
display:true
}
},
scales:{
y:{
beginAtZero:true,
max:100
}
}
}
})

}

if(dashPizza){
dashPizza.destroy()
}

let ctxPizza=document.getElementById('graficoDashboardPizza')

if(ctxPizza){

dashPizza=new Chart(ctxPizza,{
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
],
borderWidth:0
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
cutout:'62%',
plugins:{
legend:{
position:'right'
}
}
}
})

}

let mapaItens={}

lista.forEach(i=>{
let item=getItemKey(i)

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

let ctxBarra=document.getElementById('graficoDashboardBarras')

if(ctxBarra){

dashBarras=new Chart(ctxBarra,{
type:'bar',
data:{
labels:labels.map(i=>'Item '+i),
datasets:[{
label:'Percentual Médio',
data:valores,
borderWidth:1,
borderRadius:8
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:false
}
},
scales:{
y:{
beginAtZero:true,
max:100
}
}
}
})

}

if(dashArea){
dashArea.destroy()
}

let ctxArea=document.getElementById('graficoDashboardArea')

if(ctxArea){

dashArea=new Chart(ctxArea,{
type:'bar',
data:{
labels:['100%','Andamento','Pendentes'],
datasets:[{
data:[
concluidos,
andamento,
pendentes
],
borderWidth:1,
borderRadius:10
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
display:false
}
},
scales:{
y:{
beginAtZero:true
}
}
}
})

}

console.log('Dashboard renderizado com sucesso')

}
