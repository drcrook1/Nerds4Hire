using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace NerdsForHire.Services.Models.Domain
{
    public class SpecialtyDomain
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public SpecialtyDomain(int Id, string Name)
        {
            this.Id = Id;
            this.Name = Name;
        }
    }
}