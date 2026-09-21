# Evaluation catalog

Each eval has one placement: modality → language → task category → task type.
Text categories separate **Model knowledge**, **Classification / decision**, and **Ranking — supplied context**.
Multilingual includes non-English suites; exact language metadata is retained.
This is a catalog, not a combined leaderboard. See [grouping rules](#grouping-rules).

## Text-based

### English

#### Corporate Policies & Documents

##### Model knowledge

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [mmlu-business-ethics](suites/english/mmlu-business-ethics.json) | business_ethics | english | accuracy |
| [mmlu-management](suites/english/mmlu-management.json) | management | english | accuracy |
| [mmlu-marketing](suites/english/mmlu-marketing.json) | marketing | english | accuracy |
| [mmlu-pro-business](suites/english/mmlu-pro-business.json) | business | english | accuracy |
| [mmlu-professional-accounting](suites/english/mmlu-professional-accounting.json) | professional_accounting | english | accuracy |

##### Classification / decision

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [jevbench-hard-policies](suites/english/jevbench-hard-policies.json) | long_policy | english | accuracy |
| [jevbench-original-policies](suites/english/jevbench-original-policies.json) | policy | english | accuracy |
| [jevtest-support-subset](suites/english/jevtest-support-subset.json) | semantic assertions | english | accuracy |

##### Ranking — supplied context

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [passage-rerank-fiqa](suites/english/passage-rerank-fiqa.json) | financial | english | ndcg_at_10 |

#### Coding

##### Model knowledge

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [codemmlu-api-frameworks](suites/english/codemmlu-api-frameworks.json) | api_frameworks | english | accuracy |
| [codemmlu-dbms-sql](suites/english/codemmlu-dbms-sql.json) | dbms_sql | english | accuracy |
| [codemmlu-others](suites/english/codemmlu-others.json) | others | english | accuracy |
| [codemmlu-programming-syntax](suites/english/codemmlu-programming-syntax.json) | programming_syntax | english | accuracy |
| [codemmlu-software-principles](suites/english/codemmlu-software-principles.json) | software_principles | english | accuracy |
| [mmlu-college-computer-science](suites/english/mmlu-college-computer-science.json) | college_computer_science | english | accuracy |
| [mmlu-high-school-computer-science](suites/english/mmlu-high-school-computer-science.json) | high_school_computer_science | english | accuracy |
| [mmlu-pro-computer-science](suites/english/mmlu-pro-computer-science.json) | computer science | english | accuracy |

##### Classification / decision

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [bigclonebench-test](suites/english/bigclonebench-test.json) | clone detection | english | f1 |
| [codecomplex-test](suites/english/codecomplex-test.json) | complexity | english | accuracy |
| [codemmlu-code-completion](suites/english/codemmlu-code-completion.json) | code_completion | english | accuracy |
| [codemmlu-code-repair](suites/english/codemmlu-code-repair.json) | code_repair | english | accuracy |
| [codemmlu-execution-prediction](suites/english/codemmlu-execution-prediction.json) | execution_prediction | english | accuracy |
| [codemmlu-fill-in-the-middle](suites/english/codemmlu-fill-in-the-middle.json) | fill_in_the_middle | english | accuracy |

##### Ranking — supplied context

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [passage-rerank-bright-stackoverflow](suites/english/passage-rerank-bright-stackoverflow.json) | reasoning intensive | english | ndcg_at_10 |
| [passage-rerank-csn-python](suites/english/passage-rerank-csn-python.json) | code | english | ndcg_at_10 |

#### Security

##### Model knowledge

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [cybermetric](suites/english/cybermetric.json) | cybermetric | english | accuracy |
| [mmlu-computer-security](suites/english/mmlu-computer-security.json) | computer_security | english | accuracy |
| [secqa-v1](suites/english/secqa-v1.json) | secqa v1 | english | accuracy |
| [secqa-v2](suites/english/secqa-v2.json) | secqa v2 | english | accuracy |

##### Classification / decision

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [jevbench-hard-security](suites/english/jevbench-hard-security.json) | adversarial | english | accuracy |
| [phishing-verdict](suites/english/phishing-verdict.json) | phishing | english | accuracy |
| [security-code](suites/english/security-code.json) | code vulnerability | english | auroc_successful_only |

##### Ranking — supplied context

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [cybersec-attack-retrieval](suites/english/cybersec-attack-retrieval.json) | cybersec attack retrieval | english | ndcg_at_10 |
| [cybersec-cve-similarity](suites/english/cybersec-cve-similarity.json) | cybersec cve similarity | english | ndcg_at_10 |
| [cybersec-cwe-retrieval](suites/english/cybersec-cwe-retrieval.json) | cybersec cwe retrieval | english | ndcg_at_10 |
| [cybersec-sigma-retrieval](suites/english/cybersec-sigma-retrieval.json) | cybersec sigma retrieval | english | ndcg_at_10 |
| [cybersec-soc-playbook](suites/english/cybersec-soc-playbook.json) | cybersec soc playbook | english | ndcg_at_10 |
| [cybersec-threat-report-retrieval](suites/english/cybersec-threat-report-retrieval.json) | cybersec threat report retrieval | english | ndcg_at_10 |

#### Agentic

##### Model knowledge

No dedicated suite added yet.

##### Classification / decision

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [jevbench-easy-agentic](suites/english/jevbench-easy-agentic.json) | tool_selection | english | accuracy |
| [jevbench-hard-agentic](suites/english/jevbench-hard-agentic.json) | routing_hard | english | accuracy |
| [jevbench-original-agentic](suites/english/jevbench-original-agentic.json) | routing | english | accuracy |
| [metatool-awareness](suites/english/metatool-awareness.json) | metatool awareness | english | accuracy |
| [npc-clean](suites/english/npc-clean.json) | dialogue addressing | english | exact_set_accuracy |
| [npc-stt-misheard](suites/english/npc-stt-misheard.json) | dialogue addressing | english | exact_set_accuracy |
| [npc-stt](suites/english/npc-stt.json) | dialogue addressing | english | exact_set_accuracy |

##### Ranking — supplied context

No dedicated suite added yet.

#### Legal

##### Model knowledge

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [mmlu-international-law](suites/english/mmlu-international-law.json) | international_law | english | accuracy |
| [mmlu-jurisprudence](suites/english/mmlu-jurisprudence.json) | jurisprudence | english | accuracy |
| [mmlu-pro-law](suites/english/mmlu-pro-law.json) | law | english | accuracy |
| [mmlu-professional-law](suites/english/mmlu-professional-law.json) | professional_law | english | accuracy |

##### Classification / decision

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [legal-casehold](suites/english/legal-casehold.json) | legal casehold | english | accuracy |
| [legal-contractnli](suites/english/legal-contractnli.json) | legal contractnli | english | accuracy |
| [legal-unfair-tos](suites/english/legal-unfair-tos.json) | legal unfair tos | english | f1 |

##### Ranking — supplied context

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [legal-rag-contractnli](suites/english/legal-rag-contractnli.json) | legal rag contractnli | english | ndcg_at_10 |
| [legal-rag-cuad](suites/english/legal-rag-cuad.json) | legal rag cuad | english | ndcg_at_10 |
| [legal-rag-maud](suites/english/legal-rag-maud.json) | legal rag maud | english | ndcg_at_10 |
| [legal-rag-privacy-qa](suites/english/legal-rag-privacy-qa.json) | legal rag privacy qa | english | ndcg_at_10 |

#### General language & Others

##### Model knowledge

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [mmlu-abstract-algebra](suites/english/mmlu-abstract-algebra.json) | abstract_algebra | english | accuracy |
| [mmlu-anatomy](suites/english/mmlu-anatomy.json) | anatomy | english | accuracy |
| [mmlu-astronomy](suites/english/mmlu-astronomy.json) | astronomy | english | accuracy |
| [mmlu-clinical-knowledge](suites/english/mmlu-clinical-knowledge.json) | clinical_knowledge | english | accuracy |
| [mmlu-college-biology](suites/english/mmlu-college-biology.json) | college_biology | english | accuracy |
| [mmlu-college-chemistry](suites/english/mmlu-college-chemistry.json) | college_chemistry | english | accuracy |
| [mmlu-college-mathematics](suites/english/mmlu-college-mathematics.json) | college_mathematics | english | accuracy |
| [mmlu-college-medicine](suites/english/mmlu-college-medicine.json) | college_medicine | english | accuracy |
| [mmlu-college-physics](suites/english/mmlu-college-physics.json) | college_physics | english | accuracy |
| [mmlu-conceptual-physics](suites/english/mmlu-conceptual-physics.json) | conceptual_physics | english | accuracy |
| [mmlu-econometrics](suites/english/mmlu-econometrics.json) | econometrics | english | accuracy |
| [mmlu-electrical-engineering](suites/english/mmlu-electrical-engineering.json) | electrical_engineering | english | accuracy |
| [mmlu-elementary-mathematics](suites/english/mmlu-elementary-mathematics.json) | elementary_mathematics | english | accuracy |
| [mmlu-formal-logic](suites/english/mmlu-formal-logic.json) | formal_logic | english | accuracy |
| [mmlu-global-facts](suites/english/mmlu-global-facts.json) | global_facts | english | accuracy |
| [mmlu-high-school-biology](suites/english/mmlu-high-school-biology.json) | high_school_biology | english | accuracy |
| [mmlu-high-school-chemistry](suites/english/mmlu-high-school-chemistry.json) | high_school_chemistry | english | accuracy |
| [mmlu-high-school-european-history](suites/english/mmlu-high-school-european-history.json) | high_school_european_history | english | accuracy |
| [mmlu-high-school-geography](suites/english/mmlu-high-school-geography.json) | high_school_geography | english | accuracy |
| [mmlu-high-school-government-and-politics](suites/english/mmlu-high-school-government-and-politics.json) | high_school_government_and_politics | english | accuracy |
| [mmlu-high-school-macroeconomics](suites/english/mmlu-high-school-macroeconomics.json) | high_school_macroeconomics | english | accuracy |
| [mmlu-high-school-mathematics](suites/english/mmlu-high-school-mathematics.json) | high_school_mathematics | english | accuracy |
| [mmlu-high-school-microeconomics](suites/english/mmlu-high-school-microeconomics.json) | high_school_microeconomics | english | accuracy |
| [mmlu-high-school-physics](suites/english/mmlu-high-school-physics.json) | high_school_physics | english | accuracy |
| [mmlu-high-school-psychology](suites/english/mmlu-high-school-psychology.json) | high_school_psychology | english | accuracy |
| [mmlu-high-school-statistics](suites/english/mmlu-high-school-statistics.json) | high_school_statistics | english | accuracy |
| [mmlu-high-school-us-history](suites/english/mmlu-high-school-us-history.json) | high_school_us_history | english | accuracy |
| [mmlu-high-school-world-history](suites/english/mmlu-high-school-world-history.json) | high_school_world_history | english | accuracy |
| [mmlu-human-aging](suites/english/mmlu-human-aging.json) | human_aging | english | accuracy |
| [mmlu-human-sexuality](suites/english/mmlu-human-sexuality.json) | human_sexuality | english | accuracy |
| [mmlu-logical-fallacies](suites/english/mmlu-logical-fallacies.json) | logical_fallacies | english | accuracy |
| [mmlu-machine-learning](suites/english/mmlu-machine-learning.json) | machine_learning | english | accuracy |
| [mmlu-medical-genetics](suites/english/mmlu-medical-genetics.json) | medical_genetics | english | accuracy |
| [mmlu-miscellaneous](suites/english/mmlu-miscellaneous.json) | miscellaneous | english | accuracy |
| [mmlu-moral-disputes](suites/english/mmlu-moral-disputes.json) | moral_disputes | english | accuracy |
| [mmlu-moral-scenarios](suites/english/mmlu-moral-scenarios.json) | moral_scenarios | english | accuracy |
| [mmlu-nutrition](suites/english/mmlu-nutrition.json) | nutrition | english | accuracy |
| [mmlu-philosophy](suites/english/mmlu-philosophy.json) | philosophy | english | accuracy |
| [mmlu-prehistory](suites/english/mmlu-prehistory.json) | prehistory | english | accuracy |
| [mmlu-pro-biology](suites/english/mmlu-pro-biology.json) | biology | english | accuracy |
| [mmlu-pro-chemistry](suites/english/mmlu-pro-chemistry.json) | chemistry | english | accuracy |
| [mmlu-pro-economics](suites/english/mmlu-pro-economics.json) | economics | english | accuracy |
| [mmlu-pro-engineering](suites/english/mmlu-pro-engineering.json) | engineering | english | accuracy |
| [mmlu-pro-health](suites/english/mmlu-pro-health.json) | health | english | accuracy |
| [mmlu-pro-history](suites/english/mmlu-pro-history.json) | history | english | accuracy |
| [mmlu-pro-math](suites/english/mmlu-pro-math.json) | math | english | accuracy |
| [mmlu-pro-other](suites/english/mmlu-pro-other.json) | other | english | accuracy |
| [mmlu-pro-philosophy](suites/english/mmlu-pro-philosophy.json) | philosophy | english | accuracy |
| [mmlu-pro-physics](suites/english/mmlu-pro-physics.json) | physics | english | accuracy |
| [mmlu-pro-psychology](suites/english/mmlu-pro-psychology.json) | psychology | english | accuracy |
| [mmlu-professional-medicine](suites/english/mmlu-professional-medicine.json) | professional_medicine | english | accuracy |
| [mmlu-professional-psychology](suites/english/mmlu-professional-psychology.json) | professional_psychology | english | accuracy |
| [mmlu-public-relations](suites/english/mmlu-public-relations.json) | public_relations | english | accuracy |
| [mmlu-security-studies](suites/english/mmlu-security-studies.json) | security_studies | english | accuracy |
| [mmlu-sociology](suites/english/mmlu-sociology.json) | sociology | english | accuracy |
| [mmlu-us-foreign-policy](suites/english/mmlu-us-foreign-policy.json) | us_foreign_policy | english | accuracy |
| [mmlu-virology](suites/english/mmlu-virology.json) | virology | english | accuracy |
| [mmlu-world-religions](suites/english/mmlu-world-religions.json) | world_religions | english | accuracy |

##### Classification / decision

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [jevbench-easy-general](suites/english/jevbench-easy-general.json) | intent, fact, extraction | english | accuracy |
| [jevbench-hard-general](suites/english/jevbench-hard-general.json) | multi_hop, judge_hard, temporal_numeric, probability, trap, ambiguous, tradeoff | english | accuracy |
| [jevbench-original-general](suites/english/jevbench-original-general.json) | intent, ordinal, extraction, adequacy | english | accuracy |
| [korean-public-en-en](suites/english/korean-public-en-en.json) | reading and equivalence | english | accuracy |
| [semif-authored](suites/english/semif-authored.json) | mixed reasoning | english | mean_family_balanced_accuracy |
| [semif-perturbations](suites/english/semif-perturbations.json) | mixed reasoning | english | mean_family_balanced_accuracy |
| [semif-typesafe](suites/english/semif-typesafe.json) | mixed reasoning | english | equal_case_modal_agreement |
| [semif-wanli](suites/english/semif-wanli.json) | natural language inference | english | mean_family_balanced_accuracy |

##### Ranking — supplied context

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [passage-rerank-bright-biology](suites/english/passage-rerank-bright-biology.json) | reasoning intensive | english | ndcg_at_10 |
| [passage-rerank-bright-earth_science](suites/english/passage-rerank-bright-earth_science.json) | reasoning intensive | english | ndcg_at_10 |
| [passage-rerank-bright-economics](suites/english/passage-rerank-bright-economics.json) | reasoning intensive | english | ndcg_at_10 |
| [passage-rerank-bright-psychology](suites/english/passage-rerank-bright-psychology.json) | reasoning intensive | english | ndcg_at_10 |
| [passage-rerank-bright-robotics](suites/english/passage-rerank-bright-robotics.json) | reasoning intensive | english | ndcg_at_10 |
| [passage-rerank-bright-sustainable_living](suites/english/passage-rerank-bright-sustainable_living.json) | reasoning intensive | english | ndcg_at_10 |
| [passage-rerank-nfcorpus](suites/english/passage-rerank-nfcorpus.json) | medical | english | ndcg_at_10 |
| [passage-rerank-nq](suites/english/passage-rerank-nq.json) | general qa | english | ndcg_at_10 |
| [passage-rerank-scifact](suites/english/passage-rerank-scifact.json) | scientific | english | ndcg_at_10 |
| [passage-rerank-trec-covid](suites/english/passage-rerank-trec-covid.json) | medical | english | ndcg_at_10 |

### Multilingual

#### Corporate Policies & Documents

##### Model knowledge

No dedicated suite added yet.

##### Classification / decision

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [jevfire-fields](suites/multilingual/jevfire-fields.json) | structured extraction | multilingual | exact_case_accuracy |

##### Ranking — supplied context

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [rag-frozen](suites/non-english/rag-frozen.json) | rag evidence | non-english | recall_at_5 |

#### Coding

##### Model knowledge

No dedicated suite added yet.

##### Classification / decision

No dedicated suite added yet.

##### Ranking — supplied context

No dedicated suite added yet.

#### Security

##### Model knowledge

No dedicated suite added yet.

##### Classification / decision

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [security-injection-no-context](suites/multilingual/security-injection-no-context.json) | prompt injection | multilingual | auroc_successful_only |
| [security-injection](suites/multilingual/security-injection.json) | prompt injection | multilingual | auroc_successful_only |

##### Ranking — supplied context

No dedicated suite added yet.

#### Agentic

##### Model knowledge

No dedicated suite added yet.

##### Classification / decision

No dedicated suite added yet.

##### Ranking — supplied context

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [search-rerank-en-final](suites/multilingual/search-rerank-en-final.json) | catalog search | multilingual | ndcg_at_10 |
| [search-rerank-en-llm](suites/multilingual/search-rerank-en-llm.json) | catalog search | multilingual | ndcg_at_10 |
| [search-rerank-mix-final](suites/multilingual/search-rerank-mix-final.json) | catalog search | multilingual | ndcg_at_10 |
| [search-rerank-mix-llm](suites/multilingual/search-rerank-mix-llm.json) | catalog search | multilingual | ndcg_at_10 |
| [search-rerank-sim-final](suites/multilingual/search-rerank-sim-final.json) | catalog search | multilingual | ndcg_at_10 |
| [search-rerank-sim-llm](suites/multilingual/search-rerank-sim-llm.json) | catalog search | multilingual | ndcg_at_10 |
| [search-rerank-syn-final](suites/multilingual/search-rerank-syn-final.json) | catalog search | multilingual | ndcg_at_10 |
| [search-rerank-syn-llm](suites/multilingual/search-rerank-syn-llm.json) | catalog search | multilingual | ndcg_at_10 |
| [toolret-code](suites/multilingual/toolret-code.json) | toolret code | multilingual | ndcg_at_10 |
| [toolret-customized](suites/multilingual/toolret-customized.json) | toolret customized | multilingual | ndcg_at_10 |
| [toolret-web](suites/multilingual/toolret-web.json) | toolret web | multilingual | ndcg_at_10 |

#### Legal

##### Model knowledge

No dedicated suite added yet.

##### Classification / decision

No dedicated suite added yet.

##### Ranking — supplied context

No dedicated suite added yet.

#### General language & Others

##### Model knowledge

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [korean-public-ko-en-knowledge](suites/non-english/korean-public-ko-en-knowledge.json) | kormed | non-english | accuracy |
| [korean-public-ko-ko-knowledge](suites/non-english/korean-public-ko-ko-knowledge.json) | kormed | non-english | accuracy |

##### Classification / decision

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [korean-public-ko-en-context](suites/non-english/korean-public-ko-en-context.json) | belebele, pawsx | non-english | accuracy |
| [korean-public-ko-ko-context](suites/non-english/korean-public-ko-ko-context.json) | belebele, pawsx | non-english | accuracy |

##### Ranking — supplied context

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [passage-rerank-miracl-fr](suites/non-english/passage-rerank-miracl-fr.json) | general qa | non-english | ndcg_at_10 |

## Vision

### English

#### Object presence / detection

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [vision-mme-perception-presence](suites/english/vision-mme-perception-presence.json) | existence | english | mme_score |
| [vision-pope-adversarial](suites/english/vision-pope-adversarial.json) | object presence | english | f1 |
| [vision-pope-popular](suites/english/vision-pope-popular.json) | object presence | english | f1 |
| [vision-pope-random](suites/english/vision-pope-random.json) | object presence | english | f1 |

#### Counting

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [vision-mme-perception-counting](suites/english/vision-mme-perception-counting.json) | count | english | mme_score |
| [vision-tallyqa](suites/english/vision-tallyqa.json) | counting | english | accuracy |

#### Identification

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [vision-cifar10](suites/english/vision-cifar10.json) | object classification | english | accuracy |
| [vision-mme-perception-identification](suites/english/vision-mme-perception-identification.json) | posters, celebrity, scene, landmark, artwork | english | mme_score |
| [vision-oxford-pets](suites/english/vision-oxford-pets.json) | fine grained identification | english | accuracy |

#### Spatial reasoning & attributes

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [vision-mme-perception-spatial-attributes](suites/english/vision-mme-perception-spatial-attributes.json) | position, color | english | mme_score |

#### OCR

| Suite | Task detail | Language group | Main metric / execution |
| --- | --- | --- | --- |
| [vision-mme-perception-ocr](suites/english/vision-mme-perception-ocr.json) | OCR | english | mme_score |

### Multilingual

No suites added yet.

## Grouping rules

- **One placement per eval.** Text uses a domain category followed by model knowledge, classification/decision, or ranking. Original task detail remains metadata.
- **Language group, languages and modality** remain separate manifest fields. English describes question/framing language; image text may differ.
- **Conditions are separate suites**, not new capabilities: clean/STT, question language, negative sampling, independent/final labels, and context ablations.
- **Knowledge is not the same as classification.** Model knowledge tests ask for facts/domain answers without a supporting reference passage. Classification/decision tests may use supplied evidence and learned reasoning. Ranking tests supply candidate information but can still require learned concepts; these are task placements, not proof of zero knowledge dependence.
- **Mixed benchmarks are split using upstream labels.** MME, JevBench and Korean knowledge/context conditions have disjoint child suites; original aggregate manifests remain available but are omitted from the category tables to avoid duplication. See [split definitions](SPLIT_SUITES.md). Object presence tests do not imply bounding-box detection.
- **Domain placement:** code retrieval is Coding / Ranking; tool catalog retrieval is Agentic / Ranking; financial retrieval and RAG evidence are Corporate Policies & Documents. General language & Others is the final catch-all, including broad scientific and general retrieval.
- **Difficulty and domain are not quality rankings.** JevBench tiers are separate conditions; medical/security labels do not imply a specialist model is required.
- **Do not average unlike metrics.** MME score, Brier, accuracy, F1 and NDCG have different meanings. Related variants also share data.
- **Availability is independent of classification.** Suites may need local data preparation before execution.

## Scope and preparation

- [Availability audit and removed entries](AVAILABILITY_AUDIT.md)
- [Core eval framework and SemIf](README.md)
- [Knowledge benchmarks](KNOWLEDGE_SUITES.md)
- [Category and project reporting](REPORTING.md)
- [Code classification](CODING_SUITES.md)
- [Legal, tool and security benchmarks](DOMAIN_BENCHMARKS.md)
- [JevBench, JEVfire and RAG](EXTERNAL_SUITES.md)
- [Korean study, catalog search and jevtest](ADDITIONAL_SUITES.md)
- [NPC, security, phishing and passage retrieval](SECURITY_AND_WORKFLOW_SUITES.md)
- [Image classification](VISION_SUITES.md)
- [MME, POPE and TallyQA](VISUAL_QA_SUITES.md)

Regenerate with `python3 eval/catalog.py --write-doc`.
