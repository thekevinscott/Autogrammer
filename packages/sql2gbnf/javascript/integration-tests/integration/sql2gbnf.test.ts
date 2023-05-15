import {
  describe,
  test,
  expect,
} from 'vitest';
// import SQL2GBNF from 'sql2gbnf';
import {
  SQL2GBNF,
} from '../../src/sql2gbnf.js';
import GBNF, {
  InputParseError,
  GLOBAL_CONSTANTS as GBNF_GLOBAL_CONSTANTS,
} from 'gbnf';
import { GLOBAL_CONSTANTS } from '../../src/constants/constants.js';
import { NO_SCHEMA_GRAMMAR } from './no-schema-grammar.js';
import { noSchemaTests } from './no-schema-tests.js';

describe('no schema', () => {
  // test('it parses schema to grammar', () => {
  //   const grammar = SQL2GBNF();
  //   expect(grammar).toEqual([
  //     ...NO_SCHEMA_GRAMMAR,
  //     ...GBNF_GLOBAL_CONSTANTS,
  //     ...GLOBAL_CONSTANTS
  //   ].join('\n'));
  // });

  test.each(noSchemaTests)('it parses schema to grammar with input "%s"', (initial) => {
    const grammar = SQL2GBNF();
    // console.log(grammar);
    let parser = GBNF(grammar);
    parser = parser.add(initial.split('\\n').join('\n'));
    expect(parser.size).toBeGreaterThan(0);
  });

  describe('whitespace', () => {
    describe('verbose', () => {

      test('it accepts a SQL query with any whitespace', () => {
        const grammar = SQL2GBNF({
          whitespace: 'verbose',
        });
        let parser = GBNF(grammar);
        const initial = `SELECT first_name, \n last_name \n FROM \n employees \n WHERE   department \n = 'Sales';`;
        parser = parser.add(initial);
        expect(parser.size).toBeGreaterThan(0);
      });

      test.each([
        `select foo, bar,  froo`,
        'SELECT foo, bar FROM table;',
        `SELECT foo, bar, baz FROM table;`,
        'SELECT col FROM table WHERE col=',
        'SELECT col FROM table WHERE col =1',
        'SELECT col FROM table WHERE col =1;',
        `SELECT first_name,last_name`,
        `SELECT first_name,\\t last_name,fo\\n`,
        `SELECT first_name, \\n last_name FROM \\n f \\t f1 WHERE x>`,
        `SELECT first_name, last_name FROM f f1 WHERE \\t x >1`,
        `SELECT first_name, \\n last_name FROM f \\n f1 WHERE x > 1 LIMIT 0,1`,
        `select fooy as foo,bary as bar from table`,
        'SELECT foo,bar,baz FROM table where foo = 1 and bar = "bar" AND baz = \'baz\' order by bar desc limit 2, 5;',
        `SELECT conference FROM p JOIN foo ON foo.school_name=p.school_name`,
        `SELECT order_id FROM orders HAVING SUM(oi.quantity * oi.unit_price)>'2023-12-31'`,
        `SELECT order_id FROM orders HAVING SUM(oi.quantity * oi.unit_price)>500`,
        `SELECT order_id, COUNT(*) FROM orders GROUP BY order_id HAVING foo="foo";`,
        `SELECT employee_id, salary, SUM(salary) OVER() AS total_salary FROM salaries;`,
      ])('it accepts any missing whitespace: %s', (initial) => {
        const grammar = SQL2GBNF({
          whitespace: 'verbose',
        });
        let parser = GBNF(grammar);
        parser = parser.add(initial.split('\\n').join('\n').split('\\t').join('\t'));
        expect(parser.size).toBeGreaterThan(0);
      });
    })

    describe('default', () => {
      test.each([
        `SELECT first_name, last_name FROM employees WHERE department = 'Sales';`,
        `SELECT first_name, COUNT(age) FROM employees WHERE department = 'Sales';`,
      ])('it accepts a SQL query with singular whitespace', (initial) => {
        const grammar = SQL2GBNF({
          whitespace: 'default',
        });
        let parser = GBNF(grammar);
        parser = parser.add(initial);
        expect(parser.size).toBeGreaterThan(0);
      });

      test.each([
        [`SELECT first_name,last_name`, 18],
        [`SELECT first_name, last_name,fo`, 29],
        [`SELECT first_name, last_name FROM f f1 WHERE x>`, 46],
        [`SELECT first_name, last_name FROM f f1 WHERE x >1`, 48],
        [`SELECT first_name, last_name FROM f f1 WHERE x > 1 LIMIT 0,1`, 59],
      ])('it rejects unnecessary whitespace: %s', (initial, errorPos) => {
        const grammar = SQL2GBNF({
          whitespace: 'default',
        });
        let parser = GBNF(grammar);
        expect(() => parser.add(initial)).toThrowError(new InputParseError(initial, errorPos));
      });
    })

    describe('succinct', () => {
      test.each([
        'SELECT col FROM table WHERE col IN ("foo","bar")',
        'SELECT col FROM table WHERE col in ("foo","bar")',
        'SELECT col FROM table WHERE col in ("foo","bar",\'baz\')',
        `SELECT first_name,last_name FROM employees WHERE department='Sales';`,
        `SELECT SUM(foo+bar) FROM orders`,
        `SELECT employee_id,salary,LEAD(salary,1) OVER(ORDER BY employee_id) AS next_salary`,
        `SELECT employee_id,salary,LEAD(salary,1) OVER(ORDER BY employee_id) AS next_salary,LAG(salary,1) OVER(ORDER BY employee_id) AS previous_salary FROM salaries;`,
      ])('it accepts a SQL query without whitespace', (initial) => {
        const grammar = SQL2GBNF({
          whitespace: 'succinct',
        });
        // console.log(grammar)
        let parser = GBNF(grammar);
        parser = parser.add(initial);
        expect(parser.size).toBeGreaterThan(0);
      });

      test.each([
        [`SELECT first_name, last_name`, 18],
        [`SELECT first_name,last_name, fo`, 28],
        [`SELECT first_name,last_name FROM f f1 WHERE x >`, 46],
        [`SELECT first_name,last_name FROM f f1 WHERE x> `, 46],
        [`SELECT first_name,last_name FROM f f1 WHERE x>1 LIMIT 0, `, 54],
      ])('it rejects unnecessary whitespace: %s', (initial, errorPos) => {
        const grammar = SQL2GBNF({
          whitespace: 'succinct',
        });
        let parser = GBNF(grammar);
        expect(() => parser.add(initial)).toThrowError(new InputParseError(initial, errorPos));
      });
    })

  })

  test.each([
    ['1', 0],
    ['select;', 6],
    ['select 1', 7],
    ['select .', 7],
  ])('it rejects %s for a non-schema', (_initial, errorPos) => {
    const grammar = SQL2GBNF();
    let parser = GBNF(grammar);
    const initial = _initial.split('\\n').join('\n');
    expect(() => parser.add(initial)).toThrowError(new InputParseError(initial, errorPos));
  });

  describe('Cases', () => {
    describe('Upper case', () => {
      const grammar = SQL2GBNF({
        whitespace: 'verbose',
        case: 'upper',
      });
      test('it only accepts uppercase SQL keywords', () => {
        const initial = `SELECT order_id FROM orders
        WHERE o.order_date BETWEEN '2023-01-01' AND '2023-12-31'
        GROUP BY o.order_id, o.order_date, c.customer_name 
        HAVING SUM(oi.quantity * oi.unit_price) > 500 
        ORDER BY total_amount DESC;`;
        let parser = GBNF(grammar);
        parser = parser.add(initial);
        expect(parser.size).toBeGreaterThan(0);
      });

      test('it rejects lowercase SQL keywords', () => {
        const initial = `select order_id from orders
        where o.order_date between '2023-01-01' and '2023-12-31'
        group by o.order_id, o.order_date, c.customer_name 
        having sum(oi.quantity * oi.unit_price) > 500 
        order by total_amount desc;`;
        let parser = GBNF(grammar);
        expect(() => parser.add(initial)).toThrowError(new InputParseError(initial, 0));
      });
    });

    describe('Lower case', () => {
      const grammar = SQL2GBNF({
        case: 'lower',
        whitespace: 'verbose',
      });
      test('it only accepts uppercase SQL keywords', () => {
        const initial = `select order_id from orders
        where o.order_date between '2023-01-01' and '2023-12-31'
        group by o.order_id, o.order_date, c.customer_name 
        having sum(oi.quantity * oi.unit_price) > 500 
        order by total_amount desc;`;
        let parser = GBNF(grammar);
        parser = parser.add(initial);
        expect(parser.size).toBeGreaterThan(0);
      });

      test('it rejects lowercase SQL keywords', () => {
        const initial = `SELECT order_id FROM orders
        WHERE o.order_date BETWEEN '2023-01-01' AND '2023-12-31'
        GROUP BY o.order_id, o.order_date, c.customer_name 
        HAVING SUM(oi.quantity * oi.unit_price) > 500 
        ORDER BY total_amount DESC;`;
        let parser = GBNF(grammar);
        expect(() => parser.add(initial)).toThrowError(new InputParseError(initial, 0));
      });
    });
  })
});
