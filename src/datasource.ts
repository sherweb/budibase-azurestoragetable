import { IntegrationBase } from "@budibase/types"
// Importing the azure storage tables
import { TableServiceClient, TableClient, AzureNamedKeyCredential, odata } from "@azure/data-tables"

// Have doubts regarding the CustomIntegration file
class CustomIntegration implements IntegrationBase {
  private readonly AccountKey: string
  private readonly AccountName: string
  private readonly Endpoint: string
  private readonly Database: string
  // private readonly db: TableServiceClient

  constructor(config: { accountKey: string; key: string; endpoint: string; }) {
    this.AccountKey = config.accountKey;
    this.AccountName = config.key
    this.Endpoint = config.endpoint
    this.Database = "vbmcustomers"
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

  // Create Entity
  async create(query: { json: object }) {
    const task = {
      partitionKey: "hometasks",
      rowKey: "1",
      description: "take out the trash",
      dueDate: new Date(2015, 6, 20)
    };
    const conn = await this.request();
    let result = await conn.createEntity(task);
    return result;
  }


  // Read Entity
  async read(query: { queryString: string }) {
    const conn = await this.request();
    let result = await conn.getEntity("hometasks", "1")
      .catch((error) => {
        console.log(error, "Something Went Wrong")
      });
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
