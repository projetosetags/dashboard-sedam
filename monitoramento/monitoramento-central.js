async function carregarCentralEvidencias(){

let{data,error}=await client
.from('monitoramento_evidencias')
.select('*')
.order('id',{ascending:false})

if(error){
console.log(error)
return
}

atualizarKPICentral(data||[])

renderCentralEvidencias(data||[])

}

function atualizarKPICentral(data){

let validada=
data.filter(e=>
e.status_validacao==='VALIDADA'
).length

let pendente=
data.filter(e=>
e.status_validacao==='PENDENTE'
).length

let rejeitada=
data.filter(e=>
e.status_validacao==='REJEITADA'
).length

document.getElementById('kpiCentralValidada').innerHTML=
validada

document.getElementById('kpiCentralPendente').innerHTML=
pendente

document.getElementById('kpiCentralRejeitada').innerHTML=
rejeitada

document.getElementById('kpiCentralTotal').innerHTML=
data.length

}

function renderCentralEvidencias(data){

let html=''

;(data||[]).forEach(e=>{

let classe='azul'

if(e.status_validacao==='VALIDADA'){
classe='verde'
}

if(e.status_validacao==='PENDENTE'){
classe='amarelo'
}

if(e.status_validacao==='REJEITADA'){
classe='vermelho'
}

html+=`
<div class="card-evidencia">

<div class="card-evidencia-topo">

<div>

<div class="evidencia-titulo">
${e.tipo_evidencia||'-'}
</div>

<div class="evidencia-subtitulo">
${e.numero_documento||'-'} • ${e.orgao||'-'}
</div>

</div>

<div class="badge-status ${classe}">
${e.status_validacao||'-'}
</div>

</div>

<div class="evidencia-descricao">
${e.descricao||'-'}
</div>

<div class="evidencia-grid">

<div>
<b>Confiabilidade:</b>
${e.confiabilidade||'-'}
</div>

<div>
<b>Data:</b>
${formatarData(e.data_documento)}
</div>

<div>
<b>Item:</b>
${e.item_id||'-'}
</div>

</div>

<div class="evidencia-actions">

<a href="${e.link_arquivo}" target="_blank" class="btn-link">
📎 Abrir
</a>

<button class="btn-padrao verde" onclick="validarEvidencia(${e.id})">
✔ Validar
</button>

<button class="btn-padrao vermelho" onclick="rejeitarEvidencia(${e.id})">
✖ Rejeitar
</button>

</div>

</div>
`

})

document.getElementById(
'listaCentralEvidencias'
).innerHTML=html

}

async function filtrarCentralEvidencias(){

let busca=document
.getElementById('buscaCentral')
.value
.toLowerCase()

let validacao=document
.getElementById('filtroValidacaoCentral')
.value

let confiabilidade=document
.getElementById('filtroConfiabilidadeCentral')
.value

let{data,error}=await client
.from('monitoramento_evidencias')
.select('*')

if(error){
console.log(error)
return
}

if(validacao){

data=data.filter(e=>
e.status_validacao===validacao
)

}

if(confiabilidade){

data=data.filter(e=>
e.confiabilidade===confiabilidade
)

}

if(busca){

data=data.filter(e=>

(e.descricao||'')
.toLowerCase()
.includes(busca)

||

(e.numero_documento||'')
.toLowerCase()
.includes(busca)

||

(e.orgao||'')
.toLowerCase()
.includes(busca)

)

}

renderCentralEvidencias(data||[])

}

async function rejeitarEvidencia(id){

let motivo=prompt(
'Informe o motivo da rejeição'
)

if(motivo===null)return

let{error}=await client
.from('monitoramento_evidencias')
.update({
status_validacao:'REJEITADA',
descricao:
'REJEITADA: '+motivo
})
.eq('id',id)

if(error){
console.log(error)
return
}

await registrarLog(
'REJEIÇÃO EVIDÊNCIA',
'monitoramento_evidencias',
id
)

await carregarCentralEvidencias()

}
