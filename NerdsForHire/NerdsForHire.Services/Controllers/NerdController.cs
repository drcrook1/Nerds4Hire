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
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Auth;
using Microsoft.WindowsAzure.Storage.Queue;
using Microsoft.WindowsAzure;

namespace NerdsForHire.Services.Controllers
{
    public class GameSaveStructure { }
    public class NerdController : ApiController
    {
        private NForHire db = new NForHire();

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
        [HttpPost]
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

        [ResponseType(typeof(bool))]
        [HttpPost]
        public async Task<IHttpActionResult> Scrape(Nerd nerd)
        {
            try
            {
                CloudStorageAccount storageAccount = CloudStorageAccount.Parse(@"DefaultEndpointsProtocol=https;AccountName=nerdsforhirestorage;AccountKey=iqFlEAh3ZkXbU6AMbbtgH11o0PHyNslMFWbNqRQ4jD7OqK7lVClZ7RLJgTaA1TL9v/t/w2W0FoeEIpUBUmHZVw==");
                CloudQueueClient queueClient = storageAccount.CreateCloudQueueClient();
                // Retrieve a reference to a queue
                CloudQueue queue = queueClient.GetQueueReference("githubscrapeinput");
                // Create the queue if it doesn't already exist
                queue.CreateIfNotExists();
                // Create a message and add it to the queue.
                CloudQueueMessage message = new CloudQueueMessage(nerd.githubId);
                await queue.AddMessageAsync(message);
                //new
            }
            catch(Exception e)
            {
                return Ok(false);
            }
            return Ok(true);
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