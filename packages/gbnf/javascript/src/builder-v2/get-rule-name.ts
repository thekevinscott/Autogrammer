export const getRuleName = (rule: string) => {
  let ruleName = rule.toLowerCase().replace(/[^a-z ]+/g, '').split(' ').filter(Boolean).join('-');
  if (ruleName === '') {
    ruleName = 'x';
  }
  if (rule.startsWith('(')) {
    if (rule.includes(' | ')) {
      ruleName += '-alts';
    }
    if (rule.endsWith('?')) {
      ruleName += '-optional';
    }
    if (rule.endsWith('*')) {
      ruleName += '-rpt-zero-up';
    }
    if (rule.endsWith('+')) {
      ruleName += '-rpt-one-up';
    }
  }
  return ruleName;
};
