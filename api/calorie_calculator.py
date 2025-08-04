def estimate_calories(weight_lifted_kg, reps, sets, body_weight_kg=None):
    """
    Estimates calories burned during weightlifting.
    Based on approximate metabolic cost per rep and weight.
    """
    base_factor = 0.1  # Estimated coefficient (calories per kg lifted)
    multiplier = 0.035  # Adjusts for intensity

    total_weight_moved = weight_lifted_kg * reps * sets
    calories = base_factor * total_weight_moved * multiplier

    # Optional adjustment based on body weight
    if body_weight_kg:
        calories *= (body_weight_kg / 70)  # normalize to avg body weight

    return round(calories, 2)


def main():
    print("🏋️ Calorie Burn Estimator (Strength Training) 🧮")

    try:
        weight = float(input("Enter weight lifted (kg): "))
        reps = int(input("Enter number of reps per set: "))
        sets = int(input("Enter number of sets: "))
        body_weight = input("Enter your body weight (kg, optional): ")

        if body_weight.strip() == "":
            body_weight = None
        else:
            body_weight = float(body_weight)

        calories = estimate_calories(weight, reps, sets, body_weight)
        print(f"\n🔥 Estimated Calories Burned: {calories} kcal\n")

    except ValueError:
        print("❌ Please enter valid numbers.")


if __name__ == "__main__":
    main()
