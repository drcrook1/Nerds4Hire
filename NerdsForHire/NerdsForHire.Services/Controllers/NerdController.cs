using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using NerdsForHire.Services.Models.SQL;

namespace NerdsForHire.Services.Controllers
{
    public class NerdController : ApiController
    {
        private NerdsForHire.Services.Models.SQL.NerdsForHire db = new NerdsForHire.Services.Models.SQL.NerdsForHire();

        // GET: api/Nerd
        public IQueryable<Nerd> GetNerds()
        {
            return db.Nerds;
        }

        // GET: api/Nerd/5
        [ResponseType(typeof(Nerd))]
        public async Task<IHttpActionResult> GetNerd(int id)
        {
            Nerd nerd = await db.Nerds.FindAsync(id);
            if (nerd == null)
            {
                return NotFound();
            }

            return Ok(nerd);
        }

        // PUT: api/Nerd/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutNerd(int id, Nerd nerd)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != nerd.Id)
            {
                return BadRequest();
            }

            db.Entry(nerd).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NerdExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Nerd
        [ResponseType(typeof(Nerd))]
        public async Task<IHttpActionResult> PostNerd(Nerd nerd)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Nerds.Add(nerd);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (NerdExists(nerd.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = nerd.Id }, nerd);
        }

        // DELETE: api/Nerd/5
        [ResponseType(typeof(Nerd))]
        public async Task<IHttpActionResult> DeleteNerd(int id)
        {
            Nerd nerd = await db.Nerds.FindAsync(id);
            if (nerd == null)
            {
                return NotFound();
            }

            db.Nerds.Remove(nerd);
            await db.SaveChangesAsync();

            return Ok(nerd);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool NerdExists(int id)
        {
            return db.Nerds.Count(e => e.Id == id) > 0;
        }
    }
}