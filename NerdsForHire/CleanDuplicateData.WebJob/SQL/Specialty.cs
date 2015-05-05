namespace CleanDuplicateData.WebJob.SQL
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("Specialty")]
    public partial class Specialty
    {
        public Specialty()
        {
            Nerds = new HashSet<Nerd>();
            NerdSpecialtyRefs = new HashSet<NerdSpecialtyRef>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [Required]
        public string Description { get; set; }

        public virtual ICollection<Nerd> Nerds { get; set; }

        public virtual ICollection<NerdSpecialtyRef> NerdSpecialtyRefs { get; set; }
    }
}
