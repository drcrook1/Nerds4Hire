using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace NerdsForHire.Services.Models.Domain
{
    public class DTOSpecialty
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public DTOSpecialty(int Id, string Name)
        {
            this.Id = Id;
            this.Name = Name;
        }
    }
}