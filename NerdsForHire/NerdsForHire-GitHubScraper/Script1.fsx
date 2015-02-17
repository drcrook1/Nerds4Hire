#r @"C:\projects\Nerds4Hire\NerdsForHire\packages\FSharp.Data.2.1.1\lib\net40\FSharp.Data.dll"

open FSharp.Data

type repository = {Title: string; Link: string; Description: string; Stars: int}

type context = HtmlProvider<"https://github.com/davevoyles">
let uri = "https://github.com/drcrook1"
let body = context.Load(uri).Html.Body()
printfn("PRINTING REPOSITORIES")
let lists = body.Descendants("ul") 
let repositories = lists |> Seq.filter(fun n -> n.HasClass("boxed-group-inner mini-repo-list"))
                            |> Seq.head
let repositories' = repositories.Descendants("li") |> Seq.head
let repositories'' = repositories'.Descendants("a") |> Seq.head
//                    |> Seq.map(fun x -> 
//                                let els = x.Descendants("a") |> Seq.toList
//                                let repoName = els.[0].InnerText()
//                                repoName)
//                    |> Seq.iter(fun x -> printf "%s" x)

