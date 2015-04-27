namespace NerdsForHire.Services.Models.SQL
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("GitRepository")]
    public partial class GitRepository
    {
        public GitRepository()
        {
            NerdRepositoryJuncs = new HashSet<NerdRepositoryJunc>();
        }

        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Location { get; set; }

        [Required]
        public string Description { get; set; }

        public int Stars { get; set; }

        public virtual ICollection<NerdRepositoryJunc> NerdRepositoryJuncs { get; set; }
    }
}
