namespace NerdsForHire.Services.Models.SQL
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class NerdsForHire : DbContext
    {
        public NerdsForHire()
            : base("name=NerdsForHire")
        {
        }

        public virtual DbSet<Nerd> Nerds { get; set; }
        public virtual DbSet<Specialty> Specialties { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Specialty>()
                .HasMany(e => e.Nerds)
                .WithRequired(e => e.Specialty1)
                .HasForeignKey(e => e.Specialty)
                .WillCascadeOnDelete(false);
        }

    }
}
