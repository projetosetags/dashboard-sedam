let graficoHistorico=null

async function sincronizarHistoricoTAG(){

if(!MONITORAMENTO_ATUAL){
alert('Selecione um monitoramento')
return
}

let{data:itens,error}=await client
.from('monitoramento_itens')
.select('*')
.eq('monitoramento_id',MONITORAMENTO_ATUAL)

if(error){
console.log(error)
return
}

let totalInseridos=0

for(let item of(itens||[])){

let{data:evolucao,error:evolucaoError}=await client
.from('evolucao_mensal')
.select('*')
.eq('deliberacao_id',item.id)

if(evolucaoError){
console.log(evolucaoError)
continue
}

for(let e of(evolucao||[])){

let{data:existente}=await client
.from('monitoramento_historico')
.select('*')
.eq('item_id',item.id)
.eq('mes_referencia',e.mes_referencia)
.limit(1)

if(existente&&existente.length>0){
continue
}

let{error:insertError}=await client
.from('monitoramento_historico')
.insert([{
item_id:item.id,
mes_referencia:e.mes_referencia,
percentual:Number(e.percentual_lancado||0),
origem:'TAG'
}])

if(!insertError){
totalInseridos++
}

}

}

await registrarLog(
'SINCRONIZAÇÃO HISTÓRICO TAG',
'monitoramento_historico',
MONITORAMENTO_ATUAL
)

await carregarHistorico()

alert(
`${totalInseridos} históricos sincronizados`
)

}

async function carregarHistorico(){

if(!MONITORAMENTO_ATUAL)return

let{data,error}=await client
.from('monitoramento_historico')
.select('*')
.order('created_at',{ascending:true})

if(error){
console.log(error)
return
}

let mapa={}

;(data||[]).forEach(h=>{

if(!mapa[h.mes_referencia]){
mapa[h.mes_referencia]=[]
}

mapa[h.mes_referencia]
.push(Number(h.percentual||0))

})

let labels=[]
let valores=[]

Object.keys(mapa).forEach(m=>{

labels.push(m)

let arr=mapa[m]

let media=
arr.reduce((a,b)=>a+b,0)/arr.length

valores.push(
Number(media.toFixed(2))
)

})

let ctx=document.getElementById('graficoHistorico')

if(graficoHistorico){
graficoHistorico.destroy()
}

graficoHistorico=new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
label:'Evolução Média',
data:valores,
borderColor:'#10b981',
backgroundColor:'rgba(16,185,129,.2)',
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
color:'#fff'
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

let html=''

;(data||[]).forEach(h=>{

let classe='azul'

if(Number(h.percentual)>=100){
classe='verde'
}else if(Number(h.percentual)<40){
classe='vermelho'
}else if(Number(h.percentual)<80){
classe='amarelo'
}

html+=`
<div class="card-monitoramento">

<div class="card-monitoramento-topo">

<div>
<div class="monitoramento-titulo">
${h.mes_referencia||'-'}
</div>

<div class="monitoramento-subtitulo">
Origem: ${h.origem||'-'}
</div>
</div>

<div class="badge-status ${classe}">
${Number(h.percentual||0)}%
</div>

</div>

</div>
`

})

document.getElementById('listaHistorico').innerHTML=html

}
