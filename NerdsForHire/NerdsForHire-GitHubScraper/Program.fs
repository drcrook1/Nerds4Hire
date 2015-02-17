// Learn more about F# at http://fsharp.net
// See the 'F# Tutorial' project for more help.
open Microsoft.Azure.WebJobs


let ScrapeGitHub([<QueueTrigger("githubScrapeInput")>]message : string) =
    0

[<EntryPoint>]
let main argv = 
    let host = new JobHost() 
    host.RunAndBlock()
    0 // return an integer exit code
