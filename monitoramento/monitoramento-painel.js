let graficoStatus=null
let graficoEvolucao=null

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

})
