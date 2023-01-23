// Importing the azure storage tables
const { TableServiceClient, TableClient, AzureNamedKeyCredential, odata } = require("@azure/data-tables");
// import { v4 as uuidv4 } from 'uuid';

// Have doubts regarding the CustomIntegration file
class CustomIntegration {
    AccountKey: string;
    AccountName: string;
    Endpoint: string;
    Database: string;
    // private readonly db: TableServiceClient

    constructor() {
        this.AccountKey = "VhzKbYhFCFtgibkefcBZsfNG/ugmhDw4B2Mdf3iV3g/TqZIPu2cjet2nixY0LfImxCXk0nDyA/Bh+AStrcyrCw==";
        this.AccountName = "storagevmxpoc01"
        this.Endpoint = "https://storagevmxpoc01.table.core.windows.net/"
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
            rowKey: "uuidv4",
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

        let entites = conn.listEntities({
            queryOptions: { filter: odata`PartitionKey eq ${partitionKey}` }
        });

        var result: Array<string> = [];
        for (const entity in entites) {
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

var object: CustomIntegration = new CustomIntegration();
object.readAll();