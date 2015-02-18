using System;
using System.Web;
using System.Web.Optimization;

namespace NerdsForHire.Services
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/Content/css").Include(
            "~/Content/bootstrap.css",
            "~/Content/site.css",
            "~/WinJS/css/ui-dark.min.css"));

            string[] angularBundle = new string[2] { "~/scripts/vendor/angular/angular.min.js", "~/scripts/vendor/angular/angular-ui-router.min.js" };

            bundles.Add(new ScriptBundle("~/bundles/angular").Include(angularBundle));
            bundles.Add(new ScriptBundle("~/bundles/Nerds4Hire")
                .IncludeDirectory("~/scripts/factories", "*.js")
                .Include(new string[1] { "~/scripts/app.module.js" })
                .IncludeDirectory("~/scripts/controllers", "*.js")

            );
            BundleTable.EnableOptimizations = false;

        }
    }
}
