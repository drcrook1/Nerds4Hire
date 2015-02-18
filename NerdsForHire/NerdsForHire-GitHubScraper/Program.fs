open Microsoft.Azure.WebJobs
open FSharp.Data
open FSharp.Data.Sql
open Microsoft.WindowsAzure

type repository = {Title: string; Link: string; Description: string; Stars: int}
type context = HtmlProvider<"https://github.com/davevoyles">
type sqlContext = SqlDataProvider<ConnectionString = @"Server=tcp:nerds4hire-server.database.windows.net,1433;Database=nerds4hire-db;
                                                        User ID=drcrook@nerds4hire-server;Password=David1234!;
                                                        Trusted_Connection=False;Encrypt=True;Connection Timeout=30;" , 
                                                        UseOptionTypes = true>
let scrapePage(gitId : string) = 
    let uri = "https://github.com/" + gitId
    let body = context.Load(uri).Html.Body()
    let lists = body.Descendants("ul") 
    let repositories = lists |> Seq.filter(fun n -> n.HasClass("boxed-group-inner mini-repo-list"))
                                |> Seq.head
    repositories.Descendants("li") 
        |> Seq.map(fun repos ->
                    repos.Descendants("a") 
                    |> Seq.map(fun n -> 
                                {
                                Title = n.Elements().[1].InnerText();
                                Link = n.AttributeValue("href");
                                Description = n.Elements().[3].InnerText();
                                Stars = n.Elements().[2].InnerText().AsInteger()
                                }
                        ) |> Seq.head
                    )
let ScrapeGitHub([<QueueTrigger("githubScrapeInput")>]message : string) =
    let repositories = scrapePage(message)
    let dataContext = sqlContext.GetDataContext()
    repositories |> Seq.iter(fun r ->
                                dataContext.``[dbo].[GitRepository]``.Create(r.Description, r.Link, r.Stars, r.Title) |> ignore
                            )
    dataContext.SubmitUpdates()

[<EntryPoint>]
let main argv = 
    let _dashboardConn = @"DefaultEndpointsProtocol=https;AccountName=nerdsforhirestorage;AccountKey=iqFlEAh3ZkXbU6AMbbtgH11o0PHyNslMFWbNqRQ4jD7OqK7lVClZ7RLJgTaA1TL9v/t/w2W0FoeEIpUBUmHZVw=="//CloudConfigurationManager.GetSetting("AzureWebJobsDashboard")
    let _storageConn = @"DefaultEndpointsProtocol=https;AccountName=nerdsforhirestorage;AccountKey=iqFlEAh3ZkXbU6AMbbtgH11o0PHyNslMFWbNqRQ4jD7OqK7lVClZ7RLJgTaA1TL9v/t/w2W0FoeEIpUBUmHZVw=="//CloudConfigurationManager.GetSetting("AzureWebJobsStorage")
    let config = new JobHostConfiguration()
    config.DashboardConnectionString <- _dashboardConn
    config.StorageConnectionString <- _storageConn
    let host = new JobHost(config) 
    host.RunAndBlock()
    0 // return an integer exit code
