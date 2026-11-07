
def calculate_risk(customer):
    """
    Transparent baseline risk scoring engine.
    This is a prototype scoring model, not a calibrated
    probability of loan default.
    """

    income_drop = max(0, -customer["income_change_pct"])
    debt_growth = max(0, customer["debt_growth_pct"])

    income_score = min(100, income_drop * 3)
    dti_score = min(100, customer["debt_to_income"] * 100)
    debt_score = min(100, debt_growth * 2)

    avg_delay = customer["average_delay_days"]
    payment_score = min(100, avg_delay * 12)

    persistence_score = min(
        100,
        customer["warning_months"] * 25
    )

    components = {
        "income_decline": round(income_score, 2),
        "debt_exposure": round(debt_score, 2),
        "debt_to_income": round(dti_score, 2),
        "repayment_irregularity": round(payment_score, 2),
        "warning_persistence": round(persistence_score, 2)
    }

    weights = {
        "income_decline": 0.25,
        "debt_exposure": 0.20,
        "debt_to_income": 0.20,
        "repayment_irregularity": 0.20,
        "warning_persistence": 0.15
    }

    risk_index = sum(
        components[key] * weights[key]
        for key in weights
    )

    risk_index = round(risk_index)

    if risk_index >= 75:
        risk_level = "Critical"
    elif risk_index >= 50:
        risk_level = "Emerging"
    elif risk_index >= 30:
        risk_level = "Watch"
    else:
        risk_level = "Stable"

    active_signals = sum([
        income_drop >= 10,
        debt_growth >= 10,
        customer["debt_to_income"] >= 0.45,
        avg_delay >= 2
    ])

    if customer["warning_months"] >= 3 and active_signals >= 2:
        deterioration = "Sustained"
    elif customer["warning_months"] <= 1:
        deterioration = "Temporary or Unconfirmed"
    else:
        deterioration = "Developing"

    explanations = []

    if income_drop >= 10:
        explanations.append(
            f"Income declined by {income_drop:.1f}%."
        )

    if debt_growth >= 10:
        explanations.append(
            f"Debt exposure increased by {debt_growth:.1f}%."
        )

    if customer["debt_to_income"] >= 0.45:
        explanations.append(
            "Debt-to-income ratio is elevated."
        )

    if avg_delay >= 2:
        explanations.append(
            f"Average payment delay is {avg_delay:.1f} days."
        )

    if customer["warning_months"] >= 3:
        explanations.append(
            "Negative financial signals have persisted for multiple months."
        )

    if not explanations:
        explanations.append(
            "No major deterioration signals detected."
        )

    recommendations = []

    if income_drop >= 15:
        recommendations.append(
            "Contact the customer to understand the income reduction."
        )

    if debt_growth >= 15 or customer["debt_to_income"] >= 0.50:
        recommendations.append(
            "Review the customer's overall debt exposure and affordability."
        )

    if avg_delay >= 2:
        recommendations.append(
            "Review repayment behaviour and offer appropriate repayment support."
        )

    if deterioration == "Sustained":
        recommendations.append(
            "Escalate for human review and consider suitable restructuring options."
        )

    if risk_level == "Stable":
        recommendations.append(
            "Continue routine monitoring."
        )

    if not recommendations:
        recommendations.append(
            "Continue monitoring and reassess when new financial data arrives."
        )

    return {
        "risk_index": risk_index,
        "risk_level": risk_level,
        "deterioration_status": deterioration,
        "active_signals": active_signals,
        "components": components,
        "explanations": explanations,
        "recommendations": recommendations
    }
