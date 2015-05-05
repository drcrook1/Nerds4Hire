namespace CleanDuplicateData.WebJob.SQL
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Nerd")]
    public partial class Nerd
    {
        public Nerd()
        {
            Jobs = new HashSet<Job>();
            NerdRepositoryJuncs = new HashSet<NerdRepositoryJunc>();
            NerdSpecialtyRefs = new HashSet<NerdSpecialtyRef>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public string LastName { get; set; }

        public int Specialty { get; set; }

        [Required]
        public string TagList { get; set; }

        public string githubId { get; set; }

        public virtual ICollection<Job> Jobs { get; set; }

        public virtual Specialty Specialty1 { get; set; }

        public virtual ICollection<NerdRepositoryJunc> NerdRepositoryJuncs { get; set; }

        public virtual ICollection<NerdSpecialtyRef> NerdSpecialtyRefs { get; set; }
    }
}
