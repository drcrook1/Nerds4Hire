using NerdsForHire.Services.Models.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace NerdsForHire.Services.Controllers
{
    public class NerdController : ApiController
    {
        // GET: api/Nerd
        public async Task<NerdDomain> Get()
        {
            HttpClient client = new HttpClient();
            var result = await client.GetAsync("http://localhost:56549/api/values/5");
            
            return new NerdDomain(1, result.Content.ToString(), "Crook");
        }

        // GET: api/Nerd/5
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/Nerd
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/Nerd/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Nerd/5
        public void Delete(int id)
        {
        }
    }
}
