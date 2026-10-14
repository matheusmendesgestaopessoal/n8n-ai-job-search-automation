# Requisitos

## Requisitos funcionais

### Busca e preparação
- **RF01** Executar a busca automaticamente uma vez por dia.
- **RF02** Buscar vagas em várias frentes (dados e BI, operações, financeiro, estágio) e modalidades (remoto, híbrido em SP, presencial na Baixada Santista).
- **RF03** Padronizar cada vaga num formato único: id, cargo, empresa, local, modalidade, data, candidatos, links e recrutador.
- **RF04** Gerar uma chave única por vaga e não reprocessar vagas já vistas.

### Triagem
- **RF05** Descartar por regras objetivas, sem IA, as vagas claramente incompatíveis (senioridade, área, experiência exigida, modalidade inviável).
- **RF06** Comparar cada vaga restante com o perfil estruturado do candidato.
- **RF07** Separar experiência profissional, projeto de portfólio e conhecimento em estudo na comparação.
- **RF08** Pontuar a vaga de 0 a 100 em 6 critérios com pesos fixos.
- **RF09** Identificar requisitos eliminatórios obrigatórios e explicar o motivo.
- **RF10** Classificar em ALTA, MÉDIA, BAIXA ou DESCARTAR e definir a ação.

### Registro e entrega
- **RF11** Gravar todas as vagas classificadas, atualizando a mesma vaga se ela reaparecer.
- **RF12** Gerar, só para ALTA e MÉDIA, pontos fortes, lacunas, palavras-chave, estratégia de currículo e mensagem ao recrutador.
- **RF13** Enviar ao Telegram só as vagas ALTA e MÉDIA, com link e o material do RF12.

### Análise
- **RF14** Medir, sobre o histórico, a distribuição das classificações, os motivos de descarte e as lacunas mais citadas.
- **RF15** Conferir se o score gravado respeita as regras do código.

## Requisitos não funcionais

- **RNF01 Econômico:** a IA só é chamada depois do pré-filtro e da deduplicação; a 2ª análise só para ALTA e MÉDIA.
- **RNF02 Previsível:** a IA devolve notas estruturadas; score, classificação e ação são calculados por código.
- **RNF03 Seguro:** credenciais configuradas no n8n, nunca no workflow público; a descrição da vaga é tratada como dado, não como instrução.
- **RNF04 Idempotente:** reprocessar a mesma vaga atualiza o registro em vez de duplicar.
- **RNF05 Auditável:** o histórico guarda cada componente do score, o motivo eliminatório e o resumo de aderência.
- **RNF06 Legível:** a lógica dos nós fica também em arquivos de texto (`workflow/codigo`, `prompts`, `schemas`), cópias do JSON para leitura.
- **RNF07 Privado:** dados exportados com nomes de empresas e perfil pessoal não são versionados.
