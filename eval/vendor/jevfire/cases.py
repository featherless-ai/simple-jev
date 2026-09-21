"""Synthetic, hand-labeled fixtures; no patient or production data."""


def enum(description, choices):
    return {"type": "enum", "description": description, "choices": choices}


def boolean(description):
    return {"type": "boolean", "description": description}


def benchmark_cases():
    intent = {
        "intent": enum(
            "Classify the request: comprehensive patient record summary, medication question, or other.",
            ["patient_summary", "medication_question", "other"],
        )
    }
    cases = [
        {
            "id": "intent_es",
            "context": "Resume toda la historia clínica del paciente, incluidos antecedentes, alergias y tratamientos.",
            "schema": intent,
            "expected": {"intent": "patient_summary"},
        },
        {
            "id": "intent_en",
            "context": "What medications is this patient currently taking?",
            "schema": intent,
            "expected": {"intent": "medication_question"},
        },
        {
            "id": "intent_negation",
            "context": "No quiero un resumen ni información de medicamentos. Traduce la última nota al inglés.",
            "schema": intent,
            "expected": {"intent": "other"},
        },
    ]
    facts_schema = {
        "smoking": enum(
            "Current smoking status. Former means stopped smoking; never means explicitly never smoked; unknown means not stated.",
            ["current", "former", "never", "unknown"],
        ),
        "allergy": enum(
            "Whether any drug allergy is documented as present, explicitly absent, or not mentioned.",
            ["present", "absent", "not_mentioned"],
        ),
        "takes_medication": enum(
            "Whether current medication use is explicitly stated, explicitly denied, or unknown.",
            ["yes", "no", "unknown"],
        ),
        "has_followup": boolean(
            "Is a future follow-up appointment explicitly planned?"
        ),
    }
    cases.extend(
        [
            {
                "id": "facts_es",
                "context": "Paciente sintético. Dejó de fumar hace cinco años. Alergia conocida a penicilina. Actualmente toma metformina. Revisión programada en un mes.",
                "schema": facts_schema,
                "expected": {
                    "smoking": "former",
                    "allergy": "present",
                    "takes_medication": "yes",
                    "has_followup": True,
                },
            },
            {
                "id": "facts_negative",
                "context": "Synthetic record. Never smoked. No known drug allergies. Takes no medications. No follow-up appointment planned.",
                "schema": facts_schema,
                "expected": {
                    "smoking": "never",
                    "allergy": "absent",
                    "takes_medication": "no",
                    "has_followup": False,
                },
            },
            {
                "id": "facts_unknown",
                "context": "Synthetic administrative note. The patient updated their mailing address. A follow-up appointment was booked for Friday.",
                "schema": facts_schema,
                "expected": {
                    "smoking": "unknown",
                    "allergy": "not_mentioned",
                    "takes_medication": "unknown",
                    "has_followup": True,
                },
            },
            {
                "id": "shared_prefix_labels",
                "context": "The selected product is the extended-release version of metformin, not the immediate-release version.",
                "schema": {
                    "product": enum(
                        "Select the exact product described.",
                        [
                            "metformin immediate release",
                            "metformin extended release",
                            "metoprolol extended release",
                        ],
                    )
                },
                "expected": {"product": "metformin extended release"},
            },
        ]
    )
    # Scaling fixtures deliberately isolate decoding cost and typed correctness.
    # They are not a measure of broad clinical or reasoning ability.
    flags = [
        "payment_failure",
        "database_outage",
        "data_loss",
        "customer_impact",
        "security_incident",
        "network_outage",
        "backup_available",
        "rollback_ready",
        "oncall_notified",
        "vendor_notified",
        "status_page_updated",
        "incident_resolved",
        "logs_available",
        "metrics_available",
        "traces_available",
        "reproduction_available",
        "billing_affected",
        "login_affected",
        "search_affected",
        "mobile_affected",
        "web_affected",
        "api_affected",
        "eu_affected",
        "us_affected",
        "workaround_available",
        "maintenance_planned",
        "customer_notified",
        "postmortem_required",
    ]
    for n in [4, 12, 28]:
        active = flags[:n]
        expected = {name: (i % 3 != 1) for i, name in enumerate(active)}
        context = "Synthetic incident report. Verified incident facts:\n" + "\n".join(
            f"{name.replace('_', ' ')}: {'confirmed' if value else 'explicitly ruled out'}."
            for name, value in expected.items()
        )
        cases.append(
            {
                "id": f"scale_{n}",
                "context": context,
                "schema": {
                    name: boolean(
                        f"Whether {name.replace('_', ' ')} is confirmed in the incident report."
                    )
                    for name in active
                },
                "expected": expected,
            }
        )
    large = next(case for case in cases if case["id"] == "scale_12")
    for repeats in (150, 450):
        cases.append(
            {
                **large,
                "id": f"long_context_{repeats}",
                "context": (
                    "Background archive (administrative text, not incident evidence):\n"
                    + "The office archive was catalogued and indexed for later administrative review. "
                    * repeats
                    + "\nCurrent incident evidence follows:\n"
                    + large["context"]
                ),
            }
        )
    choices = [f"CATALOG-{i:03d}" for i in range(255)]
    cases.append(
        {
            "id": "cardinality_255",
            "context": "The approved inventory category is exactly CATALOG-173. Choose that exact category.",
            "schema": {
                "category": enum(
                    "Select the approved inventory category explicitly named in the context.",
                    choices,
                )
            },
            "expected": {"category": "CATALOG-173"},
        }
    )
    return cases
