# Query Params para a cláusula where do Sequelize

Query params são parâmetros que são passados na URL que possui apenas uma estrutura de chave e valor (tudo o que vem após o "?" na url).

```
http://www.seusite.com/pagina?parametro=valorParametro
```

---

Esses parâmetros podem ser usadas de várias formas, e uma delas é a busca de dados no banco. O intuito dessa função é criar uma forma dinâmica para facilitar o backend e o frontend de ter que fazer vários tipos de validações.

## "Problema"

A API precisa informar quais dados podem ser "pesquisados" para os clientes que irão usa-las, tendo sempre que validar e mostrar quais são os campos especificamente na aplicação. Por que não fazer isso de forma dinâmica? Exemplo: um cliente possui os dados nome, sexo e nascimento. Como que eu disponibilizaria um serviço que só busque clientes pelo nome? Eu teria que fazer uma função que recebe o valor a pesquisado e depois retorná-lo:

```js
//UserModel.js
class User extends Model{

    //...
    async static findByName(name){
        // encontra usuários a partir do nome informado no parâmetro através do método de busca do Sequelize
        const users = await this.findAll({ where:{name}})
    }

    async static findByGender(gender){}

    async static findByBirth(birth){}
}
```

Até aí tudo bem, três campos não são muita coisa. Mas agora imagina fazer isso para cada model e pra cada campo? Meio repetitivo né? Até eu resolver criar uma função que resolve isso. Em vez de implementar cada método de pesquisa na API, deixamos a pesquisa para o frontend / cliente implementar, e no backend informamos apenas os campos que são permitidos fazer pesquisas. Exemplo:

- Frontend

  ```js
  //Frontend em react
  // TelaUsuario.js

  //componente React
  function TelaUsuario() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
      async function getusers() {
        // buscando os dados de usuario de acordo com parametros de pesquisa atrabvés da lib Axios
        let users = await api.get("/users", {
          params: {
            nome_like: "Samuel",
            birth_lt: "2019-09-22",
            gender: "male"
          }
        });

        setUsers(users);
      }

      getUsers();
    }, [users]);

    //...
  }
  ```

  Perceba que busco os usuarios que tenham nome Samuel, o nascimento com uma data menor que 22/09/1999 e gênero masculino. Isso no backend seria meio chato de implementar e levaria umas boas linhas de código. Mas não se preocupe, essa função resolve isso.

- Backend

  ```js
  // Backend Node Js + Express e Sequelize
  // UserController.js

  class UserController {
    async index(req, res, next) {
      // pega os parametros que foram passado na URL de requisição
      let { query } = req;

      // define os campos que o cliente pode usar para pesquisar
      let validFiels = ["name", "gender", "birth"];

      // Define as expressões válidas que o cliente pode usar
      let validExpressions = ["lt", "like"];

      try {
        // É aqui que a função entra em ação
        let sequelizeWhereCondition = queryParamsToWhereSequelize(Op, query, {
          validFields,
          validExpressions
        });

        // A função criou um objeto que pode ser usado dentro da expressão where do sequelize.
        let users = await UserModel.findAll({
          where: {
            ...sequelizeWhereCondition
          }
        });
        return res.status(200).json(users);
      } catch (error) {
        // caso o cliente passe algum campo ou expressão inválido ou dê um erro no sequelize  um erro  é lançado

        return next(error);
      }
    }
  }
  ```
