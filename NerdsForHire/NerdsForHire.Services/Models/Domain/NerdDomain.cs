using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace NerdsForHire.Services.Models.Domain
{
    public class NerdDomain
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public SpecialtyDomain Specialty { get; set; }
        public List<string> Tags { get; set; }

        public NerdDomain(int Id, string FirstName, string LastName)
        {
            this.Id = Id;
            this.FirstName = FirstName;
            this.LastName = LastName;
        }
    }
}