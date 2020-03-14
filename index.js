let queryOptions = {
  /**
   * Caractere que separa o nome do campo da expressão, exemplo:
   * `nome_like`, `nome:like`
   * @type {String}
   * @default -
   */
  keySeparator: "_",
  /**
   * Caractere que separa um valor de outro para criar um array, exemplo: `1,2,3`, `1:2:3`
   * @type {String}
   */
  valueSeparator: ",",
  /**
   * Campos que são permitidos na montagem do objeto
   */
  validFields: [],
  /**
   * Expressões permitidas na montagem da query
   */
  validExpressions: [
    "and",
    "or",
    "eq",
    "ne",
    "is",
    "not",
    "gt",
    "gte",
    "lt",
    "lte",
    "between",
    "notBetween",
    "notLike",
    "startsWith",
    "endsWith",
    "substring",
    "iLike",
    "notILike",
    "regexp",
    "notRegexp",
    "iRegexp",
    "notIRegexp",
    "any"
  ]
};
/**
 * retorna um objeto que o `sequelize` consegue interpretar como um atributo
 * `where` em uma query
 *
 * @param {{}} Op Objeto sequelize que contém as expressões do SQL. Para ele, basta importar o Op de sequelize. `import {Op} from 'sequelize'` ou const {Op} = require('sequelize')
 * @param {object} queryParams objeto que será transformado em um objeto entendido pela cláusula where do sequelize`
 * @param {queryOptions} options objeto que contém algumas configurações para o bom funcionamento da função.
 */
function queryParamToSequelizeQuery(op, queryParams, options = queryOptions) {
  let queryParamKeys = Object.keys(queryParams);
  let sequelizeQuery = {};
  for (let queryParam of queryParamKeys) {
    let operator = queryParam.split(options.keySeparator)[1];
    let field = queryParam.split(options.keySeparator)[0];
    let paramValue = String(queryParams[queryParam]);
    // valida se os campos passados no objeto estão nos campos listados em options
    if (!options.validFields.includes(field))
      throw new Error(`Campo '${field}' não é permitido`);

    // valida se a expressão passada se encontra nas expressões permitidas
    if (!options.validExpressions.includes(operator))
      throw new Error(`Operador '${operator}' não é permitido`);

    sequelizeQuery = {
      ...sequelizeQuery,
      [field]:
        operator !== null
          ? {
              [op[operator]]: paramValue.includes(options.valueSeparator)
                ? paramValue.split(options.valueSeparator)
                : paramValue
            }
          : paramValue
    };
  }
  return sequelizeQuery;
}

