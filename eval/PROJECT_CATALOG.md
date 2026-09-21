# Named evaluation projects

The result reporter recomputes full project/configuration scores from predictions.
Category partitions are views of the same examples, not separate benchmarks.

| Project | Configuration | Run manifest(s) | Metric |
| --- | --- | --- | --- |
| BigCloneBench | bigclonebench-test | [bigclonebench-test](suites/english/bigclonebench-test.json) | f1 |
| CIFAR-10 | test | [vision-cifar10](suites/english/vision-cifar10.json) | accuracy |
| CodeComplex | codecomplex-test | [codecomplex-test](suites/english/codecomplex-test.json) | accuracy |
| CodeMMLU | valid-choice release | [codemmlu-full](suites/english/codemmlu-full.json) | accuracy |
| ContractNLI | contractnli | [legal-contractnli](suites/english/legal-contractnli.json) | accuracy |
| CyberMetric | 10000-v1 released rows | [cybermetric](suites/english/cybermetric.json) | accuracy |
| CyberSec Retrieval | frozen BM25 reranking | [cybersec-attack-retrieval](suites/english/cybersec-attack-retrieval.json), [cybersec-cve-similarity](suites/english/cybersec-cve-similarity.json), [cybersec-cwe-retrieval](suites/english/cybersec-cwe-retrieval.json), [cybersec-sigma-retrieval](suites/english/cybersec-sigma-retrieval.json), [cybersec-soc-playbook](suites/english/cybersec-soc-playbook.json), [cybersec-threat-report-retrieval](suites/english/cybersec-threat-report-retrieval.json) | ndcg_at_10 |
| JEVfire | jevfire-fields | [jevfire-fields](suites/multilingual/jevfire-fields.json) | exact_case_accuracy |
| Jev Korean benchmark | en-en | [korean-public-en-en](suites/english/korean-public-en-en.json) | accuracy |
| Jev Korean benchmark | ko-en | [korean-public-ko-en](suites/non-english/korean-public-ko-en.json) | accuracy |
| Jev Korean benchmark | ko-ko | [korean-public-ko-ko](suites/non-english/korean-public-ko-ko.json) | accuracy |
| Jev Phishing Bench | phishing-verdict | [phishing-verdict](suites/english/phishing-verdict.json) | accuracy |
| Jev RAG Benchmark | rag-frozen | [rag-frozen](suites/non-english/rag-frozen.json) | recall_at_5 |
| Jev Rerank Bench | bright-biology | [passage-rerank-bright-biology](suites/english/passage-rerank-bright-biology.json) | ndcg_at_10 |
| Jev Rerank Bench | bright-earth_science | [passage-rerank-bright-earth_science](suites/english/passage-rerank-bright-earth_science.json) | ndcg_at_10 |
| Jev Rerank Bench | bright-economics | [passage-rerank-bright-economics](suites/english/passage-rerank-bright-economics.json) | ndcg_at_10 |
| Jev Rerank Bench | bright-psychology | [passage-rerank-bright-psychology](suites/english/passage-rerank-bright-psychology.json) | ndcg_at_10 |
| Jev Rerank Bench | bright-robotics | [passage-rerank-bright-robotics](suites/english/passage-rerank-bright-robotics.json) | ndcg_at_10 |
| Jev Rerank Bench | bright-stackoverflow | [passage-rerank-bright-stackoverflow](suites/english/passage-rerank-bright-stackoverflow.json) | ndcg_at_10 |
| Jev Rerank Bench | bright-sustainable_living | [passage-rerank-bright-sustainable_living](suites/english/passage-rerank-bright-sustainable_living.json) | ndcg_at_10 |
| Jev Rerank Bench | csn-python | [passage-rerank-csn-python](suites/english/passage-rerank-csn-python.json) | ndcg_at_10 |
| Jev Rerank Bench | fiqa | [passage-rerank-fiqa](suites/english/passage-rerank-fiqa.json) | ndcg_at_10 |
| Jev Rerank Bench | miracl-fr | [passage-rerank-miracl-fr](suites/non-english/passage-rerank-miracl-fr.json) | ndcg_at_10 |
| Jev Rerank Bench | nfcorpus | [passage-rerank-nfcorpus](suites/english/passage-rerank-nfcorpus.json) | ndcg_at_10 |
| Jev Rerank Bench | nq | [passage-rerank-nq](suites/english/passage-rerank-nq.json) | ndcg_at_10 |
| Jev Rerank Bench | scifact | [passage-rerank-scifact](suites/english/passage-rerank-scifact.json) | ndcg_at_10 |
| Jev Rerank Bench | trec-covid | [passage-rerank-trec-covid](suites/english/passage-rerank-trec-covid.json) | ndcg_at_10 |
| Jev Search Rerank | en-final | [search-rerank-en-final](suites/multilingual/search-rerank-en-final.json) | ndcg_at_10 |
| Jev Search Rerank | en-llm | [search-rerank-en-llm](suites/multilingual/search-rerank-en-llm.json) | ndcg_at_10 |
| Jev Search Rerank | mix-final | [search-rerank-mix-final](suites/multilingual/search-rerank-mix-final.json) | ndcg_at_10 |
| Jev Search Rerank | mix-llm | [search-rerank-mix-llm](suites/multilingual/search-rerank-mix-llm.json) | ndcg_at_10 |
| Jev Search Rerank | sim-final | [search-rerank-sim-final](suites/multilingual/search-rerank-sim-final.json) | ndcg_at_10 |
| Jev Search Rerank | sim-llm | [search-rerank-sim-llm](suites/multilingual/search-rerank-sim-llm.json) | ndcg_at_10 |
| Jev Search Rerank | syn-final | [search-rerank-syn-final](suites/multilingual/search-rerank-syn-final.json) | ndcg_at_10 |
| Jev Search Rerank | syn-llm | [search-rerank-syn-llm](suites/multilingual/search-rerank-syn-llm.json) | ndcg_at_10 |
| Jev Sec Bench | code | [security-code](suites/english/security-code.json) | auroc_successful_only |
| Jev Sec Bench | injection | [security-injection](suites/multilingual/security-injection.json) | auroc_successful_only |
| Jev Sec Bench | injection-no-context | [security-injection-no-context](suites/multilingual/security-injection-no-context.json) | auroc_successful_only |
| JevBench | easy | [jevbench-easy](suites/english/jevbench-easy.json) | accuracy |
| JevBench | hard | [jevbench-hard](suites/english/jevbench-hard.json) | accuracy |
| JevBench | original | [jevbench-original](suites/english/jevbench-original.json) | accuracy |
| Jevtest | jevtest-support-subset | [jevtest-support-subset](suites/english/jevtest-support-subset.json) | accuracy |
| LegalBench-RAG | frozen BM25 reranking | [legal-rag-contractnli](suites/english/legal-rag-contractnli.json), [legal-rag-cuad](suites/english/legal-rag-cuad.json), [legal-rag-maud](suites/english/legal-rag-maud.json), [legal-rag-privacy-qa](suites/english/legal-rag-privacy-qa.json) | ndcg_at_10 |
| LexGLUE | casehold | [legal-casehold](suites/english/legal-casehold.json) | accuracy |
| LexGLUE | unfair-tos | [legal-unfair-tos](suites/english/legal-unfair-tos.json) | f1 |
| MME | perception | [vision-mme-perception](suites/english/vision-mme-perception.json) | mme_score |
| MMLU | full test | [mmlu-full](suites/english/mmlu-full.json) | accuracy |
| MMLU-Pro | full test | [mmlu-pro](suites/english/mmlu-pro.json) | accuracy |
| MetaTool | tool awareness | [metatool-awareness](suites/english/metatool-awareness.json) | accuracy |
| Oxford-IIIT Pets | test | [vision-oxford-pets](suites/english/vision-oxford-pets.json) | accuracy |
| POPE | adversarial | [vision-pope-adversarial](suites/english/vision-pope-adversarial.json) | f1 |
| POPE | popular | [vision-pope-popular](suites/english/vision-pope-popular.json) | f1 |
| POPE | random | [vision-pope-random](suites/english/vision-pope-random.json) | f1 |
| SecQA | v1 | [secqa-v1](suites/english/secqa-v1.json) | accuracy |
| SecQA | v2 | [secqa-v2](suites/english/secqa-v2.json) | accuracy |
| SemIf | authored | [semif-authored](suites/english/semif-authored.json) | mean_family_balanced_accuracy |
| SemIf | perturbations | [semif-perturbations](suites/english/semif-perturbations.json) | mean_family_balanced_accuracy |
| SemIf | typesafe | [semif-typesafe](suites/english/semif-typesafe.json) | equal_case_modal_agreement |
| SemIf | wanli | [semif-wanli](suites/english/semif-wanli.json) | mean_family_balanced_accuracy |
| TallyQA | test | [vision-tallyqa](suites/english/vision-tallyqa.json) | accuracy |
| ToolRet | query-only BM25 reranking | [toolret-code](suites/multilingual/toolret-code.json), [toolret-customized](suites/multilingual/toolret-customized.json), [toolret-web](suites/multilingual/toolret-web.json) | ndcg_at_10 |
| wondertwins/jev-benchmark | clean | [npc-clean](suites/english/npc-clean.json) | exact_set_accuracy |
| wondertwins/jev-benchmark | stt | [npc-stt](suites/english/npc-stt.json) | exact_set_accuracy |
| wondertwins/jev-benchmark | stt-misheard | [npc-stt-misheard](suites/english/npc-stt-misheard.json) | exact_set_accuracy |
