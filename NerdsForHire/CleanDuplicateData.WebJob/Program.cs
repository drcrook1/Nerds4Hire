using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using CleanDuplicateData.WebJob.SQL;

namespace CleanDuplicateData.WebJob
{
    // To learn more about Microsoft Azure WebJobs SDK, please see http://go.microsoft.com/fwlink/?LinkID=320976
    public class Program
    {
        // Please set the following connection strings in app.config for this WebJob to run:
        // AzureWebJobsDashboard and AzureWebJobsStorage
        static void Main()
        {
            //var host = new JobHost();
            //// The following code ensures that the WebJob will be running continuously
            //host.RunAndBlock();
            NerdsContext db = new NerdsContext();
            var result = db.GitRepositories.ToList();
            for(int i = 0; i < result.Count - 2; i++)
            {
                for(int j = i + 1; j < result.Count - 1; j++)
                {
                    GitRepository repo1 = result[i];
                    GitRepository repo2 = result[j];
                    if(repo1.Location.CompareTo(repo2.Location) == 0)
                    {
                        db.GitRepositories.Remove(repo1);
                    }
                }
            }
            try
            {
                db.SaveChanges();
            }
            catch(Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }
    }
}
