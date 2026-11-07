
import random
from app.services.risk_engine import calculate_risk

random.seed(42)

FIRST_NAMES = [
    "Arjun", "Priya", "Rahul", "Sneha", "Karan",
    "Ananya", "Rohan", "Meera", "Vikram", "Kavya",
    "Aarav", "Divya", "Aditya", "Pooja", "Nikhil"
]

LAST_NAMES = [
    "Sharma", "Reddy", "Verma", "Patel", "Mehta",
    "Rao", "Kumar", "Iyer", "Gupta", "Nair"
]

LOAN_TYPES = [
    "Personal Loan",
    "Home Loan",
    "Business Loan",
    "Vehicle Loan",
    "Education Loan"
]


def generate_customers(count=120):
    customers = []

    for i in range(count):
        income = random.randint(25000, 180000)

        customer = {
            "id": f"CG-{1001 + i}",
            "name": (
                f"{random.choice(FIRST_NAMES)} "
                f"{random.choice(LAST_NAMES)}"
            ),
            "loan_type": random.choice(LOAN_TYPES),
            "monthly_income": income,
            "previous_income": income,
            "income_change_pct": round(
                random.uniform(-35, 8), 2
            ),
            "outstanding_amount": random.randint(
                100000, 4500000
            ),
            "debt_to_income": round(
                random.uniform(0.15, 0.75), 2
            ),
            "debt_growth_pct": round(
                random.uniform(-5, 55), 2
            ),
            "average_delay_days": round(
                random.uniform(0, 7), 2
            ),
            "warning_months": random.randint(0, 4),
            "credit_utilization": round(
                random.uniform(0.10, 0.95), 2
            ),
            "emi_amount": random.randint(3000, 35000),
            "monthly_history": []
        }

        customer["previous_income"] = round(
            income / max(
                0.65,
                1 + customer["income_change_pct"] / 100
            )
        )

        # Generate six months of illustrative history.
        base_income = customer["previous_income"]

        for month_index, month in enumerate(
            ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
        ):
            progress = (month_index + 1) / 6

            historical_income = round(
                base_income * (
                    1 + (
                        customer["income_change_pct"] / 100
                    ) * progress
                )
            )

            historical_income = max(10000, historical_income)

            historical_debt = round(
                customer["outstanding_amount"] * (
                    1 - (
                        customer["debt_growth_pct"] / 100
                    ) * (1 - progress)
                )
            )

            historical_delay = round(
                customer["average_delay_days"] * progress,
                1
            )

            customer["monthly_history"].append({
                "month": month,
                "income": historical_income,
                "outstanding_debt": historical_debt,
                "payment_delay_days": historical_delay
            })

        assessment = calculate_risk(customer)

        customer.update(assessment)
        customers.append(customer)

    return customers


CUSTOMERS = generate_customers()


def get_all_customers():
    return CUSTOMERS


def get_customer_by_id(customer_id):
    for customer in CUSTOMERS:
        if customer["id"] == customer_id:
            return customer

    return None


def get_portfolio_summary():
    total = len(CUSTOMERS)

    distribution = {
        "Stable": 0,
        "Watch": 0,
        "Emerging": 0,
        "Critical": 0
    }

    for customer in CUSTOMERS:
        distribution[customer["risk_level"]] += 1

    total_exposure = sum(
        customer["outstanding_amount"]
        for customer in CUSTOMERS
    )

    return {
        "total_customers": total,
        "total_exposure": total_exposure,
        "customers_at_risk": (
            distribution["Emerging"] +
            distribution["Critical"]
        ),
        "risk_distribution": distribution,
        "average_risk_index": round(
            sum(c["risk_index"] for c in CUSTOMERS) / total,
            2
        )
    }


def get_early_warnings():
    warnings = []

    for customer in CUSTOMERS:
        if customer["risk_level"] in ["Emerging", "Critical"]:
            warnings.append({
                "customer_id": customer["id"],
                "customer_name": customer["name"],
                "risk_level": customer["risk_level"],
                "risk_index": customer["risk_index"],
                "deterioration_status": customer["deterioration_status"],
                "explanations": customer["explanations"]
            })

    return sorted(
        warnings,
        key=lambda item: item["risk_index"],
        reverse=True
    )
