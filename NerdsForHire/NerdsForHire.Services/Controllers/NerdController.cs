using NerdsForHire.Services.Models.Domain;
using NerdsForHire.Services.Models.SQL;
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
        // GET: api/Nerd/5
        public async Task<IHttpActionResult> Get(int id)
        {
            try
            {
                NerdsForHire.Services.Models.SQL.NerdsForHire context = new Models.SQL.NerdsForHire();
                Nerd n = await context.Nerds.FindAsync(id);
                NerdDomain nPrime = new NerdDomain(n.Id, n.FirstName, n.LastName);
                nPrime.Specialty = new SpecialtyDomain(n.Specialty1.Id, n.Specialty1.Name);
                return Ok(nPrime);
            }
            catch (Exception e)
            {
                return NotFound();
            }
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
