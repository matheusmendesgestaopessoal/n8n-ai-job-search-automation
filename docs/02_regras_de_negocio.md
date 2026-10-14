# Regras de Negócio e Critérios

Cada regra abaixo está implementada no workflow e pode ser conferida no arquivo indicado. O diagnóstico
(`codigo/analises/diagnostico.py`) confere, sobre os dados reais, se as regras do score foram cumpridas.

---

## 1. Busca

| Regra | Definição | Onde |
|---|---|---|
| Frequência | Uma execução por dia, ao meio-dia | nó Schedule Trigger |
| Buscas | 10 combinações de frente × modalidade × região: Dados e BI, Operações e Planejamento, Financeiro e Administrativo, Estágio em ADS; remoto (Brasil), híbrido (São Paulo) e presencial (Guarujá e Santos) | `workflow/codigo/01_gerar_pesquisas.js` |
| Janela | Vagas publicadas nas últimas 24 horas | idem |
| Senioridade buscada | Júnior, assistente, entry level e estágio; termos de sênior, especialista, liderança e gestão são evitados na própria busca | idem |

## 2. Normalização

| Regra | Definição | Por quê |
|---|---|---|
| Vaga válida | Tem título, empresa e (id ou link) | Sem isso não há como identificar nem abrir a vaga |
| Chave única (`dedupe_key`) | `linkedin:<id>`; sem id, `linkedin:<empresa\|título\|local>` normalizados | A mesma vaga reaparece em buscas e dias diferentes |
| Modalidade | REMOTO, HIBRIDO, PRESENCIAL ou NAO_INFORMADO, pelos campos do anúncio e, se faltar, pelo início da descrição | O LinkedIn nem sempre informa |
| Candidatos | Número inteiro; "200+" vira 200 | Formato varia entre anúncios |
| Recrutador | Nome, cargo e perfil, quando o anúncio traz | Usado na mensagem sugerida |

## 3. Pré-filtro (JavaScript, antes da IA)

O pré-filtro soma e subtrai pontos de sinais objetivos e **descarta** a vaga se uma regra eliminatória disparar ou se a nota ficar abaixo de 40.

| Sinal | Efeito | Por quê |
|---|---|---|
| Dados inválidos ou cargo vazio | Descarta | Não há o que analisar |
| Cargo de sênior, especialista, liderança, gestão ou arquiteto | Descarta | Fora do nível buscado |
| Cargo júnior, assistente, estágio ou trainee | +20 | Nível compatível |
| Cargo de uma das frentes buscadas | +30 | Relação direta com o alvo |
| Palavras-chave da frente no título ou na descrição | +4 cada, até +28 | Evidência de relação com o perfil |
| Remoto, híbrido em SP ou presencial na Baixada Santista | +15 | Modalidade viável |
| Híbrido fora de SP | −15 | Deslocamento inviável |
| Presencial fora da Baixada Santista | −20 | Idem |
| Modalidade não informada | +2 | Não descarta: a maioria das vagas não informa |
| Exige 4 anos de experiência | −8 | Acima do perfil, mas não impossível |
| Exige 5 ou 6 anos | −20 | Bem acima do perfil |
| Exige 7 anos ou mais | Descarta | Incompatível |
| Área fora do alvo (vendas, saúde, direito, RH, design…) | Descarta | Sem relação com as frentes |
| Estágio de suporte, help desk ou infraestrutura | Descarta | Fora do foco em dados e sistemas |
| Cargo sem relação e menos de 3 palavras-chave | −20 | Evita vaga aleatória que só cita Excel ou SQL |

## 4. Deduplicação

| Camada | Regra |
|---|---|
| Entre execuções | O nó Remove Duplicates guarda as últimas 10.000 chaves e ignora vagas já vistas |
| No banco | `dedupe_key` é `UNIQUE`; a gravação usa `INSERT ... ON CONFLICT (dedupe_key) DO UPDATE` |

## 5. Classificação com IA

| Regra | Definição | Por quê |
|---|---|---|
| Entrada | Vaga normalizada + perfil estruturado do candidato | A IA compara evidências, não palavras soltas |
| Descrição da vaga | Tratada como **dado**, nunca como instrução | Proteção contra instruções escondidas no anúncio |
| Tipos de evidência | Experiência profissional ≠ projeto de portfólio ≠ estudo | Impede inflar a aderência com o que é só projeto |
| Saída | Formato fixo (Structured Output): 6 notas, eliminatório, motivo, frente, senioridade e resumo | O resultado entra num pipeline, não num texto livre |
| Requisito eliminatório | Só quando o requisito é obrigatório, claramente não atendido e importante para a função; "desejável" ou "diferencial" nunca elimina; na dúvida, não elimina | Evita descartar por um detalhe |

## 6. Score e classificação (calculados por código)

| Critério | Máximo |
|---|---:|
| Compatibilidade técnica | 35 |
| Experiência e responsabilidades | 25 |
| Senioridade | 15 |
| Modalidade e localização | 10 |
| Formação e elegibilidade | 5 |
| Diferenciais | 10 |
| **Score** | **100** |

| Regra | Definição |
|---|---|
| Validação | Cada nota é arredondada e limitada entre 0 e o máximo do critério; campo ausente interrompe o fluxo |
| Eliminatório | Score limitado a 49 e classificação DESCARTAR |
| Faixas | ALTA ≥ 80 · MÉDIA 65–79 · BAIXA 50–64 · DESCARTAR < 50 |
| Ação | ALTA → preparar candidatura · MÉDIA → revisar · BAIXA → registrar · DESCARTAR → arquivar |

## 7. Análise detalhada e entrega

| Regra | Definição | Por quê |
|---|---|---|
| Quem recebe a 2ª análise | Só ALTA e MÉDIA | A chamada mais cara de IA vai só para o que pode chegar até mim |
| O que a 2ª análise gera | Pontos fortes, requisitos parciais e ausentes, palavras-chave, estratégia de currículo e mensagem ao recrutador | Transformar o alerta em ação |
| Score na 2ª análise | Não é recalculado | A classificação já foi decidida por código |
| Telegram | Mensagens diferentes para ALTA e MÉDIA, com link da vaga | A caixa de entrada só recebe o que foi priorizado |
