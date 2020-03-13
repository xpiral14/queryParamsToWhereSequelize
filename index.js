import { Op } from "sequelize";
let queryOptions = {
  separator: "_",
  valueSeparator: ","
};

/**
 * Dado um objeto seguindo o padrão de nomeclatura nomeDoCampo_nomDoOperador
 * retorna um objeto que o `sequelize` consegue interpretar como um atributo
 * `where` em uma query
 * @example
 * // {idade: {[Op.gt]: 5}, nome:[Op.like]: 'Samuel Reis'}
 * let whereCondition = {idade_gt: 5, nome_like: 'Samuel Reis'}
 *
 * @param {object} queryParams objeto seguindo o padrao: `{nomeDoCampo_operado: valorDoCampo}`
 */
export default function queryParamToSequelizeQuery(queryParams, options = queryOptions) {
  let queryParamKeys = Object.keys(queryParams);
  let sequelizeQuery = {};

  for (let queryParam of queryParamKeys) {
    let paramValue = queryParams[queryParam];

    let operator = queryParam.includes(options.separator)
      ? queryParam.split(options.separator)[1]
      : null;

    let field = queryParam.split(options.separator)[0];

    sequelizeQuery = { 
      ...sequelizeQuery,
      [field]:
        operator !== null
          ? {
              [Op[operator]]: paramValue.includes(options.valueSeparator)
                ? paramValue.split(options.valueSeparator)
                : paramValue
            }
          : paramValue
    };
  }
  return sequelizeQuery;
}