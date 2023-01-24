import { IntegrationBase } from "@budibase/types"
// Importing the azure storage tables
import { TableServiceClient, TableClient, AzureNamedKeyCredential, odata, TableEntity } from "@azure/data-tables"
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

    return conn;

  }

  // Create Entity
  async create(query: { json: TableEntity }) {
    if (!query.json.partitionKey) {
      throw new Error("Partition Key is Required!")
    }
    if (!query.json.rowKey) {
      throw new Error("Row Key is Required!")
    }
    const conn = await this.request();
    let result = await conn.createEntity<TableEntity>(query.json)
      .catch((error) => {
        return error
      })

    return result;
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
    const conn = await this.request();

    let entities = conn.listEntities<GenericEntity>();

    var result: GenericEntity[] = [];
    for await (const entity of entities) {
      result.push(entity)
    }

    return result;

  }

  // Update Entity
  async update(query: { json: TableEntity }) {
    if (!query.json.partitionKey) {
      throw new Error("Partition Key is Required!")
    }
    if (!query.json.rowKey) {
      throw new Error("Row Key is Required!")
    }
    const conn = await this.request();
    let result = await conn.upsertEntity<TableEntity>(query.json);
    return result;
  }

  // Delete Entity
  //PartitionKey & RowKey are required
  async delete(query: { json: TableEntity }) {
    if (!query.json.partitionKey) {
      throw new Error("Partition Key is Required!")
    }
    if (!query.json.rowKey) {
      throw new Error("Row Key is Required!")
    }
    const conn = await this.request();
    let result = await conn.deleteEntity(query.json.partitionKey, query.json.rowKey);
    return result;
  }

  // Advanced Query to list the items based on the query
  async advancedQuery(query: { queryString: string }) {

    const conn = await this.request();
    let entities = conn.listEntities({
      queryOptions: {
        filter: odata`${query.queryString}`
      }
    });
    var result: GenericEntity[] = [];
    for await (const entity of entities) {
      result.push(entity)
    }
    return result;
  }

  // Delete Table
  async deleteTable() {
    const conn = await this.request();
    // need to pass the table table
    let result = await conn.deleteTable();
    return result;
  }
}

export default CustomIntegration
