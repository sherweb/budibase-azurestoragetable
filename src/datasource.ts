import { IntegrationBase } from "@budibase/types"
// Importing the azure storage tables
import { TableServiceClient, TableClient, AzureNamedKeyCredential, odata } from "@azure/data-tables"
import { v4 as uuidv4 } from 'uuid';

type GenericEntity = { [key: string]: any };

// Have doubts regarding the CustomIntegration file
class CustomIntegration implements IntegrationBase {
  private readonly AccountKey: string
  private readonly AccountName: string
  private readonly Endpoint: string
  private readonly Database: string
  // private readonly db: TableServiceClient

  constructor(config: { accountName: string; key: string; endpoint: string; database: string; }) {
    this.AccountKey = config.key;
    this.AccountName = config.accountName
    this.Endpoint = config.endpoint
    this.Database = config.database
  }
  // Request method to create the connection to database
  async request() {
    const endpoint = this.Endpoint;
    const credential = new AzureNamedKeyCredential(
      this.AccountName,
      this.AccountKey
    );

    const tableService = new TableServiceClient(
      endpoint,
      credential
    );
    //  To create table
    await tableService.createTable(this.Database);
    // Client create to integrate with table
    const tableClient = new TableClient(
      endpoint,
      this.Database,
      credential
    );

    return tableClient;
  }

  // Check connection
  async conn() {
    let conn = await this.request()
      .catch((error) => {
        return error
      })

      return console.log("Account Name", this.AccountName, "Account Key", this.AccountKey, "Endpoint", this.Endpoint, "Database", this.Database);

  }

  // Create Entity
  async create(query: { json: object }) {
    const task = {
      partitionKey: "hometasks",
      rowKey: uuidv4(),
      ...query
    };
    const conn = await this.request();
    let result = await conn.createEntity(task)
      .catch((error) => {
        return error
      })
    return "Entity Created"
  }


  // Read Entity
  async read(query: { partitionKey: string, rowKey: string }) {
    const conn = await this.request();
    let result = await conn.getEntity(query.partitionKey, query.rowKey)
      .catch((error) => {
        return error
      });
    return result;
  }

  // Read All Entities
  async readAll() {
    const partitionKey = "hometasks";
    const conn = await this.request();

    let entities = conn.listEntities<GenericEntity>();

    var result: GenericEntity[] = [];
    for await (const entity of entities) {
      result.push(entity)
    }

    return result;

  }

  // Update Entity
  async update(query: { json: object }) {
    const task = {
      partitionKey: "hometasks",
      rowKey: "1",
      description: "take out the trash",
      dueDate: new Date(2015, 6, 20)
    };
    const conn = await this.request();
    let result = await conn.upsertEntity(task, "Replace");
    return result;
  }

  // Delete Entity
  //PartitionKey & RowKey are required
  async delete(query: { json: object }) {
    const conn = await this.request();
    let result = await conn.deleteEntity("hometasks", "1");
    return result;
  }


  // Delete Table
  async deleteTable(query: { json: object }) {
    const conn = await this.request();
    // need to pass the table table
    let result = await conn.deleteTable();
    return result;
  }
}

export default CustomIntegration
