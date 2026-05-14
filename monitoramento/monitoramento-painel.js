let graficoStatus=null
let graficoEvolucao=null
let graficoCriticidade=null
let graficoBeneficios=null

async function carregarDashboard(){

try{

let{count:total}=await client.from('monitoramento_itens').select('*',{count:'exact',head:true})

let{count:executadas}=await client.from('monitoramento_itens').select('*',{count:'exact',head:true}).eq('status','EXECUTADA')

let{count:parciais}=await client.from('monitoramento_itens').select('*',{count:'exact',head:true}).eq('status','PARCIALMENTE EXECUTADA')

let{count:naoExecutadas}=await client.from('monitoramento_itens').select('*',{count:'exact',head:true}).eq('status','NÃO EXECUTADA')

let{count:andamento}=await client.from('monitoramento_itens').select('*',{count:'exact',head:true}).eq('status','EM ANDAMENTO')

document.getElementById('kpiTotal').innerHTML=total||0
document.getElementById('kpiExecutadas').innerHTML=executadas||0
document.getElementById('kpiParciais').innerHTML=parciais||0
document.getElementById('kpiNaoExecutadas').innerHTML=naoExecutadas||0
document.getElementById('kpiAndamento').innerHTML=andamento||0

await carregarGraficoStatus(
executadas||0,
parciais||0,
naoExecutadas||0,
andamento||0
)

await carregarGraficoEvolucao()
await carregarGraficoCriticidade()
await carregarGraficoBeneficios()
}catch(e){

console.log(e)

}

}

async function carregarGraficoStatus(executadas,parciais,naoExecutadas,andamento){

let ctx=document.getElementById('graficoStatus')

if(!ctx)return

if(graficoStatus){
graficoStatus.destroy()
}

graficoStatus=new Chart(ctx,{
type:'doughnut',
data:{
labels:[
'Executadas',
'Parciais',
'Não Executadas',
'Em Andamento'
],
datasets:[{
data:[
executadas,
parciais,
naoExecutadas,
andamento
],
backgroundColor:[
'#10b981',
'#f59e0b',
'#ef4444',
'#3b82f6'
],
borderWidth:0
}]
},
options:{
responsive:true,
plugins:{
legend:{
labels:{
color:'#fff'
}
},
datalabels:{
color:'#fff',
font:{
weight:'bold'
},
formatter:(v)=>v
}
}
},
plugins:[ChartDataLabels]
})

}

async function carregarGraficoEvolucao(){

let ctx=document.getElementById('graficoEvolucao')

if(!ctx)return

let{data,error}=await client
.from('monitoramento_itens')
.select('created_at,status')

if(error){
console.log(error)
return
}

let mapa={}

;(data||[]).forEach(i=>{

let d=new Date(i.created_at)

let chave=
String(d.getMonth()+1).padStart(2,'0')+
'/'+
d.getFullYear()

if(!mapa[chave]){
mapa[chave]=0
}

mapa[chave]++

})

let labels=Object.keys(mapa)
let valores=Object.values(mapa)

if(graficoEvolucao){
graficoEvolucao.destroy()
}

graficoEvolucao=new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
label:'Evolução de Monitoramentos',
data:valores,
borderColor:'#3b82f6',
backgroundColor:'rgba(59,130,246,.2)',
fill:true,
tension:.3
}]
},
options:{
responsive:true,
plugins:{
legend:{
labels:{
color:'#fff'
}
},
datalabels:{
color:'#fff',
anchor:'end',
align:'top'
}
},
scales:{
x:{
ticks:{
color:'#fff'
},
grid:{
color:'rgba(255,255,255,.05)'
}
},
y:{
ticks:{
color:'#fff'
},
grid:{
color:'rgba(255,255,255,.05)'
}
}
}
},
plugins:[ChartDataLabels]
})

}

async function carregarListaMonitoramentos(){

let{data,error}=await client
.from('monitoramentos')
.select('*')
.order('id',{ascending:false})

if(error){
console.log(error)
return
}

let html=''

;(data||[]).forEach(m=>{

html+=`
<div class="card-monitoramento">
<div class="card-monitoramento-topo">
<div>
<div class="monitoramento-titulo">${m.titulo||'-'}</div>
<div class="monitoramento-subtitulo">${m.orgao||'-'} • ${m.acordao||'-'}</div>
</div>
<div class="badge-status ${getClasseStatus(m.status)}">${m.status||'-'}</div>
</div>
<div class="monitoramento-info-grid">
<div><b>Processo:</b> ${m.processo||'-'}</div>
<div><b>Relator:</b> ${m.relator||'-'}</div>
<div><b>Auditor:</b> ${m.auditor_responsavel||'-'}</div>
<div><b>Criticidade:</b> ${m.criticidade||'-'}</div>
</div>
<div class="monitoramento-actions">
<button class="btn-padrao" onclick="abrirMonitoramento(${m.id})">Abrir</button>
<button class="btn-padrao azul" onclick="editarMonitoramento(${m.id})">Editar</button>
<button class="btn-padrao vermelho" onclick="excluirMonitoramento(${m.id})">Excluir</button>
</div>
</div>
`

})

document.getElementById('listaMonitoramentos').innerHTML=html

}

function getClasseStatus(s){

if(s==='EXECUTADA')return'verde'
if(s==='PARCIALMENTE EXECUTADA')return'amarelo'
if(s==='NÃO EXECUTADA')return'vermelho'
if(s==='EM ANDAMENTO')return'azul'

return''

}

async function novoMonitoramento(){

let titulo=prompt('Título do monitoramento')

if(!titulo)return

let orgao=prompt('Órgão')

let processo=prompt('Processo')

let acordao=prompt('Acórdão')

let relator=prompt('Relator')

let auditor=prompt('Auditor Responsável')

let criticidade=prompt('Criticidade')

let status='EM ANDAMENTO'

let{error}=await client
.from('monitoramentos')
.insert([{
titulo:titulo,
orgao:orgao,
processo:processo,
acordao:acordao,
relator:relator,
auditor_responsavel:auditor,
criticidade:criticidade,
status:status
}])

if(error){
alert('Erro ao criar')
console.log(error)
return
}

await carregarListaMonitoramentos()
await carregarDashboard()

}

async function abrirMonitoramento(id){

MONITORAMENTO_ATUAL=id

abrirTela('matriz')

await carregarItensMatriz()

}

async function excluirMonitoramento(id){

if(!confirm('Excluir monitoramento?'))return

let{error}=await client
.from('monitoramentos')
.delete()
.eq('id',id)

if(error){
console.log(error)
return
}

await carregarListaMonitoramentos()
await carregarDashboard()

}

async function editarMonitoramento(id){

let{data,error}=await client
.from('monitoramentos')
.select('*')
.eq('id',id)
.single()

if(error||!data)return

let titulo=prompt('Título',data.titulo||'')

if(titulo===null)return

let status=prompt('Status',data.status||'')

let criticidade=prompt('Criticidade',data.criticidade||'')

let{error:updateError}=await client
.from('monitoramentos')
.update({
titulo:titulo,
status:status,
criticidade:criticidade
})
.eq('id',id)

if(updateError){
console.log(updateError)
return
}

await carregarListaMonitoramentos()
await carregarDashboard()

}

document.addEventListener('DOMContentLoaded',async()=>{

await carregarListaMonitoramentos()
await atualizarSemaforosAutomaticos()
})

async function filtrarMonitoramentos(){

let busca=document
.getElementById('buscaMonitoramento')
.value
.toLowerCase()

let status=document
.getElementById('filtroStatus')
.value

let criticidade=document
.getElementById('filtroCriticidade')
.value

let query=client
.from('monitoramentos')
.select('*')
.order('id',{ascending:false})

if(status){
query=query.eq('status',status)
}

if(criticidade){
query=query.eq('criticidade',criticidade)
}

let{data,error}=await query

if(error){
console.log(error)
return
}

if(busca){

data=(data||[]).filter(m=>

(m.titulo||'')
.toLowerCase()
.includes(busca)

||

(m.orgao||'')
.toLowerCase()
.includes(busca)

||

(m.processo||'')
.toLowerCase()
.includes(busca)

)

}

renderizarMonitoramentos(data||[])

}

function renderizarMonitoramentos(data){

let html=''

;(data||[]).forEach(m=>{

let percentual=0

if(m.percentual){
percentual=Number(m.percentual)
}

html+=`
<div class="card-monitoramento">

<div class="card-monitoramento-topo">

<div>
<div class="monitoramento-titulo">
${m.titulo||'-'}
</div>

<div class="monitoramento-subtitulo">
${m.orgao||'-'} • ${m.processo||'-'}
</div>
</div>

<div class="badge-status ${getClasseStatus(m.status)}">
${m.status||'-'}
</div>

</div>

<div class="monitoramento-info-grid">

<div>
<b>Acórdão:</b>
${m.acordao||'-'}
</div>

<div>
<b>Relator:</b>
${m.relator||'-'}
</div>

<div>
<b>Auditor:</b>
${m.auditor_responsavel||'-'}
</div>

<div>
<b>Criticidade:</b>
${m.criticidade||'-'}
</div>

</div>

<div class="progress-monitoramento">
<div class="progress-monitoramento-bar" style="width:${percentual}%"></div>
</div>

<div class="monitoramento-actions">

<button class="btn-padrao" onclick="abrirMonitoramento(${m.id})">
Abrir
</button>

<button class="btn-padrao azul" onclick="editarMonitoramento(${m.id})">
Editar
</button>

<button class="btn-padrao vermelho" onclick="excluirMonitoramento(${m.id})">
Excluir
</button>

</div>

</div>
`

})

document.getElementById('listaMonitoramentos').innerHTML=html

}

async function carregarTimeline(){

let{data,error}=await client
.from('monitoramento_logs')
.select('*')
.order('id',{ascending:false})
.limit(20)

if(error){
console.log(error)
return
}

let html=`
<div class="timeline-box">
<div class="monitoramento-titulo">
📌 Últimas Movimentações
</div>
`

;(data||[]).forEach(l=>{

html+=`
<div class="timeline-item">

<div class="timeline-dot"></div>

<div class="timeline-content">

<div class="timeline-title">
${l.acao||'-'}
</div>

<div class="timeline-date">
${formatarDataHora(l.created_at)}
</div>

<div class="timeline-text">
Usuário: ${l.usuario||'-'}
</div>

</div>

</div>
`

})

html+=`</div>`

document
.getElementById('tela-dashboard')
.insertAdjacentHTML(
'beforeend',
html
)

}

async function carregarRanking(){

let{data,error}=await client
.from('monitoramentos')
.select('*')

if(error){
console.log(error)
return
}

let mapa={}

;(data||[]).forEach(m=>{

let auditor=m.auditor_responsavel||'NÃO INFORMADO'

if(!mapa[auditor]){
mapa[auditor]=0
}

mapa[auditor]++

})

let ranking=Object.entries(mapa)
.sort((a,b)=>b[1]-a[1])

let html=`
<div class="ranking-box">
<div class="monitoramento-titulo">
🏆 Ranking de Monitoramentos
</div>
`

ranking.forEach(r=>{

html+=`
<div class="ranking-item">

<div class="ranking-left">

<div class="ranking-title">
${r[0]}
</div>

<div class="ranking-subtitle">
Monitoramentos vinculados
</div>

</div>

<div class="ranking-value">
${r[1]}
</div>

</div>
`

})

html+=`</div>`

document
.getElementById('tela-dashboard')
.insertAdjacentHTML(
'beforeend',
html
)

}

function formatarDataHora(d){

if(!d)return'-'

let dt=new Date(d)

return dt.toLocaleDateString('pt-BR')+
' '+
dt.toLocaleTimeString('pt-BR')

}

document.addEventListener('DOMContentLoaded',async()=>{

await carregarTimeline()
await carregarRanking()
await carregarAlertasTecnicos()
})

async function carregarGraficoCriticidade(){

let{data,error}=await client
.from('monitoramento_itens')
.select('criticidade')

if(error){
console.log(error)
return
}

let alta=
(data||[])
.filter(i=>i.criticidade==='ALTA')
.length

let media=
(data||[])
.filter(i=>i.criticidade==='MÉDIA')
.length

let baixa=
(data||[])
.filter(i=>i.criticidade==='BAIXA')
.length

let ctx=document.getElementById('graficoCriticidade')

if(!ctx)return

if(graficoCriticidade){
graficoCriticidade.destroy()
}

graficoCriticidade=new Chart(ctx,{
type:'bar',
data:{
labels:[
'Alta',
'Média',
'Baixa'
],
datasets:[{
label:'Criticidade',
data:[
alta,
media,
baixa
],
backgroundColor:[
'#ef4444',
'#f59e0b',
'#10b981'
],
borderRadius:8
}]
},
options:{
responsive:true,
plugins:{
legend:{
labels:{
color:'#fff'
}
},
datalabels:{
color:'#fff',
anchor:'end',
align:'top'
}
},
scales:{
x:{
ticks:{
color:'#fff'
},
grid:{
color:'rgba(255,255,255,.05)'
}
},
y:{
ticks:{
color:'#fff'
},
grid:{
color:'rgba(255,255,255,.05)'
}
}
}
},
plugins:[ChartDataLabels]
})

}

async function carregarGraficoBeneficios(){

let{data,error}=await client
.from('monitoramento_itens')
.select('beneficio_esperado')

if(error){
console.log(error)
return
}

let financeiro=0
let operacional=0
let social=0
let governanca=0

;(data||[]).forEach(i=>{

let b=(i.beneficio_esperado||'').toUpperCase()

if(b.includes('FINANCE')){
financeiro++
}

if(b.includes('OPERACION')){
operacional++
}

if(b.includes('SOCIAL')){
social++
}

if(b.includes('GOVERN')){
governanca++
}

})

let ctx=document.getElementById('graficoBeneficios')

if(!ctx)return

if(graficoBeneficios){
graficoBeneficios.destroy()
}

graficoBeneficios=new Chart(ctx,{
type:'polarArea',
data:{
labels:[
'Financeiro',
'Operacional',
'Social',
'Governança'
],
datasets:[{
data:[
financeiro,
operacional,
social,
governanca
],
backgroundColor:[
'#10b981',
'#3b82f6',
'#f59e0b',
'#8b5cf6'
]
}]
},
options:{
responsive:true,
plugins:{
legend:{
labels:{
color:'#fff'
}
},
datalabels:{
color:'#fff'
}
}
},
plugins:[ChartDataLabels]
})

}

setInterval(async()=>{

try{

await carregarDashboard()
await carregarAlertasTecnicos()
}catch(e){

console.log(e)

}

},60000)

async function atualizarSemaforosAutomaticos(){

let{data,error}=await client
.from('monitoramento_itens')
.select('*')

if(error){
console.log(error)
return
}

for(let item of(data||[])){

let status=item.status||'EM ANDAMENTO'

let percentual=Number(item.percentual||0)

let prazo=item.prazo

let criticidade='BAIXA'

if(percentual<40){
criticidade='ALTA'
}else if(percentual<80){
criticidade='MÉDIA'
}

if(prazo){

let hoje=new Date()

let dtPrazo=new Date(prazo)

if(dtPrazo<hoje&&status!=='EXECUTADA'){

criticidade='ALTA'

}

}

await client
.from('monitoramento_itens')
.update({
criticidade:criticidade
})
.eq('id',item.id)

}

await carregarItensMatriz()
await carregarDashboard()

}

async function carregarAlertasTecnicos(){

let{data,error}=await client
.from('monitoramento_itens')
.select('*')

if(error){
console.log(error)
return
}

let html=''

let hoje=new Date()

;(data||[]).forEach(i=>{

let alertas=[]

let percentual=Number(i.percentual||0)

if(percentual<40){

alertas.push(
'Percentual inferior a 40%'
)

}

if(i.criticidade==='ALTA'){

alertas.push(
'Criticidade alta identificada'
)

}

if(i.status==='NÃO EXECUTADA'){

alertas.push(
'Item não executado'
)

}

if(i.prazo){

let prazo=new Date(i.prazo)

if(prazo<hoje&&i.status!=='EXECUTADA'){

alertas.push(
'Prazo expirado'
)

}

}

if(alertas.length>0){

html+=`
<div class="alerta-box">

<div class="alerta-titulo">
⚠ ITEM ${i.item||'-'} • ${i.subitem||'-'}
</div>

<div class="alerta-texto">

${alertas.map(a=>`• ${a}`).join('<br>')}

</div>

</div>
`

}

})

if(!html){

html=`
<div class="alerta-box" style="background:#064e3b;border-color:#10b981;">
<div class="alerta-titulo">
✔ Nenhum alerta crítico identificado
</div>
<div class="alerta-texto" style="color:#d1fae5;">
Os itens monitorados encontram-se dentro dos parâmetros técnicos esperados.
</div>
</div>
`
}

document.getElementById('painelAlertas').innerHTML=html

}
