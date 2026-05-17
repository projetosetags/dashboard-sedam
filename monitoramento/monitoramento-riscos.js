let graficoRiscos=null
let graficoOrgaosCriticos=null

async function carregarPainelRiscos(){

let{data,error}=await client
.from('monitoramento_itens')
.select('*')
data=ordenarDataGlobal(data)
data=aplicarFiltroOrigem(data)
  
if(error){
console.log(error)
return
}

let alto=0
let medio=0
let baixo=0

let soma=0

;(data||[]).forEach(i=>{

let percentual=Number(i.percentual||0)

soma+=percentual

if(percentual<40){

alto++

}else if(percentual<80){

medio++

}else{

baixo++

}

})

let media=0

if(data&&data.length>0){

media=
(
soma/
data.length
)
.toFixed(1)

}

document.getElementById('kpiRiscoAlto').innerHTML=alto
document.getElementById('kpiRiscoMedio').innerHTML=medio
document.getElementById('kpiRiscoBaixo').innerHTML=baixo
document.getElementById('kpiScoreRisco').innerHTML=`${media}%`

await carregarGraficoRiscos(
alto,
medio,
baixo
)

await carregarGraficoOrgaosCriticos()

await carregarListaRiscos(data||[])

}

async function carregarGraficoRiscos(
alto,
medio,
baixo
){

let ctx=document.getElementById('graficoRiscos')

if(!ctx)return

if(graficoRiscos){
graficoRiscos.destroy()
}

graficoRiscos=new Chart(ctx,{
type:'radar',
data:{
labels:[
'Risco Alto',
'Risco Médio',
'Risco Baixo'
],
datasets:[{
label:'Mapa de Risco',
data:[
alto,
medio,
baixo
],
backgroundColor:'rgba(239,68,68,.2)',
borderColor:'#ef4444',
pointBackgroundColor:'#ef4444'
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
},
scales:{
r:{
ticks:{
color:'#fff',
backdropColor:'transparent'
},
grid:{
color:'rgba(255,255,255,.1)'
},
pointLabels:{
color:'#fff'
}
}
}
},
plugins:[ChartDataLabels]
})

}

async function carregarGraficoOrgaosCriticos(){

let{data,error}=await client
.from('monitoramentos')
.select('*')

if(error){
console.log(error)
return
}

let mapa={}

;(data||[]).forEach(m=>{

let orgao=m.orgao||'NÃO INFORMADO'

if(!mapa[orgao]){
mapa[orgao]=0
}

if(
(m.status||'')!=='EXECUTADA'
){

mapa[orgao]++

}

})

let labels=Object.keys(mapa)
let valores=Object.values(mapa)

let ctx=document.getElementById('graficoOrgaosCriticos')

if(!ctx)return

if(graficoOrgaosCriticos){
graficoOrgaosCriticos.destroy()
}

graficoOrgaosCriticos=new Chart(ctx,{
type:'bar',
data:{
labels:labels,
datasets:[{
label:'Pendências',
data:valores,
backgroundColor:'#f59e0b',
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

async function carregarListaRiscos(data){

let html=''
let ordenado=ordenarDataGlobal(data)
ordenado.forEach(i=>{

let percentual=Number(i.percentual||0)

let classe='verde'
let risco='BAIXO'

if(percentual<40){

classe='vermelho'
risco='ALTO'

}else if(percentual<80){

classe='amarelo'
risco='MÉDIO'

}

html+=`
<div class="card-monitoramento">

<div class="card-monitoramento-topo">

<div>

<div class="monitoramento-titulo">
ITEM ${i.item||'-'} • ${i.subitem||'-'}
</div>

<div class="monitoramento-subtitulo">
${i.deliberacao||'-'}
</div>

</div>

<div class="badge-status ${classe}">
RISCO ${risco}
</div>

</div>

<div class="progress-monitoramento">
<div class="progress-monitoramento-bar" style="width:${percentual}%"></div>
</div>

<div style="margin-top:10px;font-size:13px;">
Percentual de atendimento:
<b>${percentual}%</b>
</div>

</div>
`

})

document.getElementById('listaRiscos').innerHTML=html

}
