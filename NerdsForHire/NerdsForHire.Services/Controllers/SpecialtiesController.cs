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
    public class SpecialtiesController : ApiController
    {
        private NerdsForHire.Services.Models.SQL.NerdsForHire db = new NerdsForHire.Services.Models.SQL.NerdsForHire();

        // GET: api/Specialties
        public IQueryable<Specialty> GetSpecialties()
        {
            return db.Specialties;
        }

        // GET: api/Specialties/5
        [ResponseType(typeof(Specialty))]
        public async Task<IHttpActionResult> GetSpecialty(int id)
        {
            Specialty specialty = await db.Specialties.FindAsync(id);
            if (specialty == null)
            {
                return NotFound();
            }

            return Ok(specialty);
        }

        // PUT: api/Specialties/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutSpecialty(int id, Specialty specialty)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != specialty.Id)
            {
                return BadRequest();
            }

            db.Entry(specialty).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SpecialtyExists(id))
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

        // POST: api/Specialties
        [HttpPost]
        public async Task<IHttpActionResult> PostSpecialty([FromBody]Specialty specialty)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Specialties.Add(specialty);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (SpecialtyExists(specialty.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = specialty.Id }, specialty);
        }

        // DELETE: api/Specialties/5
        [ResponseType(typeof(Specialty))]
        public async Task<IHttpActionResult> DeleteSpecialty(int id)
        {
            Specialty specialty = await db.Specialties.FindAsync(id);
            if (specialty == null)
            {
                return NotFound();
            }

            db.Specialties.Remove(specialty);
            await db.SaveChangesAsync();

            return Ok(specialty);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool SpecialtyExists(int id)
        {
            return db.Specialties.Count(e => e.Id == id) > 0;
        }
    }
}