import CalculateMax, {
  convertToKG,
  convertToLB,
  round,
  averages,
} from "~/helpers/Calculations";

describe("Testing calculations used for rounding and converting weights", () => {
  test("converts pounds to kilograms", () => {
    const value = convertToKG(10);
    expect(value).toBe(5);
  });

  test("Converts kilograms to pounds", () => {
    const value = convertToLB(10);
    expect(value).toBe(25);
  });

  test("Rounds to the nearest given step", () => {
    const value = round(3.4, 2.5);
    expect(value).toBe(2.5);
  });

  test("Takes array and finds the average number", () => {
    const average = [5, 4, 7];
    const value = averages(average);
    expect(value).toBe(5.35);
  });

  test("Calculates a range of weights to estimate 1 rep max", () => {
    const value = CalculateMax({ weight: 400, reps: 5, rpe: 9, units: "kg" });
    expect(value).toStrictEqual([467.5, 480]);
  });
});
