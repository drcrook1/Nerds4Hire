namespace CleanDuplicateData.WebJob.SQL
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class NerdsContext : DbContext
    {
        public NerdsContext()
            : base("name=NerdsContext")
        {
        }

        public virtual DbSet<GitRepository> GitRepositories { get; set; }
        public virtual DbSet<Job> Jobs { get; set; }
        public virtual DbSet<Nerd> Nerds { get; set; }
        public virtual DbSet<NerdRepositoryJunc> NerdRepositoryJuncs { get; set; }
        public virtual DbSet<NerdSpecialtyRef> NerdSpecialtyRefs { get; set; }
        public virtual DbSet<Specialty> Specialties { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GitRepository>()
                .HasMany(e => e.NerdRepositoryJuncs)
                .WithRequired(e => e.GitRepository)
                .HasForeignKey(e => e.RepositoryId)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<Nerd>()
                .HasMany(e => e.Jobs)
                .WithOptional(e => e.Nerd)
                .HasForeignKey(e => e.AssignedNerd);

            modelBuilder.Entity<Nerd>()
                .HasMany(e => e.NerdSpecialtyRefs)
                .WithRequired(e => e.Nerd)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<Specialty>()
                .HasMany(e => e.Nerds)
                .WithRequired(e => e.Specialty1)
                .HasForeignKey(e => e.Specialty)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<Specialty>()
                .HasMany(e => e.NerdSpecialtyRefs)
                .WithRequired(e => e.Specialty)
                .WillCascadeOnDelete(false);
        }
    }
}
