#r @"C:\projects\Nerds4Hire\NerdsForHire\packages\FSharp.Data.2.1.1\lib\net40\FSharp.Data.dll"

open FSharp.Data

type repository = {Title: string; Link: string; Description: string; Stars: int}

type context = HtmlProvider<"https://github.com/davevoyles">
let uri = "https://github.com/davevoyles"
let body = context.Load(uri).Html.Body()
let lists = body.Descendants("ul") 
let repositories = lists |> Seq.filter(fun n -> n.HasClass("boxed-group-inner mini-repo-list"))
                            |> Seq.head
let repositories' = repositories.Descendants("li") 
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
                     ) |> Seq.toList

repositories' |> Seq.length
