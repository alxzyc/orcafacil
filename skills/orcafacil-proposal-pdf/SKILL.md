# OrçaFácil Proposal PDF

## Layout
1. Cabeçalho com logo e dados do prestador
2. Dados do cliente e número da proposta ORC-YYYY-#### 
3. Tabela de itens: descrição, qtd, valor unitário, subtotal
4. Descontos, impostos, total
5. Condições de pagamento, validade
6. Observações
7. Rodapé com contato

## Regras
- Gerar PDF com jsPDF + html2canvas a partir da view de proposta
- Manter identidade visual: fundo branco, tipografia Inter/Poppins
- Quebra de página após itens se > 15 linhas
- Link público sem navegação interna
