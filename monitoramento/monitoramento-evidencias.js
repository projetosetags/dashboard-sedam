window.ITEM_EVIDENCIA_ATUAL=null

async function uploadEvidencia(){

if(!ITEM_EVIDENCIA_ATUAL){
alert('Selecione um item')
return
}

let file=document.getElementById('arquivoEvidencia').files[0]

if(!file){
alert('Selecione um arquivo')
return
}

let tipo=prompt('Tipo da Evidência')
if(tipo===null)return

let numero=prompt('Número do Documento')
if(numero===null)return

let orgao=prompt('Órgão')
if(orgao===null)return

let descricao=prompt('Descrição')
if(descricao===null)return

let confiabilidade=prompt('Confiabilidade: ALTA/MÉDIA/BAIXA')
if(confiabilidade===null)return

let status='PENDENTE'

let nomeArquivo=
Date.now()+
'_'+
file.name
.replaceAll(' ','_')

let caminho=
ITEM_EVIDENCIA_ATUAL+
'/'+
nomeArquivo

let{error:uploadError}=await client
.storage
.from('monitoramento-evidencias')
.upload(caminho,file)

if(uploadError){
console.log(uploadError)
alert('Erro upload')
return
}

let{data:urlData}=client
.storage
.from('monitoramento-evidencias')
.getPublicUrl(caminho)

let link=urlData.publicUrl

let{error}=await client
.from('monitoramento_evidencias')
.insert([{
item_id:ITEM_EVIDENCIA_ATUAL,
tipo_evidencia:tipo,
numero_documento:numero,
descricao:descricao,
orgao:orgao,
link_arquivo:link,
status_validacao:status,
confiabilidade:confiabilidade,
data_documento:new Date().toISOString().slice(0,10)
}])

if(error){
console.log(error)
alert('Erro banco')
return
}

document.getElementById('arquivoEvidencia').value=''

await carregarEvidencias()
await registrarLog(
'UPLOAD EVIDÊNCIA',
'monitoramento_evidencias',
ITEM_EVIDENCIA_ATUAL
)

}

async function carregarEvidencias(){

if(!ITEM_EVIDENCIA_ATUAL)return

let{data,error}=await client
.from('monitoramento_evidencias')
.select('*')
.eq('item_id',ITEM_EVIDENCIA_ATUAL)
.order('id',{ascending:false})

if(error){
console.log(error)
return
}

let html=''

;(data||[]).forEach(e=>{

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

<div class="badge-status ${getClasseValidacao(e.status_validacao)}">
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

</div>

<div class="evidencia-actions">

<a href="${e.link_arquivo}" target="_blank" class="btn-link">
📎 Abrir Arquivo
</a>

<button class="btn-padrao azul" onclick="validarEvidencia(${e.id})">
✔ Validar
</button>

<button class="btn-padrao amarelo" onclick="editarEvidencia(${e.id})">
✏ Editar
</button>

<button class="btn-padrao vermelho" onclick="excluirEvidencia(${e.id})">
🗑 Excluir
</button>

</div>

</div>
`

})

document.getElementById('listaEvidencias').innerHTML=html

}

function getClasseValidacao(s){

if(s==='VALIDADA')return'verde'
if(s==='PENDENTE')return'amarelo'
if(s==='REJEITADA')return'vermelho'

return'azul'

}

async function validarEvidencia(id){

let{error}=await client
.from('monitoramento_evidencias')
.update({
status_validacao:'VALIDADA'
})
.eq('id',id)

if(error){
console.log(error)
return
}

await carregarEvidencias()

}

async function editarEvidencia(id){

let{data,error}=await client
.from('monitoramento_evidencias')
.select('*')
.eq('id',id)
.single()

if(error||!data)return

let descricao=prompt(
'Descrição',
data.descricao||''
)

if(descricao===null)return

let confiabilidade=prompt(
'Confiabilidade',
data.confiabilidade||''
)

let status=prompt(
'Status',
data.status_validacao||''
)

let{error:updateError}=await client
.from('monitoramento_evidencias')
.update({
descricao:descricao,
confiabilidade:confiabilidade,
status_validacao:status
})
.eq('id',id)

if(updateError){
console.log(updateError)
return
}

await carregarEvidencias()

}

async function excluirEvidencia(id){

if(!confirm('Excluir evidência?'))return

let{error}=await client
.from('monitoramento_evidencias')
.delete()
.eq('id',id)

if(error){
console.log(error)
return
}

await carregarEvidencias()

}

async function registrarLog(
acao,
tabela,
registro
){

try{

await client
.from('monitoramento_logs')
.insert([{
usuario:'AUDITOR',
acao:acao,
tabela:tabela,
registro_id:registro,
dados:{
data:new Date().toISOString()
}
}])

}catch(e){

console.log(e)

}

}
