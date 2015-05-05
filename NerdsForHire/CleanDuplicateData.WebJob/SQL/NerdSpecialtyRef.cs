namespace CleanDuplicateData.WebJob.SQL
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("NerdSpecialtyRef")]
    public partial class NerdSpecialtyRef
    {
        public int NerdId { get; set; }

        public int SpecialtyId { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }

        public virtual Nerd Nerd { get; set; }

        public virtual Specialty Specialty { get; set; }
    }
}
