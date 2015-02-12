using NerdsForHire.Services.Models.SQL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace NerdsForHire.Services.Models.Domain
{
    public class DTONerd
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DTOSpecialty Specialty { get; set; }
        public List<string> Tags { get; set; }

        public DTONerd(int Id, string FirstName, string LastName)
        {
            this.Id = Id;
            this.FirstName = FirstName;
            this.LastName = LastName;
        }

        public static Nerd createSQLNerd(DTONerd nerd)
        {
            StringBuilder sb = new StringBuilder();
            foreach(string s in nerd.Tags)
            {
                sb.Append(s);
                sb.Append(",");
            }
            sb.Remove(sb.Length - 2, sb.Length - 1);
            Nerd n = new Nerd();
            n.FirstName = nerd.FirstName;
            n.LastName = nerd.LastName;
            n.Specialty = nerd.Specialty.Id;
            n.TagList = sb.ToString();
            return n;
        }
    }
}