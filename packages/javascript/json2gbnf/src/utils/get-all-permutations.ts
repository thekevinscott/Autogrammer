export const getAllPermutations = (array: string[], required: string[] = []): string[][] => {
  const result: string[][] = [];

  function generate(current: string[], remaining: string[]) {
    if (current.length > 0) {
      result.push([...current,]);
    }
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      generate(current, remaining.slice(0, i).concat(remaining.slice(i + 1)));
      current.pop();
    }
  }

  generate([], array);
  if (required.length === 0) {
    return result;
  }
  const filteredPermutations = result.filter(permutation => {
    let valid = true;
    for (const key of required) {
      if (!permutation.includes(key)) {
        valid = false;
        break;
      }
    }
    return valid;
  });
  return filteredPermutations;
};
