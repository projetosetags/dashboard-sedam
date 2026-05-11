/*=========================================================
001 RELATORIOS FUNCTION GERARRELATORIOPDF
=========================================================*/
async function gerarRelatorioPDF(){
const {jsPDF}=window.jspdf
let query=client.from('deliberacoes').select('*')
if(userP&&Number(userP.nivel_acesso)!=1){
query=query.eq('responsavel_id',userP.id)
}
let {data,error}=await query
if(error||!data){
alert("Erro ao gerar PDF")
return
}
let lista=(data||[])
let doc=new jsPDF('p','mm','a4')
const meses=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const mesesTxt=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
function calcMes(mes){
if(!lista.length)return 0
return Math.round(lista.reduce((acc,c)=>acc+Number(c[mes]||0),0)/lista.length)
}
let totalItens=[...new Set(lista.map(x=>(x.subitem||'').split('.')[0]))].length
let totalSubitens=lista.length
let mediaGeral=Math.round(lista.reduce((acc,c)=>{
return acc+Math.max(Number(c.jan||0),Number(c.fev||0),Number(c.mar||0),Number(c.abr||0),Number(c.mai||0),Number(c.jun||0),Number(c.jul||0),Number(c.ago||0),Number(c.set||0),Number(c.out||0),Number(c.nov||0),Number(c.dez||0))
},0)/(lista.length||1))
let concluidos=lista.filter(i=>Math.max(Number(i.jan||0),Number(i.fev||0),Number(i.mar||0),Number(i.abr||0),Number(i.mai||0),Number(i.jun||0),Number(i.jul||0),Number(i.ago||0),Number(i.set||0),Number(i.out||0),Number(i.nov||0),Number(i.dez||0))>=100).length
let pendentes=totalSubitens-concluidos
doc.setFontSize(14)
doc.setTextColor(0,0,0)
doc.text(userP&&Number(userP.nivel_acesso)==1?"RELATÓRIO GERAL - TAG SEDAM 2026":"RELATÓRIO INDIVIDUAL - "+(userP.nome_completo||''),10,12)
doc.setFontSize(8)
doc.text("Tribunal de Contas do Estado de Rondônia - Monitoramento Estratégico",10,18)
let rows=lista.map(i=>{
let total=Math.max(Number(i.jan||0),Number(i.fev||0),Number(i.mar||0),Number(i.abr||0),Number(i.mai||0),Number(i.jun||0),Number(i.jul||0),Number(i.ago||0),Number(i.set||0),Number(i.out||0),Number(i.nov||0),Number(i.dez||0))
return[i.subitem||'-',i.descricao||'-',i.produto||'-',total+'%']
})
doc.autoTable({
startY:24,
head:[['Subitem','Descrição Completa','Produtos','Total']],
body:rows,
theme:'grid',
styles:{fontSize:7,cellPadding:2,overflow:'linebreak',valign:'middle',textColor:[0,0,0]},
headStyles:{fillColor:[180,150,110],textColor:[0,0,0],fontStyle:'bold'},
columnStyles:{0:{cellWidth:18},1:{cellWidth:108},2:{cellWidth:45},3:{cellWidth:14,halign:'center'}},
margin:{top:20,bottom:38,left:5,right:5},
didDrawPage:function(data){
let pageHeight=doc.internal.pageSize.height
let pageWidth=doc.internal.pageSize.width
doc.setFillColor(255,255,255)
doc.rect(0,pageHeight-34,pageWidth,34,'F')
doc.setTextColor(90,90,90)
doc.setFontSize(7)
doc.text('Tribunal de Contas do Estado de Rondônia - TAG SEDAM 2026',6,pageHeight-26)
doc.setFontSize(4)
doc.text(NOTA_TECNICA_PDF,10,pageHeight-18,{maxWidth:pageWidth-55,align:'justify'})
}
})
let finalY=doc.lastAutoTable.finalY+10
if(finalY>240){
doc.addPage()
finalY=20
}
doc.setFontSize(12)
doc.setTextColor(0,0,0)
doc.text("RESUMO EXECUTIVO E INDICADORES",10,finalY)
finalY+=8
doc.setFontSize(9)
doc.text("• Quantidade total de itens estratégicos: "+totalItens,10,finalY)
finalY+=6
doc.text("• Quantidade total de subitens monitorados: "+totalSubitens,10,finalY)
finalY+=6
doc.text("• Quantidade de subitens com execução integral (100%): "+concluidos,10,finalY)
finalY+=6
doc.text("• Quantidade de subitens pendentes ou parciais: "+pendentes,10,finalY)
finalY+=6
doc.text("• Média geral consolidada de execução do TAG: "+mediaGeral+"%",10,finalY)
finalY+=10
doc.setFontSize(10)
doc.text("DESEMPENHO MÉDIO POR MÊS",10,finalY)
finalY+=8
meses.forEach((m,idx)=>{
let perc=calcMes(m)
doc.setFontSize(9)
doc.text("• "+mesesTxt[idx]+" → "+perc+"% de execução média consolidada",14,finalY)
finalY+=5
if(finalY>280){
doc.addPage()
finalY=20
}
})
finalY+=5
doc.setFontSize(9)
let melhorMes=''
let maior=-1
meses.forEach((m,idx)=>{
let v=calcMes(m)
if(v>maior){
maior=v
melhorMes=mesesTxt[idx]
}
})
doc.text("Conclusão Analítica: O monitoramento demonstra evolução progressiva das ações estratégicas vinculadas ao TAG SEDAM 2026, apresentando maior desempenho consolidado no mês de "+melhorMes+", com média de "+maior+"% de execução.",10,finalY,{maxWidth:190})
let totalPages=doc.internal.getNumberOfPages()
for(let i=1;i<=totalPages;i++){
doc.setPage(i)
doc.setFontSize(7)
doc.text('Página '+i+' de '+totalPages,195,290,{align:'right'})
}
doc.save(userP&&Number(userP.nivel_acesso)==1?'relatorio_geral_tag_sedam.pdf':'relatorio_'+(userP.username||'usuario')+'.pdf')
}
/*=========================================================
002 RELATORIOS FUNCTION GERARCSV
=========================================================*/
function gerarCSV(d,n){
if(!d||!d.length)return
let c=Object.keys(d[0])
let csv=c.join(";")+"\n"
d.forEach(l=>{
csv+=c.map(k=>`"${(l[k]??'').toString().replace(/"/g,'""')}"`).join(";")+"\n"
})
let b=new Blob([csv],{type:"text/csv"})
let a=document.createElement("a")
a.href=URL.createObjectURL(b)
a.download=n+"_"+Date.now()+".csv"
a.click()
}
/*=========================================================
003 RELATORIOS FUNCTION GERARJSON
=========================================================*/
function gerarJSON(o){
let b=new Blob([JSON.stringify(o,null,2)],{type:"application/json"})
let a=document.createElement("a")
a.href=URL.createObjectURL(b)
a.download="backup_"+Date.now()+".json"
a.click()
}
/*=========================================================
004 RELATORIOS CONSTANT NOTATECNICAPDF
=========================================================*/
const NOTA_TECNICA_PDF=`As informações constantes neste painel, gráficos, indicadores e relatórios possuem caráter preliminar e meramente informativo, sendo baseadas nos dados declarados e apresentados até o presente momento pelos jurisdicionados envolvidos. Ressalta-se que tais informações ainda não passaram pela análise técnica de consistência documental, verificação de evidências, validação metodológica e conferência conclusiva pela equipe técnica de auditores designados. A validação oficial ocorrerá posteriormente, por meio da análise técnica dos relatórios de execução, documentos comprobatórios e demais evidências encaminhadas pelos órgãos e entidades responsáveis, culminando na emissão do respectivo Relatório de Monitoramento e demais manifestações técnicas oficiais do Tribunal de Contas.`
