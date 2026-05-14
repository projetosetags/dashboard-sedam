window.RESULTADO_EDITANDO=null

async function salvarResultadoMonitoramento(){

if(!ITEM_EVIDENCIA_ATUAL){
alert('Selecione um item')
return
}

let payload={

item_id:ITEM_EVIDENCIA_ATUAL,

situacao_encontrada:
document.getElementById('rSituacao').value,

efeitos:
document.getElementById('rEfeitos').value,

causas:
document.getElementById('rCausas').value,

boas_praticas:
document.getElementById('rBoasPraticas').value,

encaminhamento:
document.getElementById('rEncaminhamento').value,

beneficios:
document.getElementById('rBeneficios').value

}

if(RESULTADO_EDITANDO){

let{error}=await client
.from('monitoramento_resultados')
.update(payload)
.eq('id',RESULTADO_EDITANDO)

if(error){
console.log(error)
return
}

RESULTADO_EDITANDO=null

}else{

let{error}=await client
.from('monitoramento_resultados')
.insert([payload])

if(error){
console.log(error)
return
}

}

await registrarLog(
'RESULTADO MONITORAMENTO',
'monitoramento_resultados',
ITEM_EVIDENCIA_ATUAL
)

await carregarResultados()

limparResultadoMonitoramento()

alert('Resultado salvo')

}

async function carregarResultados(){

if(!ITEM_EVIDENCIA_ATUAL)return

let{data,error}=await client
.from('monitoramento_resultados')
.select('*')
.eq('item_id',ITEM_EVIDENCIA_ATUAL)
.order('id',{ascending:false})

if(error){
console.log(error)
return
}

let html=''

;(data||[]).forEach(r=>{

html+=`
<div class="card-resultado">

<div class="resultado-topo">

<div class="resultado-titulo">
Resultado Técnico
</div>

<div class="resultado-actions">

<button class="btn-padrao azul" onclick="editarResultado(${r.id})">
Editar
</button>

<button class="btn-padrao vermelho" onclick="excluirResultado(${r.id})">
Excluir
</button>

</div>

</div>

<div class="resultado-bloco">
<div class="resultado-label">Situação Encontrada</div>
<div class="resultado-texto">${r.situacao_encontrada||'-'}</div>
</div>

<div class="resultado-bloco">
<div class="resultado-label">Efeitos</div>
<div class="resultado-texto">${r.efeitos||'-'}</div>
</div>

<div class="resultado-bloco">
<div class="resultado-label">Causas</div>
<div class="resultado-texto">${r.causas||'-'}</div>
</div>

<div class="resultado-bloco">
<div class="resultado-label">Boas Práticas</div>
<div class="resultado-texto">${r.boas_praticas||'-'}</div>
</div>

<div class="resultado-bloco">
<div class="resultado-label">Encaminhamento</div>
<div class="resultado-texto">${r.encaminhamento||'-'}</div>
</div>

<div class="resultado-bloco">
<div class="resultado-label">Benefícios</div>
<div class="resultado-texto">${r.beneficios||'-'}</div>
</div>

</div>
`

})

document.getElementById('listaResultados').innerHTML=html

}

async function editarResultado(id){

let{data,error}=await client
.from('monitoramento_resultados')
.select('*')
.eq('id',id)
.single()

if(error||!data)return

RESULTADO_EDITANDO=id

document.getElementById('rSituacao').value=data.situacao_encontrada||''

document.getElementById('rEfeitos').value=data.efeitos||''

document.getElementById('rCausas').value=data.causas||''

document.getElementById('rBoasPraticas').value=data.boas_praticas||''

document.getElementById('rEncaminhamento').value=data.encaminhamento||''

document.getElementById('rBeneficios').value=data.beneficios||''

window.scrollTo({
top:0,
behavior:'smooth'
})

}

async function excluirResultado(id){

if(!confirm('Excluir resultado?'))return

let{error}=await client
.from('monitoramento_resultados')
.delete()
.eq('id',id)

if(error){
console.log(error)
return
}

await carregarResultados()

}

function limparResultadoMonitoramento(){

RESULTADO_EDITANDO=null

document.getElementById('rSituacao').value=''

document.getElementById('rEfeitos').value=''

document.getElementById('rCausas').value=''

document.getElementById('rBoasPraticas').value=''

document.getElementById('rEncaminhamento').value=''

document.getElementById('rBeneficios').value=''

}
