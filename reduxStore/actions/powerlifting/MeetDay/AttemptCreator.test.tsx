import { findAttempts } from "./AttemptCreator";

test("create attempts based on past max", () => {
  const maxHistory = {
    records: null,
    max: {
      units: "kg",
      amount: "140",
    },
  };

  expect(findAttempts(maxHistory)).toEqual({
    third: {
      attempt: { units: "kg", weight: 140 },
      status: "pending",
    },
    second: {
      attempt: { units: "kg", weight: 135 },
      status: "pending",
    },
    first: {
      attempt: { units: "kg", weight: 130 },
      status: "pending",
    },
  });
});

test("create attempts based on past max with pounds as max", () => {
  const maxHistory = {
    records: null,
    max: {
      units: "lb",
      amount: "310",
    },
  };

  expect(findAttempts(maxHistory)).toEqual({
    third: {
      attempt: { units: "kg", weight: 140 },
      status: "pending",
    },
    second: {
      attempt: { units: "kg", weight: 135 },
      status: "pending",
    },
    first: {
      attempt: { units: "kg", weight: 130 },
      status: "pending",
    },
  });
});
