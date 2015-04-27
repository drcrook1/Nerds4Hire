namespace NerdsForHire.Services.Models.SQL
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("NerdRepositoryJunc")]
    public partial class NerdRepositoryJunc
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }

        public int? NerdId { get; set; }

        public int RepositoryId { get; set; }

        public virtual GitRepository GitRepository { get; set; }

        public virtual Nerd Nerd { get; set; }
    }
}
