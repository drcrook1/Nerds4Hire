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
//using System.Web.Http.Cors;

namespace NerdsForHire.Services.Controllers
{
    public class GitRepositoriesController : ApiController
    {
        private NForHire db = new NForHire();

        // GET: api/GitRepositories
        [Authorize]
        //[EnableCors(origins: "*", headers: "*", methods: "*")]
        public IQueryable<GitRepository> GetGitRepositories()
        {
            return db.GitRepositories;
        }

        // GET: api/GitRepositories/5
        [ResponseType(typeof(GitRepository))]
        public async Task<IHttpActionResult> GetGitRepository(int id)
        {
            GitRepository gitRepository = await db.GitRepositories.FindAsync(id);
            if (gitRepository == null)
            {
                return NotFound();
            }

            return Ok(gitRepository);
        }

        // PUT: api/GitRepositories/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutGitRepository(int id, GitRepository gitRepository)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != gitRepository.Id)
            {
                return BadRequest();
            }

            db.Entry(gitRepository).State = EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GitRepositoryExists(id))
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

        // POST: api/GitRepositories
        [ResponseType(typeof(GitRepository))]
        public async Task<IHttpActionResult> PostGitRepository(GitRepository gitRepository)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.GitRepositories.Add(gitRepository);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = gitRepository.Id }, gitRepository);
        }

        // DELETE: api/GitRepositories/5
        [ResponseType(typeof(GitRepository))]
        public async Task<IHttpActionResult> DeleteGitRepository(int id)
        {
            GitRepository gitRepository = await db.GitRepositories.FindAsync(id);
            if (gitRepository == null)
            {
                return NotFound();
            }

            db.GitRepositories.Remove(gitRepository);
            await db.SaveChangesAsync();

            return Ok(gitRepository);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GitRepositoryExists(int id)
        {
            return db.GitRepositories.Count(e => e.Id == id) > 0;
        }
    }
}