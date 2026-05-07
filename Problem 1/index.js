function sum_to_n_for(n) {
  let total = 0;

  // Adds each number from 1 to n.
  for (let i = 1; i <= n; i++) {
    total += i;
  }

  return total;
}

function sum_to_n_while(n) {
  let total = 0;
  let i = 1;

  // Does the same repeated addition using a while loop.
  while (i <= n) {
    total += i;
    i++;
  }

  return total;
}

function sum_to_n_formula(n) {
  // Uses the arithmetic series formula: 1 + 2 + ... + n.
  return (n * (n + 1)) / 2;
}

