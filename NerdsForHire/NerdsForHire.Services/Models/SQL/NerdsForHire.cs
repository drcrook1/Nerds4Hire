namespace NerdsForHire.Services.Models.SQL
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class NerdsForHire : DbContext
    {
        public NerdsForHire()
            : base("name=NerdsForHire1")
        {
        }

        public virtual DbSet<Job> Jobs { get; set; }
        public virtual DbSet<Nerd> Nerds { get; set; }
        public virtual DbSet<NerdSpecialtyRef> NerdSpecialtyRefs { get; set; }
        public virtual DbSet<Specialty> Specialties { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
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
