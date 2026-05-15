/*=========================================================
001 SEPAT CORE CONFIG
=========================================================*/
const SEPAT_SUPABASE_URL=window.S_URL||window.SUPABASE_URL||''
const SEPAT_SUPABASE_KEY=window.S_KEY||window.SUPABASE_ANON_KEY||''
const sepatClient=supabase.createClient(SEPAT_SUPABASE_URL,SEPAT_SUPABASE_KEY)
let sepatUser=null
let sepatData=[]
let sepatFiltrados=[]
let modoResumoSepat='item'
let graficoLinhaSepat=null
let graficoPizzaSepat=null
let graficoBarrasSepat=null
let graficoMasterSepat=null
const MESES_SEPAT=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const MESES_LABEL_SEPAT=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
const NOTA_TECNICA_SEPAT='As informações constantes neste painel, gráficos, indicadores e relatórios possuem caráter preliminar e meramente informativo, sendo baseadas nos dados declarados e apresentados até o presente momento pelos jurisdicionados envolvidos. Ressalta-se que tais informações ainda não passaram pela análise técnica de consistência documental, verificação de evidências, validação metodológica e conferência conclusiva pela equipe técnica de auditores designados.'

/*=========================================================
008 MESES AUTOMATICOS SEPAT
=========================================================*/
function controlarMesesSepat(){

let mesAtual=5

let meses=[
'jan',
'fev',
'mar',
'abr',
'mai',
'jun',
'jul',
'ago',
'set',
'out',
'nov',
'dez'
]

meses.forEach((m,index)=>{

let numero=index+1

document.querySelectorAll('.mes-'+m).forEach(el=>{

if(numero<=mesAtual){

el.classList.remove('hidden')
el.style.display='table-cell'

}else{

el.classList.add('hidden')
el.style.display='none'

}

})

})

}
/*=========================================================
002 SEPAT CORE DOMCONTENTLOADED
=========================================================*/
document.addEventListener('DOMContentLoaded',async()=>{
let salvo=localStorage.getItem('sepatUser')
if(salvo){
try{
sepatUser=JSON.parse(salvo)
document.getElementById('login-sepat').classList.add('hidden')
document.getElementById('app-sepat').classList.remove('hidden')
document.getElementById('sepat-user-info').innerText=(sepatUser.nome_completo||'-')+' • '+(sepatUser.cargo||'-')+' • '+(sepatUser.origem||'SEPAT')
aplicarPermissoesSepat()
await carregarSepatDados()
controlarMesesSepat()
switchSepatTab('dashboard')
return
}catch(e){
console.log(e)
localStorage.removeItem('sepatUser')
}
}
document.getElementById('login-sepat').classList.remove('hidden')
document.getElementById('app-sepat').classList.add('hidden')
})
/*=========================================================
003 SEPAT CORE LOGIN
=========================================================*/
async function loginSepat(){
let usuario=document.getElementById('sepat-user').value.trim().toLowerCase()
let senha=document.getElementById('sepat-pass').value.trim()
if(!usuario||!senha){
alert('Informe usuário e senha')
return
}
let {data,error}=await sepatClient.from('sepat_perfis').select('*').eq('username',usuario).limit(1)
if(error){
console.log(error)
alert('Erro ao consultar perfil')
return
}
if(!data||!data.length){
alert('Usuário não encontrado')
return
}
let perfil=data[0]
if(String(perfil.senha||'')!==String(senha)){
alert('Senha inválida')
return
}
if(perfil.ativo===false){
alert('Usuário inativo')
return
}
sepatUser=perfil
localStorage.setItem('sepatUser',JSON.stringify(perfil))
document.getElementById('login-sepat').classList.add('hidden')
document.getElementById('app-sepat').classList.remove('hidden')
document.getElementById('sepat-user-info').innerText=(perfil.nome_completo||'-')+' • '+(perfil.cargo||'-')+' • '+(perfil.origem||'SEPAT')
aplicarPermissoesSepat()
await carregarSepatDados()
switchSepatTab('dashboard')
}
/*=========================================================
004 SEPAT CORE LOGOUT
=========================================================*/
function logoutSepat(){
localStorage.removeItem('sepatUser')
sepatUser=null
sepatData=[]
sepatFiltrados=[]
document.getElementById('app-sepat').classList.add('hidden')
document.getElementById('login-sepat').classList.remove('hidden')
}
/*=========================================================
005 SEPAT CORE VOLTAR PAINEL GERAL
=========================================================*/
function voltarPainelGeral(){
window.location.href='index.html'
}
/*=========================================================
006 SEPAT CORE PERMISSOES
=========================================================*/
function aplicarPermissoesSepat(){

let tabPerfis=document.getElementById('tab-perfis')

if(!tabPerfis)return

tabPerfis.classList.add('hidden')
tabPerfis.style.display='none'

if(
sepatUser &&
Number(sepatUser.nivel_acesso||0)===1
){
tabPerfis.classList.remove('hidden')
tabPerfis.style.display='flex'
}

}
/*=========================================================
007 SEPAT CORE SWITCHTAB
=========================================================*/
function switchSepatTab(t){
document.querySelectorAll('.view-sepat').forEach(v=>{
v.classList.add('hidden')
})
document.querySelectorAll('.tab-sepat').forEach(b=>{
b.classList.remove('tab-active')
})
let view=document.getElementById('view-'+t)
let tab=document.getElementById('tab-'+t)
if(view)view.classList.remove('hidden')
if(tab)tab.classList.add('tab-active')
if(t==='dashboard')renderDashboardSepat()
if(t==='resumo')renderResumoSepat()
if(t==='monitoramento')renderTabelaSepat()
if(t==='graficos'){
popularItensSepat()
popularSubitensSepat()
renderGraficoMasterSepat()
}
if(t==='concluidos')renderConcluidosSepat()
if(t==='perfis'){
if(!sepatUser||Number(sepatUser.nivel_acesso||0)!==1){
switchSepatTab('dashboard')
return
}
carregarPerfisSepat()
}
}
/*=========================================================
008 SEPAT CORE HELPERS
=========================================================*/
function getTotalSepat(i){
let vals=MESES_SEPAT.map(m=>{
let v=Number(i[m]||0)
return isNaN(v)?0:v
})
let maior=Math.max(...vals,0)
let total=Number(i.total_cumprimento||0)
if(isNaN(total))total=0
return Math.max(maior,total)
}

function compareSepat(a,b){
let ga=grupoOrdemSepat(a.siglaitem)
let gb=grupoOrdemSepat(b.siglaitem)
if(ga!==gb)return ga-gb
let sa=String(a.siglaitem||'')
let sb=String(b.siglaitem||'')
let c=sa.localeCompare(sb,'pt-BR',{numeric:true,sensitivity:'base'})
if(c!==0)return c
let na=Number(a.numsubitem||0)
let nb=Number(b.numsubitem||0)
if(na!==nb)return na-nb
let pa=Number(a.numproduto||0)
let pb=Number(b.numproduto||0)
if(pa!==pb)return pa-pb
return String(a.produto||'').localeCompare(String(b.produto||''),'pt-BR',{numeric:true})
}

function grupoOrdemSepat(sigla){
sigla=String(sigla||'').toUpperCase()
if(sigla.startsWith('PI'))return 1
if(sigla.startsWith('IL'))return 2
if(sigla.startsWith('P')&&!sigla.startsWith('PI'))return 3
if(sigla.startsWith('GR'))return 4
return 9
}
function truncarSepat(txt,n){
txt=String(txt||'-').replace(/\s+/g,' ').trim()
return txt.length>n?txt.substring(0,n)+'...':txt
}
function corClasseSepat(v){
if(v>=100)return'verde'
if(v>0&&v<100)return'amarelo'
return'vermelho'
}
/*=========================================================
009 SEPAT CORE CARREGAR DADOS
=========================================================*/
async function carregarSepatDados(){
let {data,error}=await sepatClient.from('sepat_deliberacoes').select('*').order('siglaitem',{ascending:true})
if(error){
console.log(error)
alert('Erro ao carregar dados da SEPAT')
sepatData=[]
sepatFiltrados=[]
return
}
sepatData=(data||[]).map(i=>({
...i,
siglaitem:String(i.siglaitem||'').trim(),
item:String(i.item||'').trim(),
subitem:String(i.subitem||'').trim(),
produto:String(i.produto||'').trim(),
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
total_cumprimento:Number(i.total_cumprimento||0)
})).sort(compareSepat)
sepatFiltrados=[...sepatData]
renderDashboardSepat()
}
/*=========================================================
010 SEPAT CORE RENDER DASHBOARD
=========================================================*/
function renderDashboardSepat(){
let lista=[...(sepatData||[])].sort(compareSepat)
let totalItens=[...new Set(lista.map(i=>String(i.siglaitem||'').trim()).filter(Boolean))].length
let totalSubitens=lista.length
let totalProdutos=[...new Set(lista.map(i=>String(i.produto||'').trim()).filter(Boolean))].length
let validos=lista.filter(i=>!isNaN(getTotalSepat(i)))
let media=Math.round(validos.reduce((acc,c)=>acc+getTotalSepat(c),0)/(validos.length||1))
let kpiItens=document.getElementById('kpiItensSepat')
let kpiSubitens=document.getElementById('kpiSubitensSepat')
let kpiProdutos=document.getElementById('kpiProdutosSepat')
let kpiMedia=document.getElementById('kpiMediaSepat')
if(kpiItens)kpiItens.innerText=totalItens
if(kpiSubitens)kpiSubitens.innerText=totalSubitens
if(kpiProdutos)kpiProdutos.innerText=totalProdutos
if(kpiMedia)kpiMedia.innerText=media+'%'
renderGraficoLinhaSepat(lista)
renderGraficoPizzaSepat(lista)
renderGraficoBarrasSepat(lista)
}
/*=========================================================
011 SEPAT CORE GRAFICO LINHA
=========================================================*/
function renderGraficoLinhaSepat(lista){
let canvas=document.getElementById('graficoLinhaSepat')
if(!canvas)return
let ctx=canvas.getContext('2d')
if(graficoLinhaSepat)graficoLinhaSepat.destroy()
let valores=MESES_SEPAT.map(m=>{
let soma=0
let qtd=0
lista.forEach(i=>{
let v=Number(i[m]||0)
if(!isNaN(v)){
soma+=v
qtd++
}
})
return Math.round(soma/(qtd||1))
})
graficoLinhaSepat=new Chart(ctx,{
type:'line',
data:{
labels:MESES_LABEL_SEPAT,
datasets:[{
label:'Média Geral SEPAT',
data:valores,
borderWidth:3,
pointRadius:5,
pointHoverRadius:7,
tension:.35,
fill:true
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false},
tooltip:{callbacks:{label:(ctx)=>ctx.raw+'%'}},
datalabels:{
display:true,
anchor:'end',
align:'top',
font:{weight:'900',size:10},
formatter:(v)=>v+'%'
}
},
scales:{
y:{beginAtZero:true,max:100,ticks:{callback:(v)=>v+'%'}},
x:{ticks:{font:{weight:'800',size:10}}}
}
},
plugins:[ChartDataLabels]
})
}
/*=========================================================
012 SEPAT CORE GRAFICO PIZZA
=========================================================*/
function renderGraficoPizzaSepat(lista){
let canvas=document.getElementById('graficoPizzaSepat')
if(!canvas)return
let ctx=canvas.getContext('2d')
if(graficoPizzaSepat)graficoPizzaSepat.destroy()
let concluidos=lista.filter(i=>getTotalSepat(i)>=100).length
let andamento=lista.filter(i=>getTotalSepat(i)>30&&getTotalSepat(i)<100).length
let criticos=lista.filter(i=>getTotalSepat(i)>0&&getTotalSepat(i)<=30).length
let pendentes=lista.filter(i=>getTotalSepat(i)<=0).length
graficoPizzaSepat=new Chart(ctx,{
type:'doughnut',
data:{
labels:['100% Cumpridos','Em andamento','Abaixo de 30%','Pendentes'],
datasets:[{
data:[concluidos,andamento,criticos,pendentes],
borderWidth:2,
borderColor:'#ffffff'
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
cutout:'58%',
plugins:{
legend:{position:'bottom',labels:{font:{weight:'900',size:11},boxWidth:14}},
tooltip:{callbacks:{label:(ctx)=>ctx.label+': '+ctx.raw}},
datalabels:{
display:true,
font:{weight:'900',size:10},
formatter:(v,ctx)=>{
let total=ctx.chart.data.datasets[0].data.reduce((a,b)=>a+b,0)
if(!total)return'0%'
return Math.round((v*100)/total)+'%'
}
}
}
},
plugins:[ChartDataLabels]
})
}
/*=========================================================
013 SEPAT CORE GRAFICO BARRAS
=========================================================*/
function renderGraficoBarrasSepat(lista){
let canvas=document.getElementById('graficoBarrasSepat')
if(!canvas)return
let ctx=canvas.getContext('2d')
if(graficoBarrasSepat)graficoBarrasSepat.destroy()
let mapa={}
lista.forEach(i=>{
let chave=String(i.siglaitem||'SEM ITEM')
if(!mapa[chave]){
mapa[chave]={siglaitem:chave,item:i.item||'',total:0,qtd:0,base:i}
}
mapa[chave].total+=getTotalSepat(i)
mapa[chave].qtd++
})
let itens=Object.values(mapa).sort((a,b)=>compareSepat(a.base,b.base))
let labels=itens.map(i=>i.siglaitem)
let valores=itens.map(i=>Math.round(i.total/(i.qtd||1)))
graficoBarrasSepat=new Chart(ctx,{
type:'bar',
data:{
labels:labels,
datasets:[{
label:'Média por Item',
data:valores,
borderRadius:8,
borderSkipped:false,
maxBarThickness:24
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:false},
tooltip:{callbacks:{label:(ctx)=>ctx.raw+'%'}},
datalabels:{
display:true,
anchor:'end',
align:'top',
font:{weight:'900',size:8},
formatter:(v)=>v+'%'
}
},
scales:{
y:{beginAtZero:true,max:100,ticks:{callback:(v)=>v+'%'}},
x:{ticks:{font:{weight:'900',size:8},maxRotation:60,minRotation:45}}
}
},
plugins:[ChartDataLabels]
})
}
/*=========================================================
014 SEPAT CORE RENDER RESUMO
=========================================================*/
function renderResumoSepat(){
let box=document.getElementById('cardsResumoSepat')
if(!box)return
let lista=[...(sepatData||[])].sort(compareSepat)
let mapa={}
lista.forEach(i=>{
let chave=modoResumoSepat==='item'?String(i.siglaitem||''):String(i.subitem||'')
if(!chave)return
if(!mapa[chave]){
mapa[chave]=[]
}
mapa[chave].push(i)
})
let grupos=Object.keys(mapa).map(k=>{
let arr=mapa[k]||[]
let base=arr[0]||{}
let media=Math.round(arr.reduce((acc,c)=>acc+getTotalSepat(c),0)/(arr.length||1))
return{
chave:k,
base:base,
lista:arr,
media:media
}
}).sort((a,b)=>compareSepat(a.base,b.base))
box.innerHTML=grupos.map(g=>{
let titulo=modoResumoSepat==='item'?g.base.siglaitem:g.base.subitem
let subtitulo=modoResumoSepat==='item'?g.base.item:g.base.produto
let desc=modoResumoSepat==='item'?g.base.item:g.base.descricaoitem
return`
<div class="card-resumo-sepat ${corClasseSepat(g.media)}" onclick="abrirModalResumoSepat('${g.chave}')">
<div>
<div class="card-resumo-head">${modoResumoSepat==='item'?'ITEM':'SUBITEM'} ${titulo||'-'}</div>
<div class="card-resumo-desc">${truncarSepat(subtitulo||desc||'-',150)}</div>
</div>
<div class="card-resumo-total">${g.media}%</div>
</div>
`
}).join('')
}
/*=========================================================
015 SEPAT CORE ABRIR MODAL RESUMO
=========================================================*/
function abrirModalResumoSepat(chave){
let modal=document.getElementById('modalSepat')
let conteudo=document.getElementById('modalConteudoSepat')
if(!modal||!conteudo)return
let lista=[...(sepatData||[])].filter(i=>{
if(modoResumoSepat==='item'){
return String(i.siglaitem||'')===String(chave)
}
return String(i.subitem||'')===String(chave)
}).sort(compareSepat)
if(!lista.length){
alert('Nenhum dado encontrado')
return
}
let base=lista[0]
let media=Math.round(lista.reduce((acc,c)=>acc+getTotalSepat(c),0)/(lista.length||1))
conteudo.innerHTML=`
<div class="modal-title-sepat">${modoResumoSepat==='item'?'ITEM':'SUBITEM'} ${modoResumoSepat==='item'?base.siglaitem:base.subitem} • ${media}%</div>
<div class="modal-text-sepat"><b>Item:</b> ${base.item||'-'}</div>
<div class="modal-text-sepat"><b>Descrição:</b> ${base.descricaoitem||'-'}</div>
<div class="modal-text-sepat"><b>Total de registros:</b> ${lista.length}</div>
${lista.map(i=>`
<div style="margin-top:14px;border-top:1px solid #e5e7eb;padding-top:12px;">
<div class="modal-text-sepat"><b>Subitem:</b> ${i.subitem||'-'}</div>
<div class="modal-text-sepat"><b>Produto:</b> ${i.produto||'-'}</div>
<div class="modal-text-sepat"><b>Responsável:</b> ${i.cargo||'-'}</div>
<div class="modal-grid-sepat">
${MESES_SEPAT.slice(0,5).map(m=>`
<div class="modal-mes-sepat">
<div>${m.toUpperCase()}</div>
<div>${Number(i[m]||0)}%</div>
</div>
`).join('')}
</div>
</div>
`).join('')}
`
modal.classList.remove('hidden')
}
/*=========================================================
016 SEPAT CORE FECHAR MODAL
=========================================================*/
function fecharModalSepat(){
let modal=document.getElementById('modalSepat')
if(modal)modal.classList.add('hidden')
}
/*=========================================================
017 SEPAT CORE RENDER TABELA MONITORAMENTO
=========================================================*/
function renderTabelaSepat(){

let tbody=document.getElementById('tbodySepat')

if(!tbody)return

let busca=String(
document.getElementById('buscaMonitoramentoSepat')?.value||''
)
.toLowerCase()
.trim()

let lista=[...(sepatData||[])].sort(compareSepat)

if(busca){

lista=lista.filter(i=>{

return[
i.siglaitem,
i.subitem,
i.item,
i.produto,
i.cargo
]
.join(' ')
.toLowerCase()
.includes(busca)

})

}

const mesAtual='mai'

tbody.innerHTML=lista.map(i=>{

let total=getTotalSepat(i)

let html=`
<tr>

<td class="col-subitem">
${i.siglaitem||'-'}
</td>

<td>
${i.subitem||'-'}
</td>

<td>
${i.produto||'-'}
</td>

<td>
${i.cargo||'-'}
</td>
`

MESES_SEPAT.forEach(mes=>{
let nivel=Number(sepatUser?.nivel_acesso||99)
let valorAtual=Number(i[mes]||0)
let podeEditar=false

/*=========================================================
NIVEL 1
EDITA SEMPRE
=========================================================*/
if(nivel===1){
podeEditar=true
}
/*=========================================================
NIVEL 2
SOMENTE MES VIGENTE
E APENAS PRIMEIRO PREENCHIMENTO
=========================================================*/
if(
nivel===2 &&
mes===mesAtual &&
valorAtual===0
){
podeEditar=true
}

let clsMes=
mes===mesAtual
?'mes-atual-sepat'
:''

let ocultar=(
mes==='jun'||
mes==='jul'||
mes==='ago'||
mes==='set'||
mes==='out'||
mes==='nov'||
mes==='dez'
)

html+=`
<td class="${clsMes} ${ocultar?'hidden mes-col mes-'+mes:''}">
<input
type="number"
min="0"
max="100"
step="1"
value="${Number(i[mes]||0)}"
${podeEditar?'':'disabled'}
class="input-mes-sepat"
onchange="salvarPercentualSepat('${i.id}','${mes}',this.value)"
>
</td>
`

})

html+=`
<td class="td-total-sepat">
${total}%
</td>
</tr>
`

return html

}).join('')

}
/*=========================================================
018 SEPAT CORE SALVAR PERCENTUAL
=========================================================*/
async function salvarPercentualSepat(id,mes,valor){

valor=Number(valor||0)

if(isNaN(valor))valor=0

if(valor<0)valor=0
if(valor>100)valor=100

let update={}
update[mes]=valor

let {error}=await sepatClient
.from('sepat_deliberacoes')
.update(update)
.eq('id',id)

if(error){
console.log(error)
alert('Erro ao salvar percentual')
return
}

let item=sepatData.find(i=>String(i.id)===String(id))

if(item){
item[mes]=valor
item.total_cumprimento=getTotalSepat(item)
}
renderDashboardSepat()
controlarMesesSepat()
}

/*=========================================================
019 SEPAT CORE RENDER CONCLUIDOS
=========================================================*/
function renderConcluidosSepat(){
let box=document.getElementById('cardsConcluidosSepat')
if(!box)return
let lista=[...(sepatData||[])].filter(i=>getTotalSepat(i)>=100).sort(compareSepat)
if(!lista.length){
box.innerHTML=`
<div class="card-resumo-sepat cinza">
<div>
<div class="card-resumo-head">100% CUMPRIDOS</div>
<div class="card-resumo-desc">Nenhum subitem/produto está com 100% de execução até o momento.</div>
</div>
<div class="card-resumo-total">0</div>
</div>
`
return
}
box.innerHTML=lista.map(i=>`
<div class="card-resumo-sepat verde" onclick="abrirModalResumoSepat('${i.subitem}')">
<div>
<div class="card-resumo-head">SUBITEM ${i.subitem||'-'}</div>
<div class="card-resumo-desc">${truncarSepat(i.produto||'-',150)}</div>
</div>
<div class="card-resumo-total">100%</div>
</div>
`).join('')
}
/*=========================================================
020 SEPAT CORE POPULAR ITENS GRAFICOS
=========================================================*/
function popularItensSepat(){
let sel=document.getElementById('filtroItemSepat')
if(!sel)return
let mapa={}
;(sepatData||[]).forEach(i=>{
let chave=String(i.siglaitem||'').trim()
if(!chave)return
if(!mapa[chave]){
mapa[chave]={siglaitem:chave,item:i.item||'',base:i}
}
})
let lista=Object.values(mapa).sort((a,b)=>compareSepat(a.base,b.base))
sel.innerHTML='<option value="todos">TODOS OS ITENS</option>'+lista.map(i=>`<option value="${i.siglaitem}">${i.siglaitem} - ${truncarSepat(i.item,90)}</option>`).join('')
}
/*=========================================================
021 SEPAT CORE POPULAR SUBITENS GRAFICOS
=========================================================*/
function popularSubitensSepat(){
let sel=document.getElementById('filtroSubitemSepat')
let item=document.getElementById('filtroItemSepat')
if(!sel||!item)return
let itemSelecionado=String(item.value||'todos')
let lista=[...(sepatData||[])]
if(itemSelecionado!=='todos'){
lista=lista.filter(i=>String(i.siglaitem||'')===itemSelecionado)
}
lista=lista.sort(compareSepat)
let html=`<option value="TOTAL">TODOS OS SUBITENS (${lista.length})</option>`
html+=lista.map(i=>{
let id=i.id||i.subitem
return `<option value="${id}" title="${i.subitem} • ${getTotalSepat(i)}% • ${i.produto||'-'}">${i.subitem} • ${getTotalSepat(i)}% • ${truncarSepat(i.produto||'-',80)}</option>`
}).join('')
sel.innerHTML=html
}
/*=========================================================
022 SEPAT CORE RENDER GRAFICO MASTER
=========================================================*/
function renderGraficoMasterSepat(){
let canvas=document.getElementById('graficoMasterSepat')
if(!canvas)return
let ctx=canvas.getContext('2d')
if(graficoMasterSepat)graficoMasterSepat.destroy()
let itemSelecionado=String(document.getElementById('filtroItemSepat')?.value||'todos')
let subSelecionado=String(document.getElementById('filtroSubitemSepat')?.value||'TOTAL')
let lista=[...(sepatData||[])]
if(itemSelecionado!=='todos'){
lista=lista.filter(i=>String(i.siglaitem||'')===itemSelecionado)
}
let titulo='TOTAL CONSOLIDADO SEPAT'
let desc='Evolução média consolidada dos subitens/produtos selecionados.'
if(subSelecionado!=='TOTAL'){
let achado=lista.find(i=>String(i.id)===subSelecionado||String(i.subitem)===subSelecionado)
if(achado){
lista=[achado]
titulo='SUBITEM '+(achado.subitem||'-')+' • '+(achado.siglaitem||'-')
desc=(achado.produto||'-')+'<br><br><b>Item:</b> '+(achado.item||'-')
}
}
let valores=MESES_SEPAT.map((m,idx)=>{
let total=0
lista.forEach(i=>{
let valor=0
valor=Number(i[m]||0)
if(isNaN(valor))valor=0
total+=valor
})
return Math.round(total/(lista.length||1))
})
graficoMasterSepat=new Chart(ctx,{
type:'bar',
data:{
labels:MESES_LABEL_SEPAT,
datasets:[{
label:titulo,
data:valores,
borderWidth:2,
borderRadius:10,
borderSkipped:false,
maxBarThickness:42
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{display:true,position:'bottom',labels:{font:{weight:'900',size:12}}},
tooltip:{callbacks:{label:(ctx)=>ctx.raw+'%'}},
datalabels:{display:true,anchor:'end',align:'top',font:{weight:'900',size:11},formatter:(v)=>v+'%'}
},
scales:{
y:{beginAtZero:true,max:100,ticks:{callback:(v)=>v+'%'}},
x:{ticks:{font:{weight:'900',size:11}}}
}
},
plugins:[ChartDataLabels]
})
let box=document.getElementById('descGraficoSepat')
if(box){
box.innerHTML=`<b>${titulo}</b><br>${desc}<br><br>JAN: <b>${valores[0]}%</b> | FEV: <b>${valores[1]}%</b> | MAR: <b>${valores[2]}%</b> | ABR: <b>${valores[3]}%</b> | MAI: <b>${valores[4]}%</b>`
}
}
/*=========================================================
023 SEPAT CORE CARREGAR PERFIS
=========================================================*/
async function carregarPerfisSepat(){
let box=document.getElementById('listaPerfisSepat')
if(!box)return
if(!sepatUser||Number(sepatUser.nivel_acesso||0)!==1){
box.innerHTML='Sem permissão.'
return
}
let {data,error}=await sepatClient.from('sepat_perfis').select('*').order('nome_completo',{ascending:true})
if(error){
console.log(error)
box.innerHTML='Erro ao carregar perfis.'
return
}
let lista=data||[]
box.innerHTML=`
<div class="perfil-row-sepat" style="font-weight:1000;background:#e0f2fe;border-radius:14px;">
<div>Nome</div><div>Usuário</div><div>Cargo</div><div>Nível</div>
</div>
${lista.map(p=>`
<div class="perfil-row-sepat">
<div>${p.nome_completo||'-'}</div>
<div>${p.username||'-'}</div>
<div>${p.cargo||'-'}</div>
<div>${p.nivel_acesso||'-'}</div>
</div>
`).join('')}
`
}
/*=========================================================
024 SEPAT PDF HELPERS
=========================================================*/
function criarDocSepat(orientacao='p'){
const {jsPDF}=window.jspdf
return new jsPDF(orientacao,'mm','a4')
}
function rodapeSepat(doc){
let total=doc.internal.getNumberOfPages()
for(let i=1;i<=total;i++){
doc.setPage(i)
let h=doc.internal.pageSize.height
let w=doc.internal.pageSize.width
doc.setFontSize(7)
doc.setTextColor(80,80,80)
doc.text('Tribunal de Contas do Estado de Rondônia - TAG SEPAT 2026',8,h-20)
doc.setFontSize(5)
doc.text(NOTA_TECNICA_SEPAT,8,h-15,{maxWidth:w-35,align:'justify'})
doc.setFontSize(7)
doc.text('Página '+i+' de '+total,w-8,h-6,{align:'right'})
}
}
/*=========================================================
025 SEPAT PDF RESUMO
=========================================================*/
function gerarPDFResumoSepat(){
let doc=criarDocSepat('p')
let lista=[...(sepatData||[])].sort(compareSepat)
let mapa={}
lista.forEach(i=>{
let chave=String(i.siglaitem||'')
if(!mapa[chave])mapa[chave]=[]
mapa[chave].push(i)
})
let rows=[]
Object.keys(mapa).forEach(k=>{
let arr=mapa[k]
let base=arr[0]
let media=Math.round(arr.reduce((acc,c)=>acc+getTotalSepat(c),0)/(arr.length||1))
rows.push(['ITEM '+base.siglaitem,base.item||'-','',media+'%'])
arr.sort(compareSepat).forEach(i=>{
rows.push([i.siglaitem||'-',i.subitem||'-',i.produto||'-',getTotalSepat(i)+'%'])
})
})
doc.setFontSize(14)
doc.setTextColor(0,0,0)
doc.text('RESUMO EXECUTIVO - TAG SEPAT 2026',10,12)
doc.autoTable({
startY:22,
head:[['ITEM/SUBITEM','DESCRIÇÃO','PRODUTO','%']],
body:rows,
styles:{fontSize:6,overflow:'linebreak',cellPadding:1.5},
headStyles:{fillColor:[7,89,201],textColor:[255,255,255]},
columnStyles:{0:{cellWidth:28},1:{cellWidth:76},2:{cellWidth:72},3:{cellWidth:14,halign:'center'}},
margin:{top:18,bottom:28,left:5,right:5},
didParseCell:function(data){
let txt=String(data.cell.raw||'')
if(txt.startsWith('ITEM ')){
data.cell.styles.fillColor=[3,105,161]
data.cell.styles.textColor=[255,255,255]
data.cell.styles.fontStyle='bold'
}
}
})
rodapeSepat(doc)
doc.save('pdf_resumo_tag_sepat.pdf')
}
/*=========================================================
026 SEPAT PDF MONITORAMENTO
=========================================================*/
function gerarPDFMonitoramentoSepat(){
let doc=criarDocSepat('l')
let lista=[...(sepatData||[])].sort(compareSepat)
let rows=lista.map(i=>[
String(i.siglaitem||'-'),
String(i.subitem||'-'),
String(i.produto||'-'),
String(i.cargo||'-'),
Number(i.jan||0)+'%',
Number(i.fev||0)+'%',
Number(i.mar||0)+'%',
Number(i.abr||0)+'%',
Number(i.mai||0)+'%',
Number(i.jun||0)+'%',
Number(i.jul||0)+'%',
Number(i.ago||0)+'%',
Number(i.set||0)+'%',
Number(i.out||0)+'%',
Number(i.nov||0)+'%',
Number(i.dez||0)+'%',
getTotalSepat(i)+'%'
])
doc.setFontSize(15)
doc.setTextColor(15,23,42)
doc.text('MONITORAMENTO COMPLETO - TAG SEPAT 2026',14,14)
doc.setFontSize(8)
doc.setTextColor(100)
doc.text('Painel consolidado de monitoramento técnico da SEPAT.',14,19)
doc.autoTable({
startY:24,
head:[['ITEM','SUBITEM / DESCRIÇÃO','PRODUTO','RESPONSÁVEL','JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ','TOTAL']],
body:rows,
theme:'grid',
styles:{
fontSize:6.5,
overflow:'linebreak',
cellPadding:1.6,
valign:'middle',
textColor:[15,23,42],
lineColor:[210,215,220],
lineWidth:.2
},
headStyles:{
fillColor:[7,89,201],
textColor:[255,255,255],
fontStyle:'bold',
fontSize:7,
halign:'center',
valign:'middle'
},
alternateRowStyles:{
fillColor:[248,250,252]
},
columnStyles:{
0:{cellWidth:16,halign:'center'},
1:{cellWidth:78},
2:{cellWidth:52},
3:{cellWidth:34},
4:{cellWidth:10,halign:'center'},
5:{cellWidth:10,halign:'center'},
6:{cellWidth:10,halign:'center'},
7:{cellWidth:10,halign:'center'},
8:{cellWidth:10,halign:'center'},
9:{cellWidth:10,halign:'center'},
10:{cellWidth:10,halign:'center'},
11:{cellWidth:10,halign:'center'},
12:{cellWidth:10,halign:'center'},
13:{cellWidth:10,halign:'center'},
14:{cellWidth:10,halign:'center'},
15:{cellWidth:10,halign:'center'},
16:{cellWidth:14,halign:'center'}
},
margin:{
top:20,
bottom:26,
left:6,
right:6
},
didParseCell:function(data){
if(data.section==='body'&&data.column.index===16){
data.cell.styles.fontStyle='bold'
data.cell.styles.textColor=[4,120,87]
}
}
})
let finalY=doc.lastAutoTable.finalY||260
doc.setFontSize(7)
doc.setTextColor(110)
doc.text('As informações constantes neste painel possuem caráter preliminar e dependem de validação técnica documental.',14,finalY+8)
rodapeSepat(doc)
doc.save('pdf_monitoramento_tag_sepat.pdf')
}
/*=========================================================
027 SEPAT PDF GRAFICOS
=========================================================*/
function gerarPDFGraficosSepat(){
let doc=criarDocSepat('p')
let canvas=document.getElementById('graficoMasterSepat')
if(!canvas){
alert('Gráfico não encontrado')
return
}
let img=canvas.toDataURL('image/png',1.0)
doc.setFontSize(14)
doc.text('ANÁLISE GRÁFICA - TAG SEPAT 2026',10,12)
doc.addImage(img,'PNG',10,28,190,95)
let desc=document.getElementById('descGraficoSepat')?.innerText||'Análise gráfica do TAG SEPAT 2026.'
doc.setFontSize(9)
doc.text(desc,10,132,{maxWidth:190})
rodapeSepat(doc)
doc.save('pdf_graficos_tag_sepat.pdf')
}
/*=========================================================
028 SEPAT PDF CONCLUIDOS
=========================================================*/
function gerarPDFConcluidosSepat(){
let doc=criarDocSepat('l')
let lista=[...(sepatData||[])].filter(i=>getTotalSepat(i)>=100).sort(compareSepat)
let rows=lista.map(i=>[i.siglaitem||'-',i.subitem||'-',i.produto||'-',i.cargo||'-',getTotalSepat(i)+'%'])
doc.setFontSize(14)
doc.text('SUBITENS 100% CUMPRIDOS - TAG SEPAT 2026',10,12)
doc.setFontSize(10)
doc.text('TOTAL: '+lista.length,10,18)
doc.autoTable({
startY:24,
head:[['Item','Subitem','Produto','Responsável','%']],
body:rows,
theme:'striped',
styles:{fontSize:6,overflow:'linebreak',cellPadding:1.5},
headStyles:{fillColor:[4,120,87],textColor:[255,255,255]},
columnStyles:{0:{cellWidth:22},1:{cellWidth:22},2:{cellWidth:130},3:{cellWidth:70},4:{cellWidth:18,halign:'center'}},
margin:{top:18,bottom:28,left:5,right:5}
})
rodapeSepat(doc)
doc.save('pdf_100_tag_sepat.pdf')
}
